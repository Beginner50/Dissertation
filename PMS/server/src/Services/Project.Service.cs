using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.Models;

namespace PMS.Services;

public class ProjectService
{
    protected readonly PMSDbContext dbContext;
    public ProjectService(PMSDbContext _dbContext)
    {
        dbContext = _dbContext;
    }

    public async Task<Project?> GetProject(
            long userID
        )
    {
        return await dbContext.Projects.Where(
            p => p.SupervisorID == userID || p.StudentID == userID
        ).FirstAsync();
    }

    public async Task<Project?> GetProject(
        long projectID, long userID
    )
    {
        return await dbContext.Projects.Where(
            p => p.ProjectID == projectID && (p.SupervisorID == userID || p.StudentID == userID)
        ).FirstAsync();
    }

    public async Task<IEnumerable<Project>> GetProjects(long? supervisorID = null)
    {
        IQueryable<Project> query = dbContext.Projects;

        if (supervisorID.HasValue)
            query = query.Where(p => p.SupervisorID == supervisorID);

        return await query.ToListAsync();
    }

}