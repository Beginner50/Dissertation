using System.Linq.Expressions;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
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
    public static IQueryable<Project> ContainsStudent(this IQueryable<Project> query, long userID)
    {
        return query.Where(p => p.StudentID == userID);
    }

    public static IQueryable<Project> ContainsSupervisor(this IQueryable<Project> query, long userID)
    {
        return query.Where(p => p.SupervisorID == userID && !p.Supervisor.IsDeleted);
    }

    public static IQueryable<Project> ContainsMember(this IQueryable<Project> query, long userID)
    {
        return query.Where(p => p.StudentID == userID || p.SupervisorID == userID);
    }

    public static IQueryable<Project> ContainsSupervisor(
            this IQueryable<Project> query, long userID1, long userID2
        )
    {
        return query.Where(p => p.SupervisorID == userID1 || p.SupervisorID == userID2);
    }

    public static IQueryable<Project> MatchStudentAndSupervisor(
        this IQueryable<Project> query, long userID1, long userID2
    )
    {
        return query.Where(p => (p.SupervisorID == userID1 && p.StudentID == userID2)
                                || (p.SupervisorID == userID2 && p.StudentID == userID1));
    }
}

public class ProjectService
{
    protected readonly PMSDbContext dbContext;
    protected readonly ILogger<ProjectService> logger;

    public ProjectService(PMSDbContext dbContext, ILogger<ProjectService> logger)
    {
        this.dbContext = dbContext;
        this.logger = logger;
    }

    // https://learn.microsoft.com/en-us/dotnet/api/system.linq.iqueryable?view=net-10.0
    // https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/
    public async Task<T> GetProject<T>(
         long projectID,
         Expression<Func<Project, T>> selector,
         Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null
    )
    {
        var query = dbContext.Projects.Where(p => p.ProjectID == projectID);

        query = queryExtension?.Invoke(query) ?? query;

        return await query
            .Select(selector)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Project Not Found!");
    }

    public async Task<T> GetProject<T>(
        long userID,
        long projectID,
        Expression<Func<Project, T>> selector,
        Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null
      )
    {
        return await GetProject(projectID, selector, queryExtension: p =>
        {
            var securityCheck = p.NotArchived()
                                 .ContainsMember(userID);
            return queryExtension != null ? queryExtension(securityCheck) : securityCheck;
        });
    }

    public async Task<(IEnumerable<T> items, long totalCount)>
        GetProjectsWithCount<T>(
            Expression<Func<Project, T>> selector,
            Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null,
            long limit = 5,
            long offset = 0
        )
    {
        var projectsQuery = queryExtension?.Invoke(dbContext.Projects) ?? dbContext.Projects;

        var totalCount = await projectsQuery.LongCountAsync();

        var projects = await projectsQuery
            .Select(selector)
            .Skip((int)offset)
            .Take((int)limit)
            .ToListAsync();

        return (projects, totalCount);
    }

    public async Task<(IEnumerable<T> items, long totalCount)>
        GetProjectsWithCount<T>(
            long userID,
            Expression<Func<Project, T>> selector,
            Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null,
            long limit = 5,
            long offset = 0
        )
    {
        return await GetProjectsWithCount(
            selector,
            queryExtension: q =>
            {
                var securityCheck = q.NotArchived().ContainsMember(userID);
                return queryExtension != null ? queryExtension(securityCheck) : securityCheck;
            },
            limit: limit,
            offset: offset
        );
    }

    public async Task CreateProject(
        long supervisorID, string title, string? description = "", long? studentID = null
    )
    {
        var newProject = new Project
        {
            Title = title,
            Description = description ?? "",
            IsArchived = false,
            StudentID = studentID,
            SupervisorID = supervisorID
        };

        dbContext.Projects.Add(newProject);
        await dbContext.SaveChangesAsync();
    }

    public async Task EditProject(
        long projectID, string? title, string? description,
        long? studentID = null, long? supervisorID = null, bool? isArchived = null,
        Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null
    )
    {
        var project = await GetProject(projectID, selector: p => p, queryExtension);

        project.Title = title ?? project.Title;
        project.Description = description ?? project.Description;
        project.StudentID = studentID ?? project.StudentID;
        project.SupervisorID = supervisorID ?? project.SupervisorID;
        project.IsArchived = isArchived ?? project.IsArchived;

        await dbContext.SaveChangesAsync();
    }

    public async Task EditProject(
         long userID, long projectID, string? title, string? description,
         Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null
     )
    {
        await EditProject(
            projectID,
            title: title,
            description: description,
            queryExtension: q =>
            {
                var securityCheck = q.NotArchived().ContainsSupervisor(userID);
                return queryExtension != null ? queryExtension(securityCheck) : securityCheck;
            });
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
         long userID,
         long projectID,
         Func<IQueryable<Project>, IQueryable<Project>>? queryExtension = null
     )
    {
        await ArchiveProject(projectID, queryExtension: q =>
            {
                var securityCheck = q.NotArchived().ContainsSupervisor(userID);
                return queryExtension != null ? queryExtension(securityCheck) : securityCheck;
            });
    }

    // Reserved for admin endpoints
    public async Task RestoreProject(long projectID)
    {
        var project = await GetProject(
            projectID,
            selector: p => p,
            queryExtension: p => p.Include(p => p.Student)
                                  .Include(p => p.Supervisor)
        );

        if ((project?.Supervisor != null && project.Supervisor.IsDeleted)
            || (project?.Student != null && project.Student.IsDeleted))
            throw new UnauthorizedAccessException("Cannot Restore Project With Deleted Users!");

        project.IsArchived = false;

        await dbContext.SaveChangesAsync();
    }
}

