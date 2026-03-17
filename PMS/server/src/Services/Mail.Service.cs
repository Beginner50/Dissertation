using System.Net;
using System.Net.Mail;
using System.Threading.Channels;
using PMS.Models;
using UglyToad.PdfPig.Logging;

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
    TASK_COMPLIANCE_CHECK_COMPLETION,
    TASK_UPDATED,
    TASK_DELETED,
    MEETING_SCHEDULED,
    MEETING_CANCELLED,
    MEETING_ACCEPTED,
    MEETING_REJECTED,
}

public class MailQueue
{
    private readonly Channel<MailMessage> queue;

    public MailQueue()
    {
        queue = Channel.CreateUnbounded<MailMessage>();
    }

    public void QueueMail(MailMessage message)
    {
        queue.Writer.TryWrite(message);
    }

    public async Task<MailMessage> DequeueMail(CancellationToken cancellationToken)
    {
        return await queue.Reader.ReadAsync(cancellationToken);
    }
}

public class MailService
{
    private ILogger<MailService> logger;
    private readonly MailQueue mailQueue;
    private readonly string mailAccount;
    private readonly string mailPassword;
    private readonly bool disableMail;

    private static readonly string MailFooter = """
        <span style="color: red;"> This is an automated reminder from Project Management System (PMS).
        Please do not reply to this email.</span><br/><br/>
    """;

    public MailService(MailQueue mailQueue, string mailAccount, string mailPassword, bool disableMail, ILogger<MailService> logger)
    {
        this.mailQueue = mailQueue;
        this.mailAccount = mailAccount;
        this.mailPassword = mailPassword;
        this.disableMail = disableMail;
        this.logger = logger;
    }

    public void CreateAndEnqueueMeetingMail(User organizer, User attendee, Meeting meeting, MailType mailType)
    {
        var mail = new MailMessage();

        var sanitizedMeetingDescription = Sanitization.SanitizeString(meeting.Description ?? "");
        var sanitizedAttendeeName = Sanitization.SanitizeString(attendee.Name);
        var sanitizedOrganizerName = Sanitization.SanitizeString(organizer.Name);

        mail.From = new MailAddress("noreply@pms.com", "Project Management System");

        switch (mailType)
        {
            case MailType.MEETING_SCHEDULED:
                var description = meeting.Description == null || meeting.Description == ""
                                         ? "" :
                                         $"Meeting Description:<br/> <span color='gray'><{sanitizedMeetingDescription}</span><br/><br/>";

                mail.Subject = "FYP: New Meeting Scheduled";
                mail.Body = $"""
                    Dear {sanitizedAttendeeName},<br/><br/>

                    You have a new meeting scheduled with {sanitizedOrganizerName}.<br/><br/>

                    {description}

                    <b>Meeting Start Time:</b> {meeting.Start.ToLocalTime()}<br/>
                    <b>Meeting End Time:</b> {meeting.End.ToLocalTime()}<br/><br/>

                    {MailFooter}
                    """;
                mail.IsBodyHtml = true;
                mail.To.Add(new MailAddress(meeting.Attendee.Email));
                break;
            case MailType.MEETING_ACCEPTED:
                mail.Subject = "FYP: Meeting Accepted";
                mail.Body = $"""
                    Dear {sanitizedOrganizerName},<br/><br/>

                    {sanitizedAttendeeName} has accepted the meeting at
                    <b>{meeting.Start.ToLocalTime()}</b> to <b>{meeting.End.ToLocalTime()}</b>
                    with you.<br/><br/>

                    {MailFooter}
                    """;
                mail.IsBodyHtml = true;
                mail.To.Add(new MailAddress(meeting.Organizer.Email));
                break;
            case MailType.MEETING_REJECTED:
                mail.Subject = "FYP: Meeting Rejected";
                mail.Body = $"""
                    Dear {sanitizedOrganizerName},<br/><br/>

                    {sanitizedAttendeeName} has rejected the meeting at
                    <b>{meeting.Start.ToLocalTime()}</b> to <b>{meeting.End.ToLocalTime()}</b>
                    with you.<br/><br/>

                    {MailFooter}
                    """;
                mail.IsBodyHtml = true;
                mail.To.Add(new MailAddress(meeting.Organizer.Email));
                break;
            case MailType.MEETING_CANCELLED:
                mail.Subject = "FYP: Meeting Cancelled";
                mail.Body = $"""
                    Dear {sanitizedAttendeeName},<br/><br/>

                    {sanitizedOrganizerName} has cancelled the meeting at
                    <b>{meeting.Start.ToLocalTime()}<b/> to <b>{meeting.End.ToLocalTime()}</b>
                    with you.<br/><br/>

                    {MailFooter}
                    """;
                mail.IsBodyHtml = true;
                mail.To.Add(new MailAddress(meeting.Attendee.Email));
                break;
        }


        mailQueue.QueueMail(mail);
    }


