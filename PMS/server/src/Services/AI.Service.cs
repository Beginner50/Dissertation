using System.Collections.Concurrent;
using System.Reflection.Metadata.Ecma335;
using System.Text.Json;
using System.Threading.Channels;
using Google.GenAI;
using Google.GenAI.Types;
using Newtonsoft.Json.Linq;
using PMS.DTOs;
using PMS.Models;
using Type = Google.GenAI.Types.Type;

namespace PMS.Services;

public class AIJobQueue
{
    private readonly Channel<AIJob> queue;
    private readonly ConcurrentDictionary<long, string> jobStatusMap;

    public AIJobQueue()
    {
        queue = Channel.CreateUnbounded<AIJob>();
        jobStatusMap = new ConcurrentDictionary<long, string>();
    }

    public void QueueJob(AIJob job)
    {
        queue.Writer.TryWrite(job);
        jobStatusMap[job.JobID] = "queued";
    }

    public async Task<AIJob> DequeueJob(CancellationToken cancellationToken)
    {
        var AIJob = await queue.Reader.ReadAsync(cancellationToken);
        jobStatusMap[AIJob.JobID] = "processing";

        return AIJob;
    }

    public string GetJobStatus(long jobID)
    {
        if (jobStatusMap.TryGetValue(jobID, out var status))
        {
            return status;
        }
        return "unknown";
    }

    public void MarkJobCompleted(long jobID)
    {
        jobStatusMap[jobID] = "completed";
    }

    public void ClearStatusEntry(long jobID)
    {
        jobStatusMap.Remove(jobID, out _);
    }
}


public class AIService
{
    protected static readonly Schema feedbackCriteriaListSchema = new Schema
    {
        Type = Type.ARRAY,
        Items = new Schema
        {
            Type = Type.OBJECT,
            Properties = new Dictionary<string, Schema> {
                {"FeedbackCriterionID", new Schema{Type=Type.NUMBER}},
                {"Status", new Schema{Type=Type.STRING, Enum=new List<string>{"met", "unmet"}}},
                {"ChangeObserved", new Schema
                    { Type=Type.STRING, Description="What specific change was made between documents?" }},
            },
            Required = new List<string>(["FeedbackCriterionID", "Status", "ChangeObserved"])
        }
    };

    private readonly AIJobQueue AIProcessingQueue;
    private readonly Client client;
    private readonly ILogger<AIService> logger;

    public AIService(
        Client client,
        ILogger<AIService> logger)
    {
        this.client = client;
        this.AIProcessingQueue = new AIJobQueue();
        this.logger = logger;
    }

    public void CreateAndEnqueueAIComplianceJob(
       ProjectTask task,
       byte[] previousDeliverable, byte[] newDeliverable,
       List<FeedbackCriterion> previousCriteria
    )
    {
        var content = new Content
        {
            Role = "user",
            Parts = new List<Part> {
            new Part { Text = $"""
                TASK CONTEXT: {task.Title} - {task.Description}
                
                OBJECTIVE:
                Compare the 'New Deliverable' against the 'Previous Deliverable'. 
                Determine if the following 'unmet' criteria have been addressed.
                
                CRITERIA:
                {string.Join("\n", previousCriteria
                       .Select(c => $"FeedbackCriterionID:{c.FeedbackCriterionID} | Requirement: {c.Description}"))}

                INSTRUCTIONS:
                1. Identify changes between the previous and new version.
                2. If the change satisfies the requirement, set Status to 'met'.
                3. Describe the what was added/removed in 'ChangeObserved'.
                """
            },
            new Part { InlineData = new Blob { MimeType = "application/pdf", Data = previousDeliverable } },
            new Part { InlineData = new Blob { MimeType = "application/pdf", Data = newDeliverable } }
            }
        };
        var config = new GenerateContentConfig
        {
            ResponseMimeType = "application/json",
            ResponseJsonSchema = feedbackCriteriaListSchema,
            Temperature = 0.1f
        };

        var job = new AIJob
        {
            JobID = task.ProjectTaskID,
            Content = content,
            Config = config
        };

        AIProcessingQueue.QueueJob(job);
    }

    public async Task<AIJob> DequeueJob(CancellationToken cancellationToken)
    {
        return await AIProcessingQueue.DequeueJob(cancellationToken);
    }

    public string GetAIComplianceJobStatus(long taskID)
    {
        return AIProcessingQueue.GetJobStatus(taskID);
    }

    public void ClearAIComplianceJobStatus(long taskID)
    {
        AIProcessingQueue.ClearStatusEntry(taskID);
    }

    public async Task<T> DequeueExecuteAIJob<T>(AIJob job)
    {
        var generatedContent = await client.Models.GenerateContentAsync(
                   model: "gemini-2.5-flash",
                   contents: new List<Content> { job.Content },
                   config: job.Config
                );

        var text = generatedContent?.Candidates?[0]?.Content?.Parts?[0].Text ?? "[]";
        logger.LogInformation("AI Response: {AIResponse}", text);

        try
        {
            var deserializedData = JsonSerializer.Deserialize<T>(text);
            AIProcessingQueue.MarkJobCompleted(job.JobID);
            return deserializedData;
        }
        catch (JsonException e)
        {
            logger.LogError(e, "Failed to deserialize AI response for Job {JobId}. Raw text: {RawText}", job.JobID, text);
            throw;
        }
    }
}