using System.Linq.Expressions;
using System.Text.Json;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using Npgsql.Internal;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Lib;
using PMS.Models;

namespace PMS.Services;

public static class ProjectQueryExtensions
{
    public static IQueryable<Project> NotArchived(this IQueryable<Project> query)
    {
        return query.Where(p => !p.IsArchived);
    }
}

public static class ProjectSupervisionQueryExtensions
{
    public static IQueryable<ProjectSupervision> ContainsMember(this IQueryable<ProjectSupervision> query, long userID)
    {
        return query.Where(ps => ps.StudentID == userID || ps.SupervisorID == userID);
    }

    public static IQueryable<ProjectSupervision> ContainsSupervisor(this IQueryable<ProjectSupervision> query, long userID)
    {
        return query.Where(ps => ps.SupervisorID == userID);
    }

    public static IQueryable<ProjectSupervision> ContainsStudent(this IQueryable<ProjectSupervision> query, long userID)
    {
        return query.Where(ps => ps.StudentID == userID);
    }
}

public class ProjectService
{
    private readonly PMSDbContext dbContext;
    private readonly UserService userService;
    private readonly ILogger<ProjectService> logger;

    public ProjectService(PMSDbContext dbContext, UserService userService, ILogger<ProjectService> logger)
    {
        this.dbContext = dbContext;
        this.logger = logger;
        this.userService = userService;
    }

    // https://learn.microsoft.com/en-us/dotnet/api/system.linq.iqueryable?view=net-10.0
    // https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/
    public async Task<T> GetProject<T>(
         long projectID,
         Expression<Func<Project, T>> selector,
         Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null
    )
    {
        var query = dbContext.Projects.Where(p => p.ProjectID == projectID);
        if (projectQueryExtension != null)
            query = projectQueryExtension(query);

        return await query
            .Select(selector)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Project Not Found!");
    }

    public async Task<T> GetProject<T>(
        long userID,
        long projectID,
        Expression<Func<Project, T>> selector,
        Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null,
        Func<IQueryable<ProjectSupervision>, IQueryable<ProjectSupervision>>? projectSupervisionQueryExtension = null
      )
    {
        IQueryable<ProjectSupervision> projectSupervisionQuery = dbContext.ProjectSupervision
                                                    .Where(ps => ps.ProjectID == projectID)
                                                    .ContainsMember(userID);
        if (projectSupervisionQueryExtension != null)
            projectSupervisionQuery = projectSupervisionQueryExtension(projectSupervisionQuery);

        IQueryable<Project> projectQuery = projectSupervisionQuery
                                                    .Select(ps => ps.Project!)
                                                    .NotArchived()
                                                    .Distinct();
        if (projectQueryExtension != null)
            projectQuery = projectQueryExtension(projectQuery);

        return await projectQuery.Select(selector)
                                 .FirstOrDefaultAsync()
                                 ?? throw new UnauthorizedAccessException("Unauthorized Access or Project Not Found!");
    }

    public async Task<(IEnumerable<T> items, long totalCount)>
        GetProjectsWithCount<T>(
            Expression<Func<Project, T>> selector,
            Func<IQueryable<ProjectSupervision>, IQueryable<ProjectSupervision>>? projectSupervisionQueryExtension = null,
            Func<IQueryable<Project>, IQueryable<Project>>? projectsQueryExtension = null,
            long limit = 5,
            long offset = 0
        )
    {
        IQueryable<ProjectSupervision> projectSupervisionQuery = dbContext.ProjectSupervision;
        if (projectSupervisionQueryExtension != null)
            projectSupervisionQuery = projectSupervisionQueryExtension(projectSupervisionQuery);

        IQueryable<Project> projectsQuery = projectSupervisionQuery.Select(ps => ps.Project!).Distinct();
        if (projectsQueryExtension != null)
            projectsQuery = projectsQueryExtension(projectsQuery);

        var totalCount = await projectsQuery.LongCountAsync();

        var projects = await projectsQuery
            .OrderBy(p => p.ProjectID)
            .Skip((int)offset)
            .Take((int)limit)
            .Select(selector)
            .ToListAsync();

        return (projects, totalCount);
    }

    public async Task<(IEnumerable<T> items, long totalCount)>
        GetProjectsWithCount<T>(
            long userID,
            Expression<Func<Project, T>> selector,
            Func<IQueryable<Project>, IQueryable<Project>>? projectsQueryExtension = null,
            long limit = 5,
            long offset = 0
        )
    {
        IQueryable<Project> projectsQuery = dbContext.ProjectSupervision
                                              .ContainsMember(userID)
                                              .Select(ps => ps.Project!)
                                              .NotArchived()
                                              .Distinct();
        if (projectsQueryExtension != null)
            projectsQuery = projectsQueryExtension(projectsQuery);

        var totalCount = await projectsQuery.LongCountAsync();

        var projects = await projectsQuery
            .Select(selector)
            .Skip((int)offset)
            .Take((int)limit)
            .ToListAsync();

        return (projects, totalCount);
    }

