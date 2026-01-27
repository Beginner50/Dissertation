using System.Transactions;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Lib;
using PMS.Models;

namespace PMS.Services;

public class ProjectTaskService
{
    protected readonly MailService mailService;
    protected readonly NotificationService notificationService;
    protected readonly ReminderService reminderService;
    protected readonly PMSDbContext dbContext;
    public ProjectTaskService(PMSDbContext dbContext, MailService mailService, NotificationService notificationService, ReminderService reminderService)
    {
        this.dbContext = dbContext;
        this.mailService = mailService;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
    }

    public async Task<GetProjectTaskDTO> GetProjectTask(long userID, long projectID, long taskID)
    {
        var task = await dbContext.Tasks.Where(
            t => t.ProjectTaskID == taskID &&
                t.ProjectID == projectID &&
                    (t.Project.StudentID == userID || t.Project.SupervisorID == userID)
        )
        .Include(t => t.AssignedBy)
        .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Task Not Found!");

        /*
            If the task has been past its DueDate, update its Status

            While it breaks the idempotency principle for GET requests in REST, the alternative
            requires cron job scheduling for updating the status (can be suggested as an
            improvement).
        */
        if (task.DueDate < DateTime.UtcNow && task.Status == "pending")
        {
            task.Status = "missing";
            await dbContext.SaveChangesAsync();
        }

        return new GetProjectTaskDTO
        {
            TaskID = task.ProjectTaskID,
            Title = task.Title,
            Description = task.Description,
            AssignedDate = task.AssignedDate,
            DueDate = task.DueDate,
            Status = task.Status,
            StagedDeliverableID = task.StagedDeliverableID,
            SubmittedDeliverableID = task.SubmittedDeliverableID,
            AssignedBy = new UserLookupDTO
            {
                UserID = task.AssignedBy.UserID,
                Name = task.AssignedBy.Name,
                Email = task.AssignedBy.Email
            }
        };
    }

    public async Task<(IEnumerable<GetProjectTaskDTO> tasks, long count)>
        GetProjectTasksWithCount(long userID, long projectID, long limit = 5, long offset = 0)
    {
        var tasksQuery = dbContext.Tasks.Where(
            t => t.ProjectID == projectID &&
                    (t.Project.StudentID == userID || t.Project.SupervisorID == userID)
            );

        var count = await tasksQuery.LongCountAsync();

        var tasks = await tasksQuery
            .OrderByDescending(t => t.DueDate)
            .Skip((int)offset)
            .Take((int)limit)
            .ToListAsync();

        // See GetTask above for explanation for why GetTasks is not idempotent
        bool hasChanges = false;
        foreach (var task in tasks)
        {
            if (task.DueDate < DateTime.UtcNow && task.Status == "pending")
                task.Status = "missing";
            hasChanges = true;
        }

        if (hasChanges)
            await dbContext.SaveChangesAsync();

        return (tasks.Select(t => new GetProjectTaskDTO
        {
            TaskID = t.ProjectTaskID,
            Title = t.Title,
            Description = t.Description,
            AssignedDate = t.AssignedDate,
            DueDate = t.DueDate,
            Status = t.Status
        }), count);
    }

    public async Task<ProjectTask> CreateProjectTask(long userID, long projectID, CreateProjectTaskDTO dto)
    {
        var project = await dbContext.Projects.Where(p =>
                p.ProjectID == projectID && p.SupervisorID == userID)
            .Include(p => p.Student)
            .Include(p => p.Supervisor)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Project Not Found!");

        ProjectTask newTask;
        MimeMessage? mail = null;

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                newTask = new ProjectTask
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    DueDate = dto.DueDate,
                    Status = "pending",
                    AssignedByID = userID,
                    ProjectID = projectID,
                    Project = project,
                };

                dbContext.Tasks.Add(newTask);
                await dbContext.SaveChangesAsync();

                if (project.StudentID != null)
                {
                    await notificationService.CreateTaskNotification(newTask, NotificationType.TASK_CREATED);
                    await reminderService.CreateTaskReminder(newTask);
                    mail = mailService.CreateTaskMail(newTask, MailType.TASK_ASSIGNED);
                }

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        if (mail != null)
            await mailService.SendMail(mail);

        return newTask;
    }

    public async Task EditProjectTask(long userID, long projectID, long taskID, EditProjectTaskDTO dto)
    {
        var task = await dbContext.Tasks.Where(t =>
            t.ProjectTaskID == taskID && t.ProjectID == projectID && t.Project.SupervisorID == userID)
            .Include(t => t.Project)
                .ThenInclude(p => p.Student)
            .Include(t => t.Project)
                .ThenInclude(p => p.Supervisor)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Unauthorized Access or Task Not Found.");

        bool dueDateUpdated = false;
        MimeMessage? mail = null;

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                task.Title = dto.Title ?? task.Title;
                task.Description = dto.Description ?? task.Description;
                if (dto.DueDate != task.DueDate)
                {
                    task.DueDate = (DateTime)dto.DueDate;
                    if (task.DueDate < DateTime.UtcNow && task.Status.Equals("pending"))
                        task.Status = "missing";

                    dueDateUpdated = true;
                }

                await dbContext.SaveChangesAsync();

                if (task.Project.StudentID != null)
                {
                    await notificationService.CreateTaskNotification(task, NotificationType.TASK_UPDATED);

                    if (dueDateUpdated)
                    {
                        await reminderService.UpdateTaskReminder(task);
                        mail = mailService.CreateTaskMail(task, MailType.TASK_UPDATED);
                    }
                }

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        if (mail != null)
            await mailService.SendMail(mail);
    }

    public async Task DeleteProjectTask(long userID, long projectID, long taskID)
    {
        var task = await dbContext.Tasks.Where(t =>
            t.ProjectTaskID == taskID && t.ProjectID == projectID && t.Project.SupervisorID == userID)
            .Include(t => t.Project)
                .ThenInclude(p => p.Student)
            .Include(t => t.Project)
                .ThenInclude(p => p.Supervisor)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Unauthorized Access or Task Not Found.");

        MimeMessage? mail = null;

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                if (task.Project.StudentID != null)
                {
                    await notificationService.CreateTaskNotification(task, NotificationType.TASK_DELETED);
                    await reminderService.DeleteTaskReminder(task);
                    mail = mailService.CreateTaskMail(task, MailType.TASK_DELETED);
                }

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

        if (mail != null)
            await mailService.SendMail(mail);
    }
}