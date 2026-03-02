using System.Collections.Concurrent;
using PMS.DTOs;
using PMS.Services;


public class AIWorker : BackgroundService
{
    private readonly AIJobQueue AIJobQueue;
    private readonly IServiceProvider serviceProvider;
    private readonly ILogger<AIWorker> logger;

    public AIWorker(IServiceProvider serviceProvider, AIJobQueue AIJobQueue, ILogger<AIWorker> logger)
    {
        this.AIJobQueue = AIJobQueue;
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
                    var aiService = scope.ServiceProvider.GetRequiredService<AIService>();
                    var feedbackService = scope.ServiceProvider.GetRequiredService<FeedbackService>();
                    var job = await AIJobQueue.DequeueJob(stoppingToken);

                    // Note: To create different AI Job logic, add a type field to AIJob and use a switch here
                    await ExecuteAIComplianceCheckJobAndUpdateFeedbackCriteria(
                        job,
                        aiService,
                        feedbackService
                    );
                }
                logger.LogInformation("AI Compliance Succesful!");
            }
            catch (OperationCanceledException) { }
            catch (Exception)
            {
                logger.LogError("Error occurred");
            }
        }
    }

    protected async Task ExecuteAIComplianceCheckJobAndUpdateFeedbackCriteria(
        AIJob job,
        AIService aiService,
        FeedbackService feedbackService
    )
    {
        var feedbackToUpdate = await aiService.DequeueExecuteAIJob<List<UpdateFeedbackCriterionDTO>>(job);
        foreach (var feedback in feedbackToUpdate)
            await feedbackService.EditFeedbackCriterion(
                feedback.FeedbackCriterionID,
                feedback.Description,
                feedback.ChangeObserved
            );
    }
}