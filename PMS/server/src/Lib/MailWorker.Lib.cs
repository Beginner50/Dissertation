using Microsoft.EntityFrameworkCore.Metadata.Internal;
using PMS.Services;

public class MailWorker : BackgroundService
{
    private readonly MailService mailService;
    private readonly IServiceProvider serviceProvider;
    private readonly ILogger<MailWorker> logger;

    public MailWorker(
        MailService mailService,
        IServiceProvider serviceProvider,
        ILogger<MailWorker> logger)
    {
        this.mailService = mailService;
        this.serviceProvider = serviceProvider;
        this.logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await mailService.DequeueAndSendMail(stoppingToken);
                logger.LogInformation("Email sent successfully in background.");
            }
            catch (OperationCanceledException) { }
            catch (Exception)
            {
                logger.LogError("Error occurred while sending email in background.");
            }
        }
    }
}