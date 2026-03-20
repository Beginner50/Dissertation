using Microsoft.EntityFrameworkCore;
using PMS.Models;
namespace PMS.DatabaseContext;

/*
    ENTITY FRAMEWORK CORE:
        Entity Framework Core is an Object-Relational Mapper (ORM) that enables .NET developers 
        to work with a database using .NET objects.

        For this to work, EF Core uses a Model that maps the database schema from .NET 
        classes or vice-versa. A Model is made up of a set of classes (known as entity classes)
        and a context that represents the session with the database, allowing us to 
        query and save data.

        The PMSDbContext class is combined with the entity classes defined in the PMS.Models 
        namespace to form the Model for the PMS application.

    DbSet PROPERTY:
        Entity Classes are added to the Model via DbSet<T> properties in the context class.
        They correspond to tables in the underlying database.


    More information on EF Core can be found here:
        https://learn.microsoft.com/en-us/ef/core/
*/
public class PMSDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<ProjectSupervision> ProjectSupervision { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Meeting> Meetings { get; set; }
    public DbSet<Reminder> Reminders { get; set; }
    public DbSet<ProjectTask> Tasks { get; set; }
    public DbSet<Deliverable> Deliverables { get; set; }
    public DbSet<FeedbackCriterion> FeedbackCriterias { get; set; }


    /*
        The Model interacts with the underlying database via a provider that translates
        the operations into database-specific commands.

        Npgsql is the .NET data provider for PostgreSQL. 

        More information on how to configure EF Core with Npgsql can be found here:
            https://www.nuget.org/packages/Npgsql.EntityFrameworkCore.PostgreSQL
    */
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var user = Environment.GetEnvironmentVariable("POSTGRES_USER");
        var pass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
        var db = Environment.GetEnvironmentVariable("POSTGRES_DB");
        var host = Environment.GetEnvironmentVariable("POSTGRES_HOST");

        var connectionString = $"Host={host};Username={user};Password={pass};Database={db};Port=5432";

        optionsBuilder.UseNpgsql(connectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ProjectSupervision>()
            .HasKey(s => new { s.SupervisorID, s.StudentID, s.ProjectID });

        modelBuilder.Entity<ProjectSupervision>()
            .HasOne(ps => ps.Project)
            .WithMany(p => p.Supervisions)
            .HasForeignKey(ps => ps.ProjectID);
        modelBuilder.Entity<ProjectSupervision>()
            .HasOne(ps => ps.Supervisor)
            .WithMany()
            .HasForeignKey(ps => ps.SupervisorID);
        modelBuilder.Entity<ProjectSupervision>()
            .HasOne(ps => ps.Student)
            .WithMany()
            .HasForeignKey(ps => ps.StudentID);

        modelBuilder.Entity<Reminder>()
                .HasOne(r => r.Meeting)
                .WithMany()
                .HasForeignKey(r => r.MeetingID)
                .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reminder>()
            .HasOne(r => r.Task)
            .WithMany(t => t.Reminders)
            .HasForeignKey(r => r.TaskID)
            .OnDelete(DeleteBehavior.Cascade);

        SeedAdminUser(modelBuilder);
        // SeedData(modelBuilder);
    }

    protected void SeedAdminUser(ModelBuilder modelBuilder)
    {
        string passwordHash = "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m";

        modelBuilder.Entity<User>().HasData(
                    new User
                    {
                        UserID = 1,
                        Name = "Admin",
                        Email = "admin@uni.com",
                        Password = passwordHash,
                        RefreshToken = "",
                        Role = "admin"
                    });
    }

    protected void SeedData(ModelBuilder modelBuilder)
    {
        string passwordHash = "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m";

        modelBuilder.Entity<User>().HasData(
            new User
            {
                UserID = 2,
                Name = "Mr. Pile",
                Email = "jatooprashant099@gmail.com",
                Password = passwordHash,
                RefreshToken = "",
                Role = "supervisor"
            },
            new User
            {
                UserID = 3,
                Name = "Bob",
                Email = "prashant_pms@outlook.com",
                Password = passwordHash,
                RefreshToken = "",
                Role = "student"
            },
            new User
            {
                UserID = 4,
                Name = "Mrs. Alice",
                Email = "test@outlook.com",
                Password = passwordHash,
                RefreshToken = "",
                Role = "supervisor"
            });
    }
}