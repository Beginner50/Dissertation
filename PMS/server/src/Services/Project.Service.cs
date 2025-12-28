using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;

public class ProjectService
{
    protected readonly PMSDbContext dbContext;
    public ProjectService(PMSDbContext _dbContext)
    {
        dbContext = _dbContext;
    }

    // Should only be called when projectID is not specified in url (get meeting endpoint)
    public async Task<Project?> GetProject(
            long userID
        )
    {
        return await dbContext.Projects.Where(
            p => p.SupervisorID == userID || p.StudentID == userID
        ).FirstOrDefaultAsync()
        ?? throw new UnauthorizedAccessException("Unauthorized Access or Project Not Found!");
    }

    public async Task<GetProjectDTO> GetProject(
         long userID, long projectID
    )
    {
        return await dbContext.Projects.Where(
            p => p.ProjectID == projectID && (p.SupervisorID == userID || p.StudentID == userID)
        ).Select(p => new GetProjectDTO
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
        })
        .FirstOrDefaultAsync()
        ?? throw new UnauthorizedAccessException("Unauthorized Access or Project Not Found!");
    }

    /*
        Returns projects where the user is involved in.
        A supervisor can supervise multiple projects, while a student can only conduct
        one project (ConductedProjects is a list for uniformity).
    */
    public async Task<IEnumerable<GetProjectDTO>> GetProjects(long userID)
    {
        return await dbContext.Users.Where(u => u.UserID == userID)
            .SelectMany(u => u.ConductedProjects.Concat(u.SupervisedProjects))
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
                } : null
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<GetProjectDTO>> GetAllUnsupervisedProjects()
    {
        return await dbContext.Projects.Where(p =>
                p.Supervisor == null)
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
                } : null
            })
            .ToListAsync();
    }

    // Both supervisors and students can create project (only 1 for student)
    public async Task CreateProject(long userID, string role, CreateProjectDTO dto)
    {
        if (role.Equals("student"))
        {
            var existingProject = await dbContext.Projects.Where(p =>
                    p.StudentID == userID).FirstOrDefaultAsync();
            if (existingProject != null)
                throw new UnauthorizedAccessException("Unauthorized Access");
        }

        var newProject = new Project
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = "active",
            StudentID = role.Equals("student") ? userID : null,
            SupervisorID = role.Equals("supervisor") ? userID : null
        };

        dbContext.Projects.Add(newProject);
        await dbContext.SaveChangesAsync();
    }

    // A student can edit a project provided that there is no supervisor in the project
    public async Task EditProject(long userID, long projectID, EditProjectDTO dto)
    {
        var project = await dbContext.Projects.Where(p =>
            p.ProjectID == projectID &&
                ((p.StudentID == userID && p.Supervisor == null) ||
                    p.SupervisorID == userID))
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

        project.Status = "Archived";

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

    // A supervisor can only join a project which does not have another supervisor already
    public async Task JoinProject(long userID, long projectID)
    {
        var project = await dbContext.Projects.Where(p =>
            p.ProjectID == projectID &&
                p.Supervisor == null)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Not Authorized or Project Not Found!");

        project.SupervisorID = userID;

        await dbContext.SaveChangesAsync();
    }
}