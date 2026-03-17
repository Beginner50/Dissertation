using System.Linq.Expressions;
using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Routing.Matching;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Lib;
using PMS.Models;

namespace PMS.Services;

public class ProjectTaskService
{
    private readonly ILogger logger;
    private readonly ProjectService projectService;
    private readonly MailService mailService;
    private readonly ReminderService reminderService;
    private readonly PMSDbContext dbContext;
    public ProjectTaskService(
        ILogger<ProjectTaskService> logger,
        PMSDbContext dbContext,
        ProjectService projectService,
        MailService mailService,
        ReminderService reminderService)
    {
        this.logger = logger;
        this.dbContext = dbContext;
        this.projectService = projectService;
        this.mailService = mailService;
        this.reminderService = reminderService;
    }

    // DO NOT USE: Reserved For AI Compliance
    public async Task<T> GetProjectTask<T>(
            long taskID,
            Expression<Func<ProjectTask, T>> selector,
            Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null
        )
    {
        IQueryable<ProjectTask> query = dbContext.Tasks
            .Where(t => t.ProjectTaskID == taskID);
        query = taskQueryExtension?.Invoke(query) ?? query;

        return await query
            .Select(selector)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Task Not Found!");
    }

    public async Task<T> GetProjectTask<T>(
        long userID, long projectID, long taskID,
        Expression<Func<ProjectTask, T>> selector,
        Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null,
        Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null
    )
    {
        IQueryable<Project> projectQuery = dbContext.Projects
                            .NotArchived()
                            .ContainsMember(userID);
        projectQuery = projectQueryExtension?.Invoke(projectQuery) ?? projectQuery;

        IQueryable<ProjectTask> query = dbContext.Tasks
            .Where(t => t.ProjectTaskID == taskID && t.ProjectID == projectID)
            .Where(t => projectQuery.Any(p => p.ProjectID == t.ProjectID));
        query = taskQueryExtension?.Invoke(query) ?? query;

        return await query
            .Select(selector)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Task Not Found!");
    }

    public async Task<(IEnumerable<T> tasks, long count)>
        GetProjectTasksWithCount<T>(
            long userID, long projectID,
            Expression<Func<ProjectTask, T>> selector,
            long limit = 5, long offset = 0,
            Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null,
            Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null
        )
    {
        IQueryable<Project> projectQuery = dbContext.Projects
                                                .NotArchived()
                                                .ContainsMember(userID);
        projectQuery = projectQueryExtension?.Invoke(projectQuery) ?? projectQuery;

        var query = dbContext.Tasks
                        .Where(t => t.ProjectID == projectID)
                        .Where(t => projectQuery.Any(p => p.ProjectID == t.ProjectID))
                        .OrderByDescending(t => t.DueDate);

        var count = await query.LongCountAsync();

        var tasks = await query
            .Select(selector)
            .Skip((int)offset)
            .Take((int)limit)
            .ToListAsync();

        return (tasks, count);
    }

    public async Task<ProjectTask> CreateProjectTask(
        long userID, long projectID, string title, string? description,
        DateTime dueDate
    )
    {
        if (dueDate < DateTime.Now)
            throw new Exception("Invalid Due Date!");

        var project = await projectService.GetProject(
                userID,
                projectID,
                selector: p => p,
                queryExtension: p => p.ContainsSupervisor(userID)
                                      .Include(p => p.Student)
                                      .Include(p => p.Supervisor)
            );

        ProjectTask newTask;
        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                newTask = new ProjectTask
                {
                    Title = title,
                    Description = description ?? string.Empty,
                    DueDate = dueDate,
                    AssignedByID = userID,
                    ProjectID = projectID,
                    Project = project,
                    IsLocked = false,
                };

                dbContext.Tasks.Add(newTask);
                await dbContext.SaveChangesAsync();

                await reminderService.CreateTaskReminder(
                    project.Supervisor!, project.Student!, newTask);
                mailService.CreateAndEnqueueTaskMail(
                    project.Supervisor!, project.Student!, newTask, MailType.TASK_ASSIGNED);

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        return newTask;
    }

    // Note: Fetching Project & Task can be consolidated into one query, but left as it is for readability
    public async Task EditProjectTask(
        long userID, long projectID, long taskID, string? title,
        string? description, DateTime? dueDate, bool? isLocked
    )
    {
        if (dueDate < DateTime.Now)
            throw new Exception("Invalid Due Date!");

        var project = await projectService.GetProject(
            userID,
            projectID,
            selector: p => p,
            queryExtension: p => p.Include(p => p.Student)
                                  .Include(p => p.Supervisor)
        );

        var task = await GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            taskQueryExtension: t => t.Where(t => t.AssignedByID == userID)
        );

        bool dueDateUpdated = false;
        using var transaction = await dbContext.Database.BeginTransactionAsync();
        try
        {
            task.Title = title ?? task.Title;
            task.Description = description ?? task.Description;
            if (dueDate != null && dueDate != task.DueDate)
            {
                task.DueDate = dueDate.Value;
                dueDateUpdated = true;
            }
            task.IsLocked = isLocked ?? task.IsLocked;

            await dbContext.SaveChangesAsync();

            if (dueDateUpdated)
            {
                await reminderService.UpdateTaskReminder(task);
                mailService.CreateAndEnqueueTaskMail(
                    project.Supervisor!, project.Student!, task, MailType.TASK_UPDATED);
            }

            await transaction.CommitAsync();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }


    public async Task DeleteProjectTask(long userID, long projectID, long taskID)
    {
        var project = await projectService.GetProject(
            userID,
            projectID,
            selector: p => p,
            queryExtension: p => p.Include(p => p.Supervisor)
                                  .Include(p => p.Student)
        );

        var task = await GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            taskQueryExtension: t => t.Where(t => t.AssignedByID == userID)
        );

        if (task.SubmittedDeliverableID != null)
            throw new Exception("Cannot Delete Task with Submission!");

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                if (task.StagedDeliverableID != null)
                {
                    var stagedDeliverableID = task.StagedDeliverableID;
                    task.StagedDeliverableID = null;
                    await dbContext.Deliverables.Where(d => d.DeliverableID == stagedDeliverableID)
                                                .ExecuteDeleteAsync();
                }

                mailService.CreateAndEnqueueTaskMail(
                    project.Supervisor!, project.Student!, task, MailType.TASK_DELETED);

                dbContext.Remove(task);
                await dbContext.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public static string GetProjectTaskStatus(bool hasSubmission, DateTime dueDate)
    {
        if (hasSubmission)
            return "completed";
        else if (dueDate < DateTime.UtcNow)
            return "missing";
        else
            return "pending";
    }
}