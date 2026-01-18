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
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<ProjectTask> Tasks { get; set; }
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
            },
            new User
            {
                UserID = 2,
                Name = "Dr. Smith",
                Email = "smith@uni.com",
                Password = passwordHash,
                RefreshToken = "",
                Role = "supervisor"
            },
            new User
            {
                UserID = 3,
                Name = "Hashim",
                Email = "hashim@uni.com",
                Password = passwordHash,
                RefreshToken = "",
                Role = "student"
            },
            new User
            {
                UserID = 4,
                Name = "Charlie Student",
                Email = "charlie@uni.com",
                Password = passwordHash,
                RefreshToken = "",
                Role = "student"
            },
            new User
            {
                UserID = 5,
                Name = "Dr. Brown",
                Email = "brown@uni.com",
                Password = passwordHash,
                RefreshToken = "",
                Role = "supervisor"
            },
            new User
            {
                UserID = 6,
                Name = "Agent Smith",
                Email = "agent@smith.com",
                Password = passwordHash,
                RefreshToken = "",
                Role = "student"
            },
            new User
            {
                UserID = 7,
                Name = "Rebellius",
                Email = "rebellius@uni.com",
                Password = passwordHash,
                RefreshToken = "",
                Role = "student"
            }
        );

        modelBuilder.Entity<Project>().HasData(
            new Project
            {
                ProjectID = 1,
                Title = "AI Research",
                Description = "Research on AI algorithms",
                Status = "active",
                StudentID = 4,
                SupervisorID = 2
            }, new Project
            {
                ProjectID = 2,
                Title = "OCR Research",
                Description = "Research on Optical Character Recognition",
                Status = "active",
                StudentID = 3,
                SupervisorID = 2
            },
            new Project
            {
                ProjectID = 3,
                Title = "Blockchain Dev",
                Description = "Development of Blockchain applications",
                Status = "active",
                StudentID = 6,
                SupervisorID = 5
            }
        );

        modelBuilder.Entity<ProjectTask>().HasData(
            new ProjectTask
            {
                ProjectTaskID = 1,
                ProjectID = 1,
                Title = "Literature Review",
                Description = "Review current papers on Transformer models.",
                AssignedDate = new DateTime(2025, 11, 1, 0, 0, 0, DateTimeKind.Utc),
                DueDate = new DateTime(2025, 11, 15, 0, 0, 0, DateTimeKind.Utc),
                Status = "completed"
            },
            new ProjectTask
            {
                ProjectTaskID = 2,
                ProjectID = 1,
                Title = "Dataset Collection",
                Description = "Gather and clean the training dataset.",
                AssignedDate = new DateTime(2025, 11, 16, 0, 0, 0, DateTimeKind.Utc),
                DueDate = new DateTime(2025, 12, 10, 0, 0, 0, DateTimeKind.Utc),
                Status = "pending"
            },
            new ProjectTask
            {
                ProjectTaskID = 3,
                ProjectID = 1,
                Title = "Proposal Submission",
                Description = "Submit the formal research proposal.",
                AssignedDate = new DateTime(2025, 10, 1, 0, 0, 0, DateTimeKind.Utc),
                DueDate = new DateTime(2025, 10, 15, 0, 0, 0, DateTimeKind.Utc),
                Status = "missing"
            },
            new ProjectTask
            {
                ProjectTaskID = 4,
                ProjectID = 2,
                Title = "Algorithm Selection",
                Description = "Compare Tesseract vs EasyOCR.",
                AssignedDate = new DateTime(2025, 12, 1, 0, 0, 0, DateTimeKind.Utc),
                DueDate = new DateTime(2025, 12, 15, 0, 0, 0, DateTimeKind.Utc),
                Status = "pending"
            },
            new ProjectTask
            {
                ProjectTaskID = 5,
                ProjectID = 2,
                Title = "Initial Prototype",
                Description = "Develop a basic Python script for image-to-text conversion.",
                AssignedDate = new DateTime(2025, 11, 1, 0, 0, 0, DateTimeKind.Utc),
                DueDate = new DateTime(2025, 11, 20, 0, 0, 0, DateTimeKind.Utc),
                Status = "completed"
            },

            new ProjectTask
            {
                ProjectTaskID = 6,
                ProjectID = 3,
                Title = "Smart Contract Design",
                Description = "Architect the voting system contract in Solidity.",
                AssignedDate = new DateTime(2025, 12, 5, 0, 0, 0, DateTimeKind.Utc),
                DueDate = new DateTime(2025, 12, 20, 0, 0, 0, DateTimeKind.Utc),
                Status = "pending"
            }
        );

        modelBuilder.Entity<Meeting>().HasData(
            new Meeting
            {
                MeetingID = 1,
                TaskID = 1, // Project 1 - Literature Review
                OrganizerID = 2,
                AttendeeID = 3,
                Status = "pending",
                Start = new DateTime(2025, 12, 20, 10, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 20, 11, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 2,
                TaskID = 2, // Project 1 - Dataset Collection
                OrganizerID = 3,
                AttendeeID = 2,
                Status = "pending",
                Start = new DateTime(2025, 12, 21, 14, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 21, 15, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 3,
                TaskID = 1, // Project 1 - Literature Review
                OrganizerID = 2,
                AttendeeID = 3,
                Status = "accepted",
                Start = new DateTime(2025, 12, 22, 09, 30, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 22, 10, 30, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 4,
                TaskID = 3, // Project 1 - Proposal Submission
                OrganizerID = 3,
                AttendeeID = 2,
                Status = "pending",
                Start = new DateTime(2025, 12, 23, 11, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 23, 12, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 5,
                TaskID = 4, // Project 2 - Algorithm Selection
                OrganizerID = 2,
                AttendeeID = 6,
                Status = "accepted",
                Start = new DateTime(2025, 12, 20, 13, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 20, 14, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 6,
                TaskID = 5, // Project 2 - Initial Prototype
                OrganizerID = 6,
                AttendeeID = 2,
                Status = "pending",
                Start = new DateTime(2025, 12, 21, 10, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 21, 11, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 7,
                TaskID = 4, // Project 2 - Algorithm Selection
                OrganizerID = 2,
                AttendeeID = 6,
                Status = "accepted",
                Start = new DateTime(2025, 12, 22, 15, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 22, 16, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 8,
                TaskID = 5, // Project 2 - Initial Prototype
                OrganizerID = 6,
                AttendeeID = 2,
                Status = "pending",
                Start = new DateTime(2025, 12, 23, 09, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 23, 10, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 9,
                TaskID = 6, // Project 3 - Smart Contract Design
                OrganizerID = 5,
                AttendeeID = 4,
                Status = "accepted",
                Start = new DateTime(2025, 12, 24, 10, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 24, 11, 0, 0, DateTimeKind.Utc)
            }
        );


        modelBuilder.Entity<Reminder>().HasData(
            new Reminder
            {
                ReminderID = 1,
                RecipientID = 3,
                Type = "meeting",
                Message = "Prepare for Dissertation Review",
                RemindAt = new DateTime(2026, 1, 4, 9, 0, 0, DateTimeKind.Utc),
                MeetingID = 1,
                TaskID = null
            },
            new Reminder
            {
                ReminderID = 2,
                RecipientID = 3,
                Type = "task",
                Message = "Finalize Dataset Collection draft",
                RemindAt = new DateTime(2026, 1, 4, 14, 0, 0, DateTimeKind.Utc),
                MeetingID = null,
                TaskID = 2
            },
            new Reminder
            {
                ReminderID = 3,
                RecipientID = 2,
                Type = "meeting",
                Message = "Review OCR Research with Hashim",
                RemindAt = new DateTime(2026, 1, 5, 10, 0, 0, DateTimeKind.Utc), // Jan 5th
                MeetingID = 7,
                TaskID = null
            },
            new Reminder
            {
                ReminderID = 4,
                RecipientID = 6,
                Type = "task",
                Message = "Compare Tesseract vs EasyOCR",
                RemindAt = new DateTime(2026, 1, 4, 08, 30, 0, DateTimeKind.Utc), // Tomorrow 8:30 AM (Nearest)
                MeetingID = null,
                TaskID = 4
            }
        );
    }
}