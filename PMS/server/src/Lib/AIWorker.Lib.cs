using System.Collections.Concurrent;
using Google.GenAI.Types;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Services;

public class AIJob
{
    public long JobID { get; set; }
    public Content Content { get; set; }
    public GenerateContentConfig Config { get; set; }
    public string Response { get; set; }
}

public class AIWorker : BackgroundService
{
    private readonly AIJobQueue AIJobQueue;
    private readonly IServiceProvider serviceProvider;
    private readonly ILogger<AIWorker> logger;

    public AIWorker(AIJobQueue AIJobQueue, IServiceProvider serviceProvider, ILogger<AIWorker> logger)
    {
        this.AIJobQueue = AIJobQueue;
        this.serviceProvider = serviceProvider;
        this.logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                var job = await AIJobQueue.DequeueJob(cancellationToken);
                using (var scope = serviceProvider.CreateScope())
                {
                    var AIComplianceService = scope.ServiceProvider.GetRequiredService<AIComplianceService>();

                    await AIComplianceService.ExecuteAIComplianceJob(job);
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