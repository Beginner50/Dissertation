using System.Transactions;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;

public class ProjectTaskService
{
    protected readonly NotificationService notificationService;
    protected readonly ReminderService reminderService;
    protected readonly PMSDbContext dbContext;
    public ProjectTaskService(PMSDbContext dbContext, NotificationService notificationService, ReminderService reminderService)
    {
        this.dbContext = dbContext;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
    }

    public async Task<GetProjectTaskDTO> GetProjectTask(long userID, long projectID, long taskID)
    {
        var task = await dbContext.Tasks.Where(
            t => t.ProjectTaskID == taskID &&
                t.ProjectID == projectID &&
                    (t.Project.StudentID == userID || t.Project.SupervisorID == userID)
        ).FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Task Not Found!");

        /*
            If the task has been past its DueDate, update its Status

            While it breaks the idempotency principle for GET requests in REST, the alternative
            requires cron job scheduling for updating the status, which might be overkill for
            this dissertation project (can be suggested as an improvement).
        */
        if (task.DueDate < DateTime.UtcNow && task.Status.Equals("pending"))
            task.Status = "missing";
        await dbContext.SaveChangesAsync();

        return new GetProjectTaskDTO
        {
            TaskID = task.ProjectTaskID,
            Title = task.Title,
            Description = task.Description,
            AssignedDate = task.AssignedDate,
            DueDate = task.DueDate,
            Status = task.Status,
            StagedDeliverableID = task.StagedDeliverableID,
            SubmittedDeliverableID = task.SubmittedDeliverableID
        };
    }

    public async Task<IEnumerable<GetProjectTaskDTO>> GetProjectTasks(long userID, long projectID)
    {
        var tasks = await dbContext.Tasks.Where(
            t => t.ProjectID == projectID &&
                    (t.Project.StudentID == userID || t.Project.SupervisorID == userID)
            ).ToListAsync();

        // See GetTask above for explanation for why GetTasks is not idempotent
        foreach (var task in tasks)
        {
            if (task.DueDate < DateTime.UtcNow && task.Status.Equals("pending"))
                task.Status = "missing";
        }
        await dbContext.SaveChangesAsync();

        return tasks.Select(t => new GetProjectTaskDTO
        {
            TaskID = t.ProjectTaskID,
            Title = t.Title,
            Description = t.Description,
            AssignedDate = t.AssignedDate,
            DueDate = t.DueDate,
            Status = t.Status
        }).OrderByDescending(t => t.DueDate);
    }

    public async Task<ProjectTask> CreateProjectTask(long userID, long projectID, CreateProjectTaskDTO dto)
    {
        var project = await dbContext.Projects.Where(p =>
                p.ProjectID == projectID && p.SupervisorID == userID)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Project Not Found!");

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                var newTask = new ProjectTask
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    DueDate = dto.DueDate,
                    ProjectID = projectID,
                    Status = "pending",
                };

                dbContext.Tasks.Add(newTask);
                await dbContext.SaveChangesAsync();

                await notificationService.CreateTaskNotification(newTask.ProjectTaskID, NotificationType.TASK_CREATED);
                await reminderService.CreateTaskReminder(newTask.ProjectTaskID);

                await transaction.CommitAsync();

                return newTask;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public async Task EditProjectTask(long userID, long projectID, long taskID, EditProjectTaskDTO dto)
    {
        var task = await dbContext.Tasks.FirstOrDefaultAsync(t =>
            t.ProjectTaskID == taskID && t.ProjectID == projectID && t.Project.SupervisorID == userID)
            ?? throw new KeyNotFoundException("Unauthorized Access or Task Not Found.");

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                task.Title = dto.Title;
                task.Description = dto.Description;
                task.DueDate = dto.DueDate;

                if (task.DueDate < DateTime.UtcNow && task.Status.Equals("pending"))
                    task.Status = "missing";

                await dbContext.SaveChangesAsync();

                await notificationService.CreateTaskNotification(task.ProjectTaskID, NotificationType.TASK_UPDATED);
                await reminderService.UpdateTaskReminder(task.ProjectTaskID);

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public async Task DeleteProjectTask(long userID, long projectID, long taskID)
    {

        var task = await dbContext.Tasks.FirstOrDefaultAsync(t =>
            t.ProjectTaskID == taskID && t.ProjectID == projectID && t.Project.SupervisorID == userID)
            ?? throw new KeyNotFoundException("Unauthorized Access or Task Not Found.");

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                await notificationService.CreateTaskNotification(task.ProjectTaskID, NotificationType.TASK_DELETED);
                await reminderService.DeleteTaskReminder(task.ProjectTaskID);

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
}