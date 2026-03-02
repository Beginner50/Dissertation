using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Services;


public class AIWorker : BackgroundService
{
    private readonly AIService AIService;
    private readonly IServiceProvider serviceProvider;
    private readonly ILogger<AIWorker> logger;

    public AIWorker(AIService AIService, IServiceProvider serviceProvider, ILogger<AIWorker> logger)
    {
        this.AIService = AIService;
        this.serviceProvider = serviceProvider;
        this.logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                var job = await AIService.DequeueJob(cancellationToken);
                using (var scope = serviceProvider.CreateScope())
                {
                    var feedbackService = scope.ServiceProvider.GetRequiredService<FeedbackService>();

                    // Note: To create different AI Job logic, add a type field to AIJob and use a switch here
                    await feedbackService.ExecuteJobAndUpdateFeedbackCriteria(job);
                }
                logger.LogInformation("AI Compliance Succesful!");
            }
            catch (OperationCanceledException) { }
            catch (Exception)
            {
                logger.LogError("Error occurred");
                throw;
            }
        }
    }
}