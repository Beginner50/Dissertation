using System.Security;
using System.Text.Json;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Lib;
using PMS.Models;

namespace PMS.Services;


public class TaskDeliverableService
{
    protected readonly PMSDbContext dbContext;
    protected readonly NotificationService notificationService;
    protected readonly ReminderService reminderService;
    protected readonly ILogger<TaskDeliverableService> logger;

    public TaskDeliverableService(
        PMSDbContext dbContext,
        NotificationService notificationService,
        ReminderService reminderService,
        ILogger<TaskDeliverableService> logger
    )
    {
        this.dbContext = dbContext;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
        this.logger = logger;
    }

    public async Task<GetTaskDeliverablesDTO> GetStagedDeliverable(long userID, long projectID, long taskID)
    {
        var result = await dbContext.Tasks
            .Where(t => t.ProjectTaskID == taskID && t.ProjectID == projectID && t.Project.StudentID == userID)
            .Select(t => t.StagedDeliverable != null ? new GetTaskDeliverablesDTO
            {
                DeliverableID = t.StagedDeliverable.DeliverableID,
                Filename = t.StagedDeliverable.Filename,
                SubmissionTimestamp = t.StagedDeliverable.SubmissionTimestamp,
                SubmittedBy = new UserLookupDTO
                {
                    UserID = t.StagedDeliverable.SubmittedBy.UserID,
                    Name = t.StagedDeliverable.SubmittedBy.Name,
                    Email = t.StagedDeliverable.SubmittedBy.Email
                },
                TaskID = t.ProjectTaskID,
            } : null)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Staged Deliverable Not Found!");

        return result;
    }

    public async Task<GetTaskDeliverablesDTO> GetSubmittedDeliverable(long userID, long projectID, long taskID)
    {
        var result = await dbContext.Tasks.Where(t =>
                t.ProjectTaskID == taskID &&
                    t.ProjectID == projectID &&
                       (t.Project.StudentID == userID || t.Project.SupervisorID == userID))
            .Select(t => t.SubmittedDeliverable != null ? new GetTaskDeliverablesDTO
            {
                DeliverableID = t.SubmittedDeliverable.DeliverableID,
                Filename = t.SubmittedDeliverable.Filename,
                SubmissionTimestamp = t.SubmittedDeliverable.SubmissionTimestamp,
                SubmittedBy = new UserLookupDTO
                {
                    UserID = t.SubmittedDeliverable.SubmittedBy.UserID,
                    Name = t.SubmittedDeliverable.SubmittedBy.Name,
                    Email = t.SubmittedDeliverable.SubmittedBy.Email
                },
                TaskID = t.ProjectTaskID,
            } : null)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Submitted Deliverable Not Found!");

        return result;
    }

    public async Task<TaskDeliverableFileDTO> GetStagedDeliverableFile(long userID, long projectID, long taskID)
    {
        var result = await dbContext.Tasks
            .Where(t => t.ProjectTaskID == taskID && t.ProjectID == projectID && t.Project.StudentID == userID)
            .Select(t => t.StagedDeliverable != null ? new TaskDeliverableFileDTO
            {
                Filename = t.StagedDeliverable.Filename,
                File = t.StagedDeliverable.File,
                ContentType = t.StagedDeliverable.ContentType
            } : null)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Staged Deliverable Not Found!");
        return result;
    }

    public async Task<TaskDeliverableFileDTO> GetSubmittedDeliverableFile(long userID, long projectID, long taskID)
    {
        var result = await dbContext.Tasks.Where(t =>
                t.ProjectTaskID == taskID &&
                    t.ProjectID == projectID &&
                     (t.Project.StudentID == userID || t.Project.SupervisorID == userID))
            .Select(t => t.SubmittedDeliverable != null ? new TaskDeliverableFileDTO
            {
                Filename = t.SubmittedDeliverable.Filename,
                File = t.SubmittedDeliverable.File,
                ContentType = t.SubmittedDeliverable.ContentType
            } : null)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Submitted Deliverable Not Found!");

        return result;
    }

