using System.Linq.Expressions;
using System.Security;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.Models;

namespace PMS.Services;


public class TaskDeliverableService
{
    private readonly PMSDbContext dbContext;
    private readonly ProjectTaskService projectTaskService;
    private readonly ILogger<TaskDeliverableService> logger;

    public TaskDeliverableService(
        PMSDbContext dbContext,
        ProjectTaskService projectTaskService,
        ILogger<TaskDeliverableService> logger
    )
    {
        this.dbContext = dbContext;
        this.projectTaskService = projectTaskService;
        this.logger = logger;
    }

    public async Task<T> GetStagedDeliverable<T>(
        long studentID, long projectID, long taskID,
        Expression<Func<Deliverable, T>> selector,
        Func<IQueryable<Deliverable>, IQueryable<Deliverable>>? deliverableQueryExtension = null,
        Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null,
        Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null
    )
    {
        var task = await projectTaskService.GetProjectTask(
            studentID,
            projectID,
            taskID,
            selector: t => t,
            projectSupervisionQueryExtension: q => q.ContainsStudent(studentID),
            projectQueryExtension: projectQueryExtension,
            taskQueryExtension: taskQueryExtension
        );

        IQueryable<Deliverable> deliverableQuery = dbContext.Tasks
                    .Where(t => t.ProjectTaskID == task.ProjectTaskID)
                    .Select(t => t.StagedDeliverable!);
        if (deliverableQueryExtension != null)
            deliverableQuery = deliverableQueryExtension(deliverableQuery);

        return await deliverableQuery
            .Select(selector)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Staged Deliverable Not Found!");
    }

    public async Task<T> GetSubmittedDeliverable<T>(
        long userID, long projectID, long taskID,
        Expression<Func<Deliverable, T>> selector,
        Func<IQueryable<Deliverable>, IQueryable<Deliverable>>? deliverableQueryExtension = null,
        Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null,
        Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null
    )
    {
        var task = await projectTaskService.GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            projectQueryExtension: projectQueryExtension,
            taskQueryExtension: taskQueryExtension
        );

        IQueryable<Deliverable> deliverableQuery = dbContext.Tasks
                    .Where(t => t.ProjectTaskID == taskID)
                    .Select(t => t.SubmittedDeliverable!);
        if (deliverableQueryExtension != null)
            deliverableQuery = deliverableQueryExtension(deliverableQuery);

        return await deliverableQuery
            .Select(selector)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Submitted Deliverable Not Found!");
    }

    // Creates a new staged deliverable for the task 
    public async Task<Deliverable> UploadDeliverable(
    long userID, long projectID, long taskID,
    Stream fileStream, string filename, string contentType)
    {
        byte[] fileData;
        using (var ms = new MemoryStream())
        {
            await fileStream.CopyToAsync(ms);
            fileData = ms.ToArray();
        }


        if (!Sanitization.IsValidPdf(fileData))
            throw new SecurityException("File Is Not A Valid PDF!");

        var task = await projectTaskService.GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            projectSupervisionQueryExtension: q => q.ContainsStudent(userID),
            taskQueryExtension: t => t.Include(t => t.SubmittedDeliverable)
                                      .Include(t => t.FeedbackCriterias)
        );

        var deliverable = new Deliverable
        {
            File = fileData,
            Filename = Sanitization.SanitizeFilename(filename),
            ContentType = contentType,
            SubmissionTimestamp = DateTime.UtcNow,
            TaskID = taskID,
            SubmittedByID = userID,
        };

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                dbContext.Deliverables.Add(deliverable);
                await dbContext.SaveChangesAsync();

                task.StagedDeliverableID = deliverable.DeliverableID;
                await dbContext.SaveChangesAsync();

                await transaction.CommitAsync();
                return deliverable;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public async Task RemoveStagedDeliverable(long userID, long projectID, long taskID)
    {

        var task = await projectTaskService.GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            projectSupervisionQueryExtension: q => q.ContainsStudent(userID)
        );

        task.StagedDeliverableID = null;
        await dbContext.Deliverables
                .Where(d => d.DeliverableID == task.StagedDeliverableID)
                .ExecuteDeleteAsync();

        await dbContext.SaveChangesAsync();
    }

    public async Task SubmitStagedDeliverable(long userID, long projectID, long taskID)
    {
        var task = await projectTaskService.GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            projectSupervisionQueryExtension: q => q.ContainsStudent(userID),
            taskQueryExtension: t => t.Include(t => t.FeedbackCriterias)
        );

        if (task.IsLocked)
            throw new InvalidOperationException("Submission Disabled For Locked Task!");
        if (task.StagedDeliverableID == null)
            throw new InvalidOperationException("Staged Deliverable Not Found!");
        if (task.FeedbackCriterias.Any(c => c.Status == "unmet"))
            throw new InvalidOperationException("Not All Feedback Criteria Met!");

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                var previousSubmissionID = task.SubmittedDeliverableID;

                task.SubmittedDeliverableID = task.StagedDeliverableID;
                task.StagedDeliverableID = null;

                await dbContext.SaveChangesAsync();

                if (previousSubmissionID != null)
                    await dbContext.Deliverables
                             .Where(d => d.DeliverableID == previousSubmissionID)
                             .ExecuteDeleteAsync();

                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
            }
        }
    }
}