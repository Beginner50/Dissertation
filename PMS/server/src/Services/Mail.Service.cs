using System.Threading.Channels;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using PMS.Models;

namespace PMS.Services;

/*
    More information at: https://docker-mailserver.github.io/docker-mailserver/latest/introduction/#about-security-ports

    To understand how the mail delivery chain works (sending/receiving mail),
    it is important to understand that there are 3 major components involved:

    1. Mail User Agent (MUA) - 
        This is the email client that the user interacts with to read and send emails.

        Examples include Microsoft Outlook, Mozilla Thunderbird, and web-based clients like Gmail.

    2. Mail Transfer Agent (MTA) -
        This is the server-side software that transfers email messages from one server to 
        another, closer to the final destination of the recipient. It is the "mail server"
        from the MUA's perspective

        It uses SMTP (Simple Mail Transfer Protocol) for sending emails.

        Examples include Postfix 

    3. Mail Delivery Agent (MDA) - 
        This is the software that delivers email messages to the recipient's mailbox.

        The MUA on the recipient's side can use protocols like IMAP (Internet Message
        Access Protocol) or POP3 (Post Office Protocol) for retrieving emails from it.

        Examples include Dovecot

                                                                ┏━━━━━━━┓
        Sending an email:   MUA ---> MTA ---> (MTA relays) ---> ┫ MTA ╮ ┃
        Fetching an email:  MUA <------------------------------ ┫ MDA ╯ ┃
                                                                ┗━━━━━━━┛

    Note:
    The reason why I am using smtp.gmail.com (my personal gmail account) as the
    mail server (encompassing both MTA and MDA) is because setting up a reliable mail server
    whose mails will not be rejected by recipient mail servers (like gmail, outlook, etc)
    requires buying a dedicated IP address, a registered domain and setting up proper 
    DNS records.

    Ideally, the university's mail server should be used for sending mails to students and staff.
*/
public enum MailType
{
    TASK_ASSIGNED,
    TASK_UPDATED,
    TASK_DELETED,
    MEETING_SCHEDULED,
    MEETING_CANCELLED,
    MEETING_ACCEPTED,
    MEETING_REJECTED,
}

public class MailQueue
{
    private readonly Channel<MimeMessage> queue;

    public MailQueue()
    {
        queue = Channel.CreateUnbounded<MimeMessage>();
    }

    public void QueueMail(MimeMessage message)
    {
        if (message == null) return;
        queue.Writer.TryWrite(message);
    }

    public async Task<MimeMessage> DequeueMail(CancellationToken cancellationToken)
    {
        return await queue.Reader.ReadAsync(cancellationToken);
    }
}

public class MailService
{
    private readonly MailQueue mailQueue;
    private readonly string mailAccount;
    private readonly string mailPassword;
    private static readonly string MailFooter = """
        <span style="color: red;"> This is an automated reminder from Project Management System (PMS).
        Please do not reply to this email.</span><br/><br/>
    """;

    public MailService(MailQueue mailQueue, string mailAccount, string mailPassword)
    {
        this.mailQueue = mailQueue;
        this.mailAccount = mailAccount;
        this.mailPassword = mailPassword;
    }

