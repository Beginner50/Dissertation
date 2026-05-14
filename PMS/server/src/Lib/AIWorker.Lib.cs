using System.Collections.Concurrent;
using System.Threading.Channels;
using Google.GenAI.Types;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Services;

namespace PMS.Lib;

public class AIJob
{
    public long JobID { get; set; }
    public required Content Content { get; set; }
    public required GenerateContentConfig Config { get; set; }
    public string Response { get; set; } = "";
}

public class AIJobQueue
{
    private readonly Channel<AIJob> Queue;
    private readonly IDistributedCache cache;

    public AIJobQueue(IDistributedCache cache)
    {
        Queue = Channel.CreateUnbounded<AIJob>();
        this.cache = cache;
    }

    public async Task QueueJob(AIJob job)
    {
        Queue.Writer.TryWrite(job);
        await cache.SetRecord($"job-status:{job.JobID}", "queued", TimeSpan.FromMinutes(15));
    }

    public async Task<AIJob> DequeueJob(CancellationToken cancellationToken)
    {
        var job = await Queue.Reader.ReadAsync(cancellationToken);
        await cache.SetRecord($"job-status:{job.JobID}", "processing", TimeSpan.FromMinutes(15));

        return job;
    }

    public async Task SetJobStatus(long jobID, string status)
    {
        await cache.SetRecord($"job-status:{jobID}", status, TimeSpan.FromMinutes(15));
    }

    public async Task<string> GetJobStatus(long jobID)
    {
        return await cache.GetRecord<string>($"job-status:{jobID}") ?? "unknown";
    }

    public async Task DeleteJobStatusRecord(long jobID)
    {
        await cache.RemoveAsync($"job-status:{jobID}");
    }
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
