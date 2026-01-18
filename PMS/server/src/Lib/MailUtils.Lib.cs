using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace PMS.Lib;

/*
    SMTP defines a process for exchanging data between a mail client and a mail server.

    Hence, in order to be able to send mails, the mail client must be created first and
    connected with the mail server.

    To avoid the hassle of setting up and configuring a mail server, my personal mail account
    will be used as the mail server. However, since there is a rate limit imposed on the account,
    a dedicated mail server should be used instead for production.
*/
public static class MailUtils
{
    public static async Task SendMail(string to, string subject, string body)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Project Management System", "noreply@pms.com"));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        message.Body = new TextPart("html") { Text = body };

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.office365.com", 587, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync("prashant_pms@outlook.com", "uzjhizltcowpqiie");
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}