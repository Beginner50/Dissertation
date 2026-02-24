using System.Linq.Expressions;
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
    private readonly ProjectService projectService;
    private readonly ProjectTaskService projectTaskService;
    private readonly NotificationService notificationService;
    private readonly ReminderService reminderService;
    private readonly ILogger<TaskDeliverableService> logger;

    public TaskDeliverableService(
        PMSDbContext dbContext,
        ProjectService projectService,
        ProjectTaskService projectTaskService,
        NotificationService notificationService,
        ReminderService reminderService,
        ILogger<TaskDeliverableService> logger
    )
    {
        this.dbContext = dbContext;
        this.projectService = projectService;
        this.projectTaskService = projectTaskService;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
        this.logger = logger;
    }

    public async Task<T> GetStagedDeliverable<T>(
        long userID, long projectID, long taskID,
        Expression<Func<Deliverable, T>> selector,
        Func<IQueryable<Deliverable>, IQueryable<Deliverable>>? deliverableQueryExtension = null,
        Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null,
        Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null
    )
    {
        IQueryable<Project> projectQuery = dbContext.Projects
                            .NotArchived()
                            .ContainsMember(userID);
        projectQuery = projectQueryExtension?.Invoke(projectQuery) ?? projectQuery;

        IQueryable<ProjectTask> taskQuery = dbContext.Tasks
                            .Where(t => t.ProjectTaskID == taskID && t.ProjectID == projectID)
                            .Where(t => projectQuery.Any(p => p.ProjectID == t.ProjectID));
        taskQuery = taskQueryExtension?.Invoke(taskQuery) ?? taskQuery;

        IQueryable<Deliverable> deliverableQuery = dbContext.Deliverables
                            .Where(d => taskQuery.Any(t => t.StagedDeliverableID == d.DeliverableID));
        deliverableQuery = deliverableQueryExtension?.Invoke(deliverableQuery) ?? deliverableQuery;

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
        IQueryable<Project> projectQuery = dbContext.Projects
                            .NotArchived()
                            .ContainsMember(userID);
        projectQuery = projectQueryExtension?.Invoke(projectQuery) ?? projectQuery;

        IQueryable<ProjectTask> taskQuery = dbContext.Tasks
                            .Where(t => t.ProjectTaskID == taskID && t.ProjectID == projectID)
                            .Where(t => projectQuery.Any(p => p.ProjectID == t.ProjectID));
        taskQuery = taskQueryExtension?.Invoke(taskQuery) ?? taskQuery;

        IQueryable<Deliverable> deliverableQuery = dbContext.Deliverables
                            .Where(d => taskQuery.Any(t => t.SubmittedDeliverableID == d.DeliverableID));
        deliverableQuery = deliverableQueryExtension?.Invoke(deliverableQuery) ?? deliverableQuery;

        return await deliverableQuery
            .Select(selector)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Submitted Deliverable Not Found!");
    }

    // Creates a new staged deliverable for the task 
    public async Task<Deliverable> UploadDeliverable(
    long userID, long projectID, long taskID,
    byte[] fileData, string filename, string contentType)
    {
        if (!Sanitization.IsValidPdf(fileData))
            throw new SecurityException("File Is Not A Valid PDF!");

        var task = await projectTaskService.GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            taskQueryExtension: t => t.Include(t => t.SubmittedDeliverable)
                                      .Include(t => t.FeedbackCriterias),
            projectQueryExtension: p => p.ContainsStudent(userID)
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

        dbContext.Deliverables.Add(deliverable);
        await dbContext.SaveChangesAsync();

        task.StagedDeliverableID = deliverable.DeliverableID;
        await dbContext.SaveChangesAsync();

        return deliverable;
    }

    public async Task RemoveStagedDeliverable(long userID, long projectID, long taskID)
    {

        var stagedDeliverableID = await GetStagedDeliverable(
            userID,
            projectID,
            taskID,
            selector: t => t.DeliverableID
        );

        await dbContext.Deliverables
                .Where(d => d.DeliverableID == stagedDeliverableID)
                .ExecuteDeleteAsync();

        await dbContext.SaveChangesAsync();
    }

    public async Task SubmitStagedDeliverable(long userID, long projectID, long taskID)
    {
        var project = await projectService.GetProject(
            userID,
            projectID,
            selector: p => p,
            queryExtension: p => p.Include(p => p.Student)
                                  .Include(p => p.Supervisor)
        );

        var task = await projectTaskService.GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            projectQueryExtension: p => p.ContainsStudent(userID),
            taskQueryExtension: t => t.Include(t => t.FeedbackCriterias)
        );

        if (task.IsLocked)
            throw new InvalidOperationException("Submission Disabled For Locked Task!");
        if (task.StagedDeliverableID == null)
            throw new InvalidOperationException("Staged Deliverable Not Found!");
        if (task.FeedbackCriterias.Any(c => c.Status == "overriden"))
            throw new InvalidOperationException("Not All Feedback Criteria Met!");

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                if (task.SubmittedDeliverableID != null)
                    await dbContext.Deliverables
                             .Where(d => d.DeliverableID == task.SubmittedDeliverableID)
                             .ExecuteDeleteAsync();
                task.SubmittedDeliverableID = task.StagedDeliverableID;
                task.StagedDeliverableID = null;

                await dbContext.SaveChangesAsync();

                await notificationService.CreateTaskNotification(
                    project.Supervisor, project.Student, task, NotificationType.DELIVERABLE_SUBMITTED);

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