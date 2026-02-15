using Microsoft.EntityFrameworkCore.Metadata.Internal;
using PMS.Services;

public class MailWorker : BackgroundService
{
    private readonly IServiceProvider serviceProvider;
    private readonly ILogger<MailWorker> logger;

    public MailWorker(IServiceProvider serviceProvider, ILogger<MailWorker> logger)
    {
        this.serviceProvider = serviceProvider;
        this.logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = serviceProvider.CreateScope())
                {
                    var mailService = scope.ServiceProvider.GetRequiredService<MailService>();
                    await mailService.DequeueAndSendMail(stoppingToken);
                }
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