    public void CreateAndEnqueueTaskMail(User supervisor, User student, ProjectTask task, MailType mailType)
    {
        var mail = new MailMessage();

        var sanitizedTaskDescription = Sanitization.SanitizeString(task.Description ?? "");
        var sanitizedStudentName = Sanitization.SanitizeString(student.Name);
        var sanitizedSupervisorName = Sanitization.SanitizeString(supervisor.Name);
        var sanitizedTaskTitle = Sanitization.SanitizeString(task.Title);

        mail.From = new MailAddress("noreply@pms.com", "Project Management System");
        mail.To.Add(new MailAddress(student.Email));

        switch (mailType)
        {
            case MailType.TASK_ASSIGNED:
                var taskDescription = task.Description == null || task.Description == ""
                                         ? "" :
                                         $"Task Description:<br/> <span color='gray'><{sanitizedTaskDescription}</span><br/><br/>";

                mail.Subject = "FYP: New Task Assigned";
                mail.Body = $"""
                    Dear {sanitizedStudentName},<br/><br/>

                    {sanitizedSupervisorName} has assigned you a new task,
                    <b> {sanitizedTaskTitle} </b><br/><br/>

                    {taskDescription}

                    <b>Task Due Date:</b> {task.DueDate.ToLocalTime()}<br/><br/>

                    {MailFooter}
                    """;
                mail.IsBodyHtml = true;
                break;
            case MailType.TASK_UPDATED:
                mail.Subject = "FYP: Task Updated";
                mail.Body = $"""
                    Dear {sanitizedStudentName},<br/><br/>

                    {sanitizedSupervisorName} has updated the due date for the task,
                    <b>{sanitizedTaskTitle}</b>.<br/><br/>

                    <b>New Task Due Date:</b> {task.DueDate.ToLocalTime()}<br/><br/>

                    {MailFooter}
                    """;
                mail.IsBodyHtml = true;
                break;
            case MailType.TASK_DELETED:
                mail.Subject = "FYP: Task Deleted";
                mail.Body = $"""
                    Dear {sanitizedStudentName},<br/><br/>

                    {sanitizedSupervisorName} has deleted the task, 
                    <b>{sanitizedTaskTitle}</b>.<br/><br/>

                    {MailFooter}
                    """;
                mail.IsBodyHtml = true;
                break;
            case MailType.TASK_COMPLIANCE_CHECK_COMPLETION:
                mail.Subject = "FYP: Compliance Check Completed!";
                mail.Body = $"""
                    Dear {sanitizedStudentName}, <br><br>

                    The AI Feedback Compliance Check has completed. Please review
                    the updated feedback.

                    {MailFooter}
                    """;
                mail.IsBodyHtml = true;
                break;
        }

        mailQueue.QueueMail(mail);
    }

    public async Task DequeueAndSendMail(CancellationToken cancellationToken)
    {
        var mail = await mailQueue.DequeueMail(cancellationToken);
        if (disableMail)
            return;

        using var client = new SmtpClient("smtp.gmail.com", 587)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(mailAccount, mailPassword)
        };
        try
        {
            await client.SendMailAsync(mail, cancellationToken);
            logger.LogInformation("Email sent successfully in background.");
        }
        catch (Exception)
        {
            throw;
        }
    }
}