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
    private readonly PMSDbContext dbContext;
    private readonly FeedbackService feedbackService;
    private readonly NotificationService notificationService;
    private readonly ReminderService reminderService;
    private readonly ILogger<TaskDeliverableService> logger;

    public TaskDeliverableService(
        PMSDbContext dbContext,
        FeedbackService feedbackService,
        NotificationService notificationService,
        ReminderService reminderService,
        ILogger<TaskDeliverableService> logger
    )
    {
        this.dbContext = dbContext;
        this.feedbackService = feedbackService;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
        this.logger = logger;
    }

    public async Task<GetTaskDeliverablesDTO> GetStagedDeliverable(long userID, long projectID, long taskID)
    {
        var result = await dbContext.Tasks
            .Where(t => t.ProjectTaskID == taskID && t.ProjectID == projectID
                    && t.Project.StudentID == userID)
            .Select(t => t.StagedDeliverable != null ? new GetTaskDeliverablesDTO
            {
                DeliverableID = t.StagedDeliverable.DeliverableID,
                Filename = t.StagedDeliverable.Filename,
                SubmissionTimestamp = t.StagedDeliverable.SubmissionTimestamp,
                SubmittedBy = new UserLookupDTO
                {
                    UserID = t.StagedDeliverable.SubmittedBy.UserID,
                    Name = t.StagedDeliverable.SubmittedBy.Name,
                    Email = t.StagedDeliverable.SubmittedBy.Email,
                    IsDeleted = t.StagedDeliverable.SubmittedBy.IsDeleted
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
                       (t.Project.StudentID == userID || t.Project.SupervisorID == userID)
            )
            .Select(t => t.SubmittedDeliverable != null ? new GetTaskDeliverablesDTO
            {
                DeliverableID = t.SubmittedDeliverable.DeliverableID,
                Filename = t.SubmittedDeliverable.Filename,
                SubmissionTimestamp = t.SubmittedDeliverable.SubmissionTimestamp,
                SubmittedBy = new UserLookupDTO
                {
                    UserID = t.SubmittedDeliverable.SubmittedBy.UserID,
                    Name = t.SubmittedDeliverable.SubmittedBy.Name,
                    Email = t.SubmittedDeliverable.SubmittedBy.Email,
                    IsDeleted = t.SubmittedDeliverable.SubmittedBy.IsDeleted
                },
                TaskID = t.ProjectTaskID,
            } : null)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Submitted Deliverable Not Found!");

        return result;
    }

    public async Task<FileDTO> GetStagedDeliverableFile(long userID, long projectID, long taskID)
    {
        var result = await dbContext.Tasks
            .Where(t => t.ProjectTaskID == taskID && t.ProjectID == projectID &&
                         t.Project.StudentID == userID)
            .Select(t => t.StagedDeliverable != null ? new FileDTO
            {
                Filename = t.StagedDeliverable.Filename,
                File = t.StagedDeliverable.File,
                ContentType = t.StagedDeliverable.ContentType
            } : null)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Staged Deliverable Not Found!");
        return result;
    }

    public async Task<FileDTO> GetSubmittedDeliverableFile(long userID, long projectID, long taskID)
    {
        var result = await dbContext.Tasks.Where(t =>
                t.ProjectTaskID == taskID &&
                    t.ProjectID == projectID &&
                     (t.Project.StudentID == userID || t.Project.SupervisorID == userID))
            .Select(t => t.SubmittedDeliverable != null ? new FileDTO
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
                    t.Project.StudentID == userID &&
                        t.Project.Status != "archived")
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
                         t.Project.StudentID == userID &&
                            t.Project.Status != "archived")
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

    public async Task SubmitStagedDeliverable(long userID, long projectID, long taskID)
    {
        var task = await dbContext.Tasks
                .Where(t =>
                        t.ProjectTaskID == taskID &&
                        t.ProjectID == projectID &&
                        t.Project.StudentID == userID &&
                        t.Project.Status != "archived")
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
            throw new InvalidOperationException("Submission Disabled For Locked Task!");
        if (task.StagedDeliverable == null)
            throw new InvalidOperationException("Staged Deliverable Not Found!");
        if (task.FeedbackCriterias.Any(c => c.Status == "overriden"))
            throw new InvalidOperationException("Not All Feedback Criteria Met!");

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
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