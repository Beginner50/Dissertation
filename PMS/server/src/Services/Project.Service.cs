using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Lib;
using PMS.Models;

namespace PMS.Services;

public class ProjectService
{
    protected readonly PMSDbContext dbContext;
    protected readonly ILogger<ProjectService> logger;
    public ProjectService(PMSDbContext dbContext, ILogger<ProjectService> logger)
    {
        this.dbContext = dbContext;
        this.logger = logger;
    }

    public async Task<GetProjectDTO> GetProject(
         long userID,
         long projectID
    )
    {
        return await dbContext.Projects
            .AsSplitQuery()
            .Where(p => p.ProjectID == projectID && (p.SupervisorID == userID || p.StudentID == userID))
            .Select(p => new GetProjectDTO
            {
                ProjectID = p.ProjectID,
                Title = p.Title,
                Description = p.Description,
                Status = p.Status,
                Student = p.Student != null ? new UserLookupDTO
                {
                    UserID = p.Student.UserID,
                    Name = p.Student.Name,
                    Email = p.Student.Email
                } : null,
                Supervisor = p.Supervisor != null ? new UserLookupDTO
                {
                    UserID = p.Supervisor.UserID,
                    Name = p.Supervisor.Name,
                    Email = p.Supervisor.Email
                } : null,
                Tasks = p.Tasks
                .OrderByDescending(t => t.AssignedDate)
                .Select(t => new ProjectTaskLookupDTO
                {
                    TaskID = t.ProjectTaskID,
                    Title = t.Title
                })
                .ToList()
            })
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Project Not Found!");
    }

    public async Task<(IEnumerable<GetProjectDTO> projects, long count)>
        GetProjectsWithCount(long userID, long limit = 5, long offset = 0)
    {
        var projectsQuery = dbContext.Projects
            .Where(p => (p.SupervisorID == userID || p.StudentID == userID)
                            && p.Status != "archived")
        .Skip((int)offset)
        .Take((int)limit);

        var count = await projectsQuery.LongCountAsync();

        var projects = await projectsQuery
            .AsSplitQuery()
            .Select(p => new GetProjectDTO
            {
                ProjectID = p.ProjectID,
                Title = p.Title,
                Status = p.Status,
                Description = p.Description,
                Supervisor = p.Supervisor != null ? new UserLookupDTO
                {
                    UserID = p.Supervisor.UserID,
                    Name = p.Supervisor.Name,
                    Email = p.Supervisor.Email
                } : null,
                Student = p.Student != null ? new UserLookupDTO
                {
                    UserID = p.Student.UserID,
                    Name = p.Student.Name,
                    Email = p.Student.Email
                } : null,
                Tasks = p.Tasks
                    .OrderByDescending(t => t.AssignedDate)
                    .Select(t => new ProjectTaskLookupDTO
                    {
                        TaskID = t.ProjectTaskID,
                        Title = t.Title
                    })
                    .ToList()
            }
        )
        .ToListAsync();

        return (projects, count);
    }

    public async Task<IEnumerable<GetProjectDTO>> GetAllUnsupervisedProjects()
    {
        return await dbContext.Projects
            .AsSplitQuery()
            .Where(p => p.Supervisor == null)
            .Select(p => new GetProjectDTO
            {
                ProjectID = p.ProjectID,
                Title = p.Title,
                Status = p.Status,
                Student = p.Student != null ? new UserLookupDTO
                {
                    UserID = p.Student.UserID,
                    Name = p.Student.Name,
                    Email = p.Student.Email
                } : null,
                Supervisor = p.Supervisor != null ? new UserLookupDTO
                {
                    UserID = p.Supervisor.UserID,
                    Name = p.Supervisor.Name,
                    Email = p.Supervisor.Email
                } : null,
                Tasks = p.Tasks
                .OrderByDescending(t => t.AssignedDate)
                .Select(t => new ProjectTaskLookupDTO
                {
                    TaskID = t.ProjectTaskID,
                    Title = t.Title
                })
                .ToList()
            })
            .ToListAsync();
    }

    public async Task CreateProject(long userID, CreateProjectDTO dto)
    {
        var newProject = new Project
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = "active",
            StudentID = null,
            SupervisorID = userID
        };

        dbContext.Projects.Add(newProject);
        await dbContext.SaveChangesAsync();
    }

    public async Task EditProject(long userID, long projectID, EditProjectDTO dto)
    {
        var project = await dbContext.Projects.Where(p =>
            p.ProjectID == projectID &&
                    p.SupervisorID == userID)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Not Authorized or Project Not Found!");

        project.Title = dto.Title;
        project.Description = dto.Description;

        await dbContext.SaveChangesAsync();
    }

    public async Task ArchiveProject(long userID, long projectID)
    {
        var project = await dbContext.Projects.Where(p =>
                p.ProjectID == projectID &&
                    p.SupervisorID == userID)
                .FirstOrDefaultAsync()
                ?? throw new UnauthorizedAccessException("Not Authorized or Project Not Found!");

        project.Status = "archived";

        await dbContext.SaveChangesAsync();
    }

    public async Task AssignStudentToProject(long userID, long projectID, long studentID)
    {
        var project = await dbContext.Projects.Where(p =>
            p.ProjectID == projectID &&
                p.SupervisorID == userID)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Not Authorized or Project Not Found!");

        project.StudentID = studentID;

        await dbContext.SaveChangesAsync();
    }

    public async Task<TaskDeliverableFileDTO> GenerateProgressLogReport(long userID, long projectID)
    {
        var tasksWithMeetings = await dbContext.Tasks
                                    .Include(t => t.Project)
                                        .ThenInclude(p => p.Student)
                                    .Include(t => t.Project)
                                        .ThenInclude(p => p.Supervisor)
                                    .Include(t => t.Meetings)
                                    .Where(t => t.ProjectID == projectID &&
                                            t.Project.SupervisorID == userID || t.Project.StudentID == userID)
                                    .OrderBy(t => t.AssignedDate)
                                    .ToListAsync();

        if (tasksWithMeetings.Count == 0)
            throw new UnauthorizedAccessException("Tasks Not Found!");

        var project = tasksWithMeetings[0].Project;

        var pdfData = PDFUtils.GenerateProgressLogReport(project, tasksWithMeetings);
        return new TaskDeliverableFileDTO
        {
            Filename = $"{project.Title}_ProgressLog_{DateTime.UtcNow:dd/MM/yyyy}",
            File = pdfData,
            ContentType = "application/pdf"
        };
    }
}