    public void CreateAndEnqueueMeetingMail(Meeting meeting, MailType mailType)
    {
        var mail = new MimeMessage();
        mail.From.Add(new MailboxAddress("Project Management System", "noreply@pms.com"));

        switch (mailType)
        {
            case MailType.MEETING_SCHEDULED:
                var meetingDescription = meeting.Description == null || meeting.Description == ""
                                         ? "" :
                                         $"Meeting Description:<br/> <span color='gray'><{meeting.Description}</span><br/><br/>";

                mail.Subject = "FYP: New Meeting Scheduled";
                mail.Body = new TextPart("html")
                {
                    Text = $"""
                    Dear {meeting.Attendee.Name},<br/><br/>

                    You have a new meeting scheduled with {meeting.Organizer.Name}.<br/><br/>

                    {meetingDescription}

                    <b>Meeting Start Time:</b> {meeting.Start.ToLocalTime()}<br/>
                    <b>Meeting End Time:</b> {meeting.End.ToLocalTime()}<br/><br/>

                    {MailFooter}
                    """
                };
                mail.To.Add(new MailboxAddress("", meeting.Attendee.Email));
                break;
            case MailType.MEETING_ACCEPTED:
                mail.Subject = "FYP: Meeting Accepted";
                mail.Body = new TextPart("html")
                {
                    Text = $"""
                    Dear {meeting.Organizer.Name},<br/><br/>

                    {meeting.Attendee.Name} has accepted the meeting at
                    <b>{meeting.Start.ToLocalTime()}</b> to <b>{meeting.End.ToLocalTime()}</b>
                    with you.<br/><br/>

                    {MailFooter}
                    """
                };
                mail.To.Add(new MailboxAddress("", meeting.Organizer.Email));
                break;
            case MailType.MEETING_REJECTED:
                mail.Subject = "FYP: Meeting Rejected";
                mail.Body = new TextPart("html")
                {
                    Text = $"""
                    Dear {meeting.Organizer.Name},<br/><br/>

                    {meeting.Attendee.Name} has rejected the meeting at
                    <b>{meeting.Start.ToLocalTime()}</b> to <b>{meeting.End.ToLocalTime()}</b>
                    with you.<br/><br/>

                    {MailFooter}
                    """
                };
                mail.To.Add(new MailboxAddress("", meeting.Organizer.Email));
                break;
            case MailType.MEETING_CANCELLED:
                mail.Subject = "FYP: Meeting Cancelled";
                mail.Body = new TextPart("html")
                {
                    Text = $"""
                    Dear {meeting.Attendee.Name},<br/><br/>

                    {meeting.Organizer.Name} has cancelled the meeting at
                    <b>{meeting.Start.ToLocalTime()}<b/> to <b>{meeting.End.ToLocalTime()}</b>
                    with you.<br/><br/>

                    {MailFooter}
                    """
                };
                mail.To.Add(new MailboxAddress("", meeting.Attendee.Email));
                break;
        }


        mailQueue.QueueMail(mail);
    }


    public void CreateAndEnqueueTaskMail(ProjectTask task, MailType mailType)
    {
        var mail = new MimeMessage();
        mail.From.Add(new MailboxAddress("Project Management System", "noreply@pms.com"));
        mail.To.Add(new MailboxAddress("", task.Project.Student.Email));

        switch (mailType)
        {
            case MailType.TASK_ASSIGNED:
                var taskDescription = task.Description == null || task.Description == ""
                                         ? "" :
                                         $"Task Description:<br/> <span color='gray'><{task.Description}</span><br/><br/>";

                mail.Subject = "FYP: New Task Assigned";
                mail.Body = new TextPart("html")
                {
                    Text = $"""
                    Dear {task.Project.Student.Name},<br/><br/>

                    {task.Project.Supervisor.Name} has assigned you a new task,
                    <b> {task.Title} </b><br/><br/>

                    {taskDescription}

                    <b>Task Due Date:</b> {task.DueDate.ToLocalTime()}<br/><br/>

                    {MailFooter}
                    """
                };
                break;
            case MailType.TASK_UPDATED:
                mail.Subject = "FYP: Task Updated";
                mail.Body = new TextPart("html")
                {
                    Text = $"""
                    Dear {task.Project.Student.Name},<br/><br/>

                    {task.Project.Supervisor.Name} has updated the due date for the task,
                    <b>{task.Title}</b>.<br/><br/>

                    <b>New Task Due Date:</b> {task.DueDate.ToLocalTime()}<br/><br/>

                    {MailFooter}
                    """
                };
                break;
            case MailType.TASK_DELETED:
                mail.Subject = "FYP: Task Deleted";
                mail.Body = new TextPart("html")
                {
                    Text = $"""
                    Dear {task.Project.Student.Name},<br/><br/>

                    {task.Project.Supervisor.Name} has deleted the task, 
                    <b>{task.Title}</b>.<br/><br/>

                    {MailFooter}
                    """
                };
                break;
        }

        mailQueue.QueueMail(mail);
    }

    public async Task DequeueAndSendMail(CancellationToken cancellationToken)
    {
        var mail = await mailQueue.DequeueMail(cancellationToken);

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(mailAccount, mailPassword);
            await client.SendAsync(mail);
        }
        catch (Exception e)
        {
            throw;
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }
}