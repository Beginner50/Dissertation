using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;

namespace PMS.Services;

public class ProjectTaskService
{
    protected readonly PMSDbContext dbContext;
    public ProjectTaskService(PMSDbContext dbContext)
    {
        this.dbContext = dbContext;
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

    public async Task<Models.ProjectTask> CreateProjectTask(long userID, long projectID, CreateProjectTaskDTO dto)
    {
        var project = await dbContext.Projects.Where(p =>
                p.ProjectID == projectID && p.SupervisorID == userID)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Project Not Found!");

        var newTask = new Models.ProjectTask
        {
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            ProjectID = projectID,
            Status = "pending",
        };

        dbContext.Tasks.Add(newTask);
        await dbContext.SaveChangesAsync();
        return newTask;
    }

    public async Task EditProjectTask(long userID, long projectID, long taskID, EditProjectTaskDTO dto)
    {
        var task = await dbContext.Tasks.FirstOrDefaultAsync(t =>
            t.ProjectTaskID == taskID && t.ProjectID == projectID && t.Project.SupervisorID == userID)
            ?? throw new KeyNotFoundException("Unauthorized Access or Task Not Found.");

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.DueDate = dto.DueDate;

        if (task.DueDate < DateTime.UtcNow && task.Status.Equals("pending"))
            task.Status = "missing";

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteProjectTask(long userID, long projectID, long taskID)
    {
        var task = await dbContext.Tasks.FirstOrDefaultAsync(t =>
            t.ProjectTaskID == taskID && t.ProjectID == projectID && t.Project.SupervisorID == userID)
            ?? throw new KeyNotFoundException("Unauthorized Access or Task Not Found.");

        dbContext.Remove(task);
        await dbContext.SaveChangesAsync();
    }
}