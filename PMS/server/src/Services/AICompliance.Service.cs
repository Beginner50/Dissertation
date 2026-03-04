using System.Collections.Concurrent;
using System.Reflection.Metadata.Ecma335;
using System.Text.Json;
using System.Threading.Channels;
using Google.GenAI;
using Google.GenAI.Types;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;
using Type = Google.GenAI.Types.Type;

namespace PMS.Services;

public class AIJobQueue
{
    private readonly Channel<AIJob> Queue;
    private readonly ConcurrentDictionary<long, string> JobStatusMap;

    public AIJobQueue()
    {
        Queue = Channel.CreateUnbounded<AIJob>();
        JobStatusMap = new ConcurrentDictionary<long, string>();
    }

    public void QueueJob(AIJob job)
    {
        Queue.Writer.TryWrite(job);
        JobStatusMap[job.JobID] = "queued";
    }

    public async Task<AIJob> DequeueJob(CancellationToken cancellationToken)
    {
        var AIJob = await Queue.Reader.ReadAsync(cancellationToken);
        JobStatusMap[AIJob.JobID] = "processing";

        return AIJob;
    }
    public void SetJobStatus(long jobID, string status)
    {
        JobStatusMap[jobID] = status;
    }

    public string GetJobStatus(long jobID)
    {
        if (JobStatusMap.TryGetValue(jobID, out var status))
        {
            return status;
        }
        return "unknown";
    }

    public void ClearMapEntry(long jobID)
    {
        JobStatusMap.Remove(jobID, out _);
    }
}


public class AIComplianceService
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

    private readonly PMSDbContext dbContext;
    private readonly Client client;
    private readonly AIJobQueue AIProcessingQueue;
    private readonly ProjectTaskService projectTaskService;
    private readonly FeedbackService feedbackService;
    private readonly NotificationService notificationService;
    private readonly MailService mailService;
    private readonly ILogger<AIComplianceService> logger;

    public AIComplianceService(
        PMSDbContext dbContext,
        Client client,
        AIJobQueue AIProcessingQueue,
        ProjectTaskService projectTaskService,
        FeedbackService feedbackService,
        NotificationService notificationService,
        MailService mailService,
        ILogger<AIComplianceService> logger)
    {
        this.dbContext = dbContext;
        this.client = client;
        this.AIProcessingQueue = AIProcessingQueue;
        this.projectTaskService = projectTaskService;
        this.feedbackService = feedbackService;
        this.notificationService = notificationService;
        this.mailService = mailService;
        this.logger = logger;
    }

    protected async Task<T?> ExecuteAIJob<T>(AIJob job)
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
            return JsonSerializer.Deserialize<T>(text);
        }
        catch (JsonException e)
        {
            logger.LogError(e, "Failed to deserialize AI response for Job {JobId}. Raw text: {RawText}", job.JobID, text);
            throw;
        }
    }

    public async Task CreateAndEnqueueAIComplianceJob(long userID, long projectID, long taskID)
    {
        var task = await projectTaskService.GetProjectTask(
                  userID,
                  projectID,
                  taskID,
                  selector: t => t,
                  taskQueryExtension: t => t.Include(t => t.SubmittedDeliverable)
                                            .Include(t => t.StagedDeliverable)
                                            .Include(t => t.FeedbackCriterias)
              );

        if (task.StagedDeliverable == null || task.SubmittedDeliverable == null)
            throw new Exception("Staged Or Submitted Deliverable Not Found!");
        if (task.FeedbackCriterias == null || task.FeedbackCriterias.Count == 0)
            throw new UnauthorizedAccessException("Prior Feedback Criteria Not Found!");

        var unmetFeedbackCriteria = task.FeedbackCriterias.Where(c => c.Status == "unmet");
        var previousDeliverable = task.SubmittedDeliverable.File;
        var newDeliverable = task.StagedDeliverable.File;

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
                {string.Join("\n", unmetFeedbackCriteria
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

    public async Task ExecuteAIComplianceJob(AIJob job)
    {
        var updatedFeedbackCriteria = await ExecuteAIJob<List<UpdateFeedbackCriterionDTO>>(job)
                ?? throw new Exception("Could Not Obtain AI Feedback!");

        var task = await projectTaskService.GetProjectTask(
                                              job.JobID,
                                              selector: t => t,
                                              taskQueryExtension: q => q.Include(t => t.Project)
                                                                            .ThenInclude(p => p.Supervisor)
                                                                        .Include(t => t.Project)
                                                                            .ThenInclude(p => p.Student)
                                          );

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                await feedbackService.EditFeedbackCriteria(job.JobID, updatedFeedbackCriteria);
                await notificationService.CreateTaskNotification(
                                          supervisor: task.Project.Supervisor,
                                          student: task.Project.Student,
                                          task: task,
                                          NotificationType.TASK_COMPLIANCE_CHECK_COMPLETION
                                      );
                mailService.CreateAndEnqueueTaskMail(
                                        supervisor: task.Project.Supervisor,
                                        student: task.Project.Student,
                                        task: task,
                                        MailType.TASK_COMPLIANCE_CHECK_COMPLETION
                                    );

                await transaction.CommitAsync();

                AIProcessingQueue.SetJobStatus(job.JobID, "completed");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                AIProcessingQueue.SetJobStatus(job.JobID, "failed");
                throw;
            }
        }
    }

    public string PollAIComplianceJob(long taskID)
    {
        var status = AIProcessingQueue.GetJobStatus(taskID);
        if (status == "completed" || status == "failed")
            AIProcessingQueue.ClearMapEntry(taskID);

        return status;
    }
}