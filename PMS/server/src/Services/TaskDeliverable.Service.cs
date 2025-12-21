using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;


public class TaskDeliverableService
{
    protected readonly PMSDbContext dbContext;
    protected readonly FeedbackService feedbackService;

    public TaskDeliverableService(PMSDbContext dbContext, FeedbackService feedbackService)
    {
        this.dbContext = dbContext;
        this.feedbackService = feedbackService;
    }

    public async Task<GetTaskDeliverablesDTO> GetStagedDeliverable(long userID, long projectID, long taskID)
    {
        var result = await dbContext.Tasks
            .Where(t => t.TaskID == taskID && t.ProjectID == projectID && t.Project.StudentID == userID)
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
                TaskID = t.TaskID
            } : null)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Staged Deliverable Not Found!");

        return result;
    }

    public async Task<GetTaskDeliverablesDTO> GetSubmittedDeliverable(long userID, long projectID, long taskID)
    {
        var result = await dbContext.Tasks.Where(t =>
                t.TaskID == taskID &&
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
                TaskID = t.TaskID
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
        var task = await dbContext.Tasks.Where(t =>
            t.TaskID == taskID &&
                t.ProjectID == projectID &&
                    t.Project.StudentID == userID)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Task Not Found!");

        var deliverable = new Deliverable
        {
            File = fileData,
            Filename = filename,
            ContentType = contentType,
            SubmissionTimestamp = DateTime.UtcNow,
            TaskID = taskID,
            SubmittedByID = userID
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
                t.TaskID == taskID &&
                    t.ProjectID == projectID &&
                         t.Project.StudentID == userID)
            .Include(t => t.StagedDeliverable)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Task Not Found!");

        if (task.StagedDeliverable == null)
            throw new InvalidOperationException("Staged Deliverable Not Found!");

        var deliverable = task.StagedDeliverable;
        task.StagedDeliverableID = null;
        dbContext.Deliverables.Remove(deliverable);

        await dbContext.SaveChangesAsync();
    }

    /*
        Changes the staged deliverable to submitted deliverable and updates the task
        status to completed
    */
    public async Task SubmitStagedDeliverable(long userID, long projectID, long taskID)
    {
        var task = await dbContext.Tasks.Where(t =>
                t.TaskID == taskID &&
                    t.ProjectID == projectID &&
                        t.Project.StudentID == userID)
                .Include(t => t.StagedDeliverable)
                .Include(t => t.SubmittedDeliverable)
                .FirstOrDefaultAsync()
                ?? throw new UnauthorizedAccessException("Unauthorized or Task Not Found.");

        if (task.StagedDeliverable == null)
            throw new InvalidOperationException("Staged Deliverable Not Found!");

        if (task.SubmittedDeliverable != null &&
                task.SubmittedDeliverable.FeedbackCriterias.Count > 0 &&
                    !feedbackService.AreCriteriaMet(task.SubmittedDeliverable.FeedbackCriterias))
            throw new InvalidOperationException("Not All Feedback Criteria Met!");

        task.SubmittedDeliverableID = task.StagedDeliverableID;
        task.StagedDeliverableID = null;
        task.Status = "Completed";

        await dbContext.SaveChangesAsync();
    }

    public async Task ValidateSubmittedDeliverableAgainstFeedback()
    {
        // await feedbackService.AIFeedbackComplianceCheck();
    }
}