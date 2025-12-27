using PMS.DatabaseContext;

namespace PMS.Services;

public class ProgressLogService
{
    protected readonly PMSDbContext dbContext;
    public ProgressLogService(PMSDbContext dbContext)
    {
        this.dbContext = dbContext;
    }
}