    public async Task CreateProject(
           string title, string supervisorEmail, string studentEmail, string? description = ""
       )
    {
        var supervisor = await userService.GetUserByEmail(
            supervisorEmail,
            selector: u => u,
            queryExtension: q => q.Where(u => u.Role == "supervisor")
            )
            ?? throw new Exception($"Supervisor {supervisorEmail} Not Found!");

        var student = await userService.GetUserByEmail(
            studentEmail,
            selector: u => u,
            queryExtension: q => q.Where(u => u.Role == "student")
            )
            ?? throw new Exception($"Student {studentEmail} Not Found!");

        await CreateProject(supervisor.UserID, student.UserID, title, description);
    }

    public async Task CreateProject(
        long supervisorID, long studentID, string title, string? description = "")
    {
        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                var newProject = new Project
                {
                    Title = title,
                    Description = description ?? "",
                    IsArchived = false,
                };
                dbContext.Projects.Add(newProject);
                await dbContext.SaveChangesAsync();

                var newProjectSupervisionEntry = new ProjectSupervision
                {
                    SupervisorID = supervisorID,
                    StudentID = studentID,
                    ProjectID = newProject.ProjectID
                };
                dbContext.ProjectSupervision.Add(newProjectSupervisionEntry);
                await dbContext.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public async Task EditProject(
            long projectID, string? title, string? description,
            string? supervisorEmail, string? studentEmail, bool? isArchived = null,
            Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null
        )
    {
        User? supervisor = null, student = null;

        if (supervisorEmail != null && supervisorEmail != "")
            supervisor = await userService.GetUserByEmail(
                supervisorEmail,
                selector: u => u,
                queryExtension: q => q.Where(u => u.Role == "supervisor")
                )
                ?? throw new Exception($"Supervisor {supervisorEmail} Not Found!");
        if (studentEmail != null && studentEmail != "")
            student = await userService.GetUserByEmail(
                studentEmail,
                selector: u => u,
                queryExtension: q => q.Where(u => u.Role == "student")
            )
            ?? throw new Exception($"Student {studentEmail} Not Found!");

        await EditProject(projectID, title, description,
                          student?.UserID, supervisor?.UserID,
                          isArchived);
    }

    public async Task EditProject(
        long projectID, string? title, string? description,
         long? supervisorID = null, long? studentID = null, bool? isArchived = null
    )
    {
        var project = await GetProject(
            projectID, selector: p => p, projectQueryExtension: q => q.Include(p => p.Supervisions)
        );

        project.Title = title ?? project.Title;
        project.Description = description ?? project.Description;
        project.IsArchived = isArchived ?? project.IsArchived;

        if (supervisorID != null && studentID != null)
        {
            var projectSupervisionEntry = await dbContext.ProjectSupervision
                                                .Where(ps => ps.ProjectID == projectID)
                                                .FirstOrDefaultAsync()
                                                ?? throw new Exception("Project Supervision Entry Not Found!");
            dbContext.Remove(projectSupervisionEntry);

            var newEntry = new ProjectSupervision
            {
                SupervisorID = (long)supervisorID,
                StudentID = (long)studentID,
                ProjectID = projectID
            };
            dbContext.ProjectSupervision.Add(newEntry);
        }

        await dbContext.SaveChangesAsync();
    }

    public async Task EditProject(
         long supervisorID, long projectID, string? title, string? description,
         Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null
     )
    {
        var project = await GetProject(supervisorID, projectID, selector: p => p, queryExtension);

        project.Title = title ?? project.Title;
        project.Description = description ?? project.Description;

        await dbContext.SaveChangesAsync();
    }

    public async Task ArchiveProject(
        long projectID,
        Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null
    )
    {
        var project = await GetProject(projectID, selector: p => p, queryExtension);
        project.IsArchived = true;
        await dbContext.SaveChangesAsync();
    }

    public async Task ArchiveProject(
         long supervisorID,
         long projectID,
         Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null
     )
    {
        var project = await GetProject(supervisorID, projectID, selector: p => p, queryExtension);
        project.IsArchived = true;
        await dbContext.SaveChangesAsync();
    }

    // Reserved for admin endpoints
    public async Task RestoreProject(long projectID)
    {
        var project = await GetProject(
            projectID,
            selector: p => p,
            projectQueryExtension: p => p.Include(p => p.Supervisions)
                                    .ThenInclude(ps => ps.Student)
                                  .Include(p => p.Supervisions)
                                    .ThenInclude(ps => ps.Supervisor)
        ) ?? throw new Exception("Project Not Found!");

        bool containsDeletedUser = project.Supervisions.Any(ps => ps.Student!.IsDeleted
                                                            || ps.Supervisor!.IsDeleted);
        if (containsDeletedUser)
            throw new UnauthorizedAccessException("Cannot Restore Project With Deleted Users!");

        project!.IsArchived = false;

        await dbContext.SaveChangesAsync();
    }
}

