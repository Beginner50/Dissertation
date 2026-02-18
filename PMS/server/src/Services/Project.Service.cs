using System.CodeDom;
using System.Collections.Immutable;
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
            .Where(p => p.ProjectID == projectID &&
                    (p.SupervisorID == userID || p.StudentID == userID))
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
                    Email = p.Student.Email,
                    IsDeleted = p.Student.IsDeleted
                } : null,
                Supervisor = p.Supervisor != null ? new UserLookupDTO
                {
                    UserID = p.Supervisor.UserID,
                    Name = p.Supervisor.Name,
                    Email = p.Supervisor.Email,
                    IsDeleted = p.Supervisor.IsDeleted
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
        GetUserProjectsWithCount(long userID, long limit = 5, long offset = 0)
    {
        var projectsQuery = dbContext.Projects
            .Where(p => (p.SupervisorID == userID || p.StudentID == userID)
                            && p.Status != "archived");

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
                    Email = p.Supervisor.Email,
                    IsDeleted = p.Supervisor.IsDeleted
                } : null,
                Student = p.Student != null ? new UserLookupDTO
                {
                    UserID = p.Student.UserID,
                    Name = p.Student.Name,
                    Email = p.Student.Email,
                    IsDeleted = p.Student.IsDeleted
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
        .Skip((int)offset)
        .Take((int)limit)
        .ToListAsync();

        return (projects, count);
    }

    public async Task<(IEnumerable<GetProjectDTO> projects, long count)>
     GetAllProjectsWithCount(long limit = 5, long offset = 0)
    {
        var count = await dbContext.Projects.LongCountAsync();

        var projects = await dbContext.Projects
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
                    Email = p.Supervisor.Email,
                    IsDeleted = p.Supervisor.IsDeleted
                } : null,
                Student = p.Student != null ? new UserLookupDTO
                {
                    UserID = p.Student.UserID,
                    Name = p.Student.Name,
                    Email = p.Student.Email,
                    IsDeleted = p.Student.IsDeleted
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
        .Skip((int)offset)
        .Take((int)limit)
        .ToListAsync();

        return (projects, count);
    }

    public async Task CreateProject(
        long supervisorID, string title, string? description = "", long? studentID = null
    )
    {
        var newProject = new Project
        {
            Title = title,
            Description = description,
            Status = "active",
            StudentID = studentID,
            SupervisorID = supervisorID
        };

        dbContext.Projects.Add(newProject);
        await dbContext.SaveChangesAsync();
    }

    // Reserved for admin endpoints
    public async Task EditProject(
        long projectID, string? title, string? description,
        long? studentID, long? supervisorID, string? status
    )
    {
        var project = await dbContext.Projects.Where(p =>
            p.ProjectID == projectID && p.Status != "archived")
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Not Authorized or Project Not Found!");

        project.Title = title ?? project.Title;
        project.Description = description ?? project.Description;
        project.StudentID = studentID ?? project.StudentID;
        project.SupervisorID = supervisorID ?? project.SupervisorID;
        project.Status = status ?? project.Status;

        await dbContext.SaveChangesAsync();
    }

    public async Task EditProject(
        long userID, long projectID, string? title, string? description
    )
    {
        var project = await dbContext.Projects.Where(p =>
            p.ProjectID == projectID &&
                    p.SupervisorID == userID && p.Status != "archived")
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Not Authorized or Project Not Found!");

        project.Title = title ?? project.Title;
        project.Description = description ?? project.Description;

        await dbContext.SaveChangesAsync();
    }

    // Reserved for admin endpoints
    public async Task ArchiveProject(long projectID)
    {
        var project = await dbContext.Projects.Where(p =>
                p.ProjectID == projectID && p.Status != "archived")
                .FirstOrDefaultAsync()
                ?? throw new UnauthorizedAccessException("Project Not Found!");

        project.Status = "archived";

        await dbContext.SaveChangesAsync();
    }

    public async Task ArchiveProject(long userID, long projectID)
    {
        var project = await dbContext.Projects.Where(p =>
                p.ProjectID == projectID &&
                    p.SupervisorID == userID && p.Status != "archived")
                .FirstOrDefaultAsync()
                ?? throw new UnauthorizedAccessException("Not Authorized or Project Not Found!");

        project.Status = "archived";

        await dbContext.SaveChangesAsync();
    }

    // Reserved for admin endpoints
    public async Task RestoreProject(long projectID)
    {
        var project = await dbContext.Projects.Where(p =>
                p.ProjectID == projectID)
                .Include(p => p.Student)
                .Include(p => p.Supervisor)
                .FirstOrDefaultAsync()
                ?? throw new UnauthorizedAccessException("Project Not Found!");

        if ((project?.Supervisor != null && project.Supervisor.IsDeleted)
            || (project?.Student != null && project.Student.IsDeleted))
            throw new UnauthorizedAccessException("Cannot Restore Project With Deleted Users!");

        project.Status = "active";

        await dbContext.SaveChangesAsync();
    }

    // Reserved for admin endpoints
    public async Task IngestProjectSupervisionList(string filename, byte[] fileData, string contentType)
    {
        if (!Sanitization.IsValidExcel(fileData))
            throw new Exception("File Is Not Valid Excel!");

        var extractedProjects = PDFUtils.IngestProjectSupervisionList(filename, fileData, contentType);
        var extractedProjectEmails = extractedProjects.Select(d => d.StudentEmail)
            .Union(extractedProjects.Select(d => d.SupervisorEmail))
            .Distinct()
            .ToList();
        var extractedProjectTitles = extractedProjects.Select(d => d.Title).ToList();

        var emailUserIDMap = await dbContext.Users
            .Where(u => extractedProjectEmails.Contains(u.Email))
            .ToDictionaryAsync(u => u.Email, u => u.UserID);
        if (emailUserIDMap.Count < extractedProjectEmails.Count)
            throw new Exception("Not All Users In The List Exist!");

        var existingProjects = await dbContext.Projects
            .Where(p => extractedProjectTitles.Contains(p.Title))
            .ToListAsync();
        var newProjects = extractedProjects
            .ExceptBy(existingProjects.Select(p => p.Title), p => p.Title)
            .Select(d => new Project
            {
                Title = d.Title,
                Description = d.Description,
                Status = "active",
                StudentID = emailUserIDMap[d.StudentEmail],
                SupervisorID = emailUserIDMap[d.SupervisorEmail]
            })
            .ToList();

        if (newProjects.Count > 0)
        {
            await dbContext.Projects.AddRangeAsync(newProjects);
            await dbContext.SaveChangesAsync();
        }
    }

    public async Task<FileDTO> GenerateProgressLogReport(long userID, long projectID)
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
        return new FileDTO
        {
            Filename = Sanitization.SanitizeFilename($"{project.Title}_ProgressLog_{DateTime.UtcNow:dd/MM/yyyy}"),
            File = pdfData,
            ContentType = "application/pdf"
        };
    }
}