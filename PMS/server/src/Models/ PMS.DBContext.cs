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
    public DbSet<Project> Projects { get; set; }
    public DbSet<Meeting> Meetings { get; set; }
    public DbSet<Reminder> Reminders { get; set; }
    public DbSet<ProgressLogEntry> ProgressLogEntries { get; set; }
    public DbSet<PMS.Models.ProjectTask> Tasks { get; set; }
    public DbSet<Deliverable> Deliverables { get; set; }
    public DbSet<FeedbackCriteria> FeedbackCriterias { get; set; }


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

        SeedData(modelBuilder);
    }

    protected void SeedData(ModelBuilder modelBuilder)
    {
        // 1. Seed Users
        modelBuilder.Entity<User>().HasData(
            new User
            {
                UserID = 1,
                Name = "Alice Student",
                Email = "alice@uni.com",
                Password = "hashed_password",
                Role = "Student"
            },
            new User
            {
                UserID = 2,
                Name = "Dr. Smith",
                Email = "smith@uni.com",
                Password = "hashed_password",
                Role = "Supervisor"
            },
            new User
            {
                UserID = 3,
                Name = "Hashim",
                Email = "hashim@uni.com",
                Password = "hashed_password",
                Role = "Student"
            },
            new User
            {
                UserID = 4,
                Name = "Charlie Student",
                Email = "charlie@uni.com",
                Password = "hashed_password",
                Role = "Student"
            },
            new User
            {
                UserID = 5,
                Name = "Dr. Brown",
                Email = "brown@uni.com",
                Password = "hashed_password",
                Role = "Supervisor"
            }
        );

        // 2. Seed Project
        modelBuilder.Entity<Project>().HasData(
            new Project
            {
                ProjectID = 1,
                Title = "AI Research",
                Description = "Research on AI algorithms",
                Status = "Active",
                StudentID = 1,     // Matches Alice
                SupervisorID = 2   // Matches Dr. Smith
            }, new Project
            {
                ProjectID = 2,
                Title = "OCR Research",
                Description = "Research on Optical Character Recognition",
                Status = "Active",
                StudentID = 3,     // Matches Hashim
                SupervisorID = 2   // Matches Dr. Smith
            },
            new Project
            {
                ProjectID = 3,
                Title = "Blockchain Dev",
                Description = "Development of Blockchain applications",
                Status = "Active",
                StudentID = 4,
                SupervisorID = 5
            }
        );

        modelBuilder.Entity<Meeting>().HasData(
            // Alice (ID 1) & Dr. Smith (ID 2) - Project 1
            new Meeting
            {
                MeetingID = 1,
                ProjectID = 1,
                OrganizerID = 2,
                AttendeeID = 1,
                Status = "pending",
                Start = new DateTime(2025, 12, 20, 10, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 20, 11, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 2,
                ProjectID = 1,
                OrganizerID = 1,
                AttendeeID = 2,
                Status = "pending",
                Start = new DateTime(2025, 12, 21, 14, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 21, 15, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 3,
                ProjectID = 1,
                OrganizerID = 2,
                AttendeeID = 1,
                Status = "accepted",
                Start = new DateTime(2025, 12, 22, 09, 30, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 22, 10, 30, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 4,
                ProjectID = 1,
                OrganizerID = 1,
                AttendeeID = 2,
                Status = "pending",
                Start = new DateTime(2025, 12, 23, 11, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 23, 12, 0, 0, DateTimeKind.Utc)
            },

            // Hashim (ID 3) & Dr. Smith (ID 2) - Project 2
            new Meeting
            {
                MeetingID = 5,
                ProjectID = 2,
                OrganizerID = 2,
                AttendeeID = 3,
                Status = "accepted",
                Start = new DateTime(2025, 12, 20, 13, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 20, 14, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 6,
                ProjectID = 2,
                OrganizerID = 3,
                AttendeeID = 2,
                Status = "pending",
                Start = new DateTime(2025, 12, 21, 10, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 21, 11, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 7,
                ProjectID = 2,
                OrganizerID = 2,
                AttendeeID = 3,
                Status = "accepted",
                Start = new DateTime(2025, 12, 22, 15, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 22, 16, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 8,
                ProjectID = 2,
                OrganizerID = 3,
                AttendeeID = 2,
                Status = "pending",
                Start = new DateTime(2025, 12, 23, 09, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 23, 10, 0, 0, DateTimeKind.Utc)
            },

            // New Project: Charlie (ID 4) & Dr. Brown (ID 5) - Project 3
            new Meeting
            {
                MeetingID = 9,
                ProjectID = 3,
                OrganizerID = 5,
                AttendeeID = 4,
                Status = "accepted",
                Start = new DateTime(2025, 12, 24, 10, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 24, 11, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}