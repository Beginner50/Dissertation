using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.Models;

namespace PMS.Services;

public class UserService
{
    protected readonly PMSDbContext dbContext;
    public UserService(PMSDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<IEnumerable<User>> GetAllUnsupervisedStudents()
    {
        return await dbContext.Users.Where(
          u => u.ConductedProjects.All(p => p.Supervisor == null) &&
                u.Role == "student"
        ).ToListAsync();
    }
}