    /*
        Creates a new staged deliverable for the task 
    */
    public async Task<Deliverable> UploadDeliverable(
    long userID, long projectID, long taskID,
    byte[] fileData, string filename, string contentType)
    {
        if (!Sanitization.IsValidPdf(fileData))
            throw new SecurityException("File Is Not A Valid PDF!");

        var task = await dbContext.Tasks.Where(t =>
            t.ProjectTaskID == taskID &&
                t.ProjectID == projectID &&
                    t.Project.StudentID == userID)
            .Include(t => t.SubmittedDeliverable)
            .Include(t => t.FeedbackCriterias)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Task Not Found!");

        var deliverable = new Deliverable
        {
            File = fileData,
            Filename = Sanitization.SanitizeFilename(filename),
            ContentType = contentType,
            SubmissionTimestamp = DateTime.UtcNow,
            TaskID = taskID,
            SubmittedByID = userID,
        };

        dbContext.Deliverables.Add(deliverable);
        await dbContext.SaveChangesAsync();

        task.StagedDeliverableID = deliverable.DeliverableID;
        await dbContext.SaveChangesAsync();

        return deliverable;
    }

    public async Task RemoveStagedDeliverable(long userID, long projectID, long taskID)
    {
        var task = await dbContext.Tasks.Where(t =>
                t.ProjectTaskID == taskID &&
                    t.ProjectID == projectID &&
                         t.Project.StudentID == userID)
            .Include(t => t.StagedDeliverable)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Task Not Found!");

        if (task.StagedDeliverable == null)
            throw new InvalidOperationException("Staged Deliverable Not Found!");

        var deliverable = task.StagedDeliverable;
        task.StagedDeliverableID = null;
        dbContext.Deliverables.Remove(deliverable);

        await dbContext.SaveChangesAsync();
    }

    /*
        AsSplitQuery is used to avoid the cartesian explosion problem when including multiple
        collections. For each included collection, EF Core generates a separate query to load
        the related data, which helps to reduce the amount of redundant data being retrieved.
        
        More info: https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries
    */
    public async Task SubmitStagedDeliverable(long userID, long projectID, long taskID)
    {
        var task = await dbContext.Tasks
                .AsSplitQuery()
                .Where(t =>
                    t.ProjectTaskID == taskID &&
                        t.ProjectID == projectID &&
                            t.Project.StudentID == userID)
                .Include(t => t.Project)
                    .ThenInclude(p => p.Student)
                .Include(t => t.Project)
                    .ThenInclude(p => p.Supervisor)
                .Include(t => t.StagedDeliverable)
                .Include(t => t.SubmittedDeliverable)
                .Include(t => t.FeedbackCriterias)
                .FirstOrDefaultAsync()
                ?? throw new UnauthorizedAccessException("Task Not Found.");

        if (task.IsLocked)
            throw new InvalidOperationException("Task Submission disabled for Locked Task!");
        if (task.StagedDeliverable == null)
            throw new InvalidOperationException("Staged Deliverable Not Found!");

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                if (task.FeedbackCriterias.Count > 0)
                {
                    var unmetFeedbackCriteria = task.FeedbackCriterias
                                                    .Where(c => c.Status == "unmet")
                                                    .ToList();
                    foreach (var feedbackCriteria in unmetFeedbackCriteria)
                        feedbackCriteria.Status = "overriden";
                }

                if (task.SubmittedDeliverable != null)
                    dbContext.Deliverables.Remove(task.SubmittedDeliverable);

                task.SubmittedDeliverable = task.StagedDeliverable;
                task.StagedDeliverable = null;

                await dbContext.SaveChangesAsync();

                await notificationService.CreateTaskNotification(task, NotificationType.DELIVERABLE_SUBMITTED);

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}