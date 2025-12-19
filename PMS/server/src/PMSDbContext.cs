using Microsoft.EntityFrameworkCore;
using PMS.Models;
namespace PMS.DatabaseContext;

/*
    More information on how to configure EF core with postgresql provider can be found here:
    https://www.nuget.org/packages/Npgsql.EntityFrameworkCore.PostgreSQL
*/
public class PMSDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Meeting> Meetings { get; set; }

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
                Status = "Active",
                StudentID = 1,     // Matches Alice
                SupervisorID = 2   // Matches Dr. Smith
            }, new Project
            {
                ProjectID = 2,
                Title = "OCR Research",
                Status = "Active",
                StudentID = 3,     // Matches Hashim
                SupervisorID = 2   // Matches Dr. Smith
            },
            new Project
            {
                ProjectID = 3,
                Title = "Blockchain Dev",
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
                Status = "Accepted",
                Start = new DateTime(2025, 12, 20, 10, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 20, 11, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 2,
                ProjectID = 1,
                OrganizerID = 1,
                AttendeeID = 2,
                Status = "Pending",
                Start = new DateTime(2025, 12, 21, 14, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 21, 15, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 3,
                ProjectID = 1,
                OrganizerID = 2,
                AttendeeID = 1,
                Status = "Accepted",
                Start = new DateTime(2025, 12, 22, 09, 30, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 22, 10, 30, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 4,
                ProjectID = 1,
                OrganizerID = 1,
                AttendeeID = 2,
                Status = "Pending",
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
                Status = "Accepted",
                Start = new DateTime(2025, 12, 20, 13, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 20, 14, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 6,
                ProjectID = 2,
                OrganizerID = 3,
                AttendeeID = 2,
                Status = "Pending",
                Start = new DateTime(2025, 12, 21, 10, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 21, 11, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 7,
                ProjectID = 2,
                OrganizerID = 2,
                AttendeeID = 3,
                Status = "Accepted",
                Start = new DateTime(2025, 12, 22, 15, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 22, 16, 0, 0, DateTimeKind.Utc)
            },
            new Meeting
            {
                MeetingID = 8,
                ProjectID = 2,
                OrganizerID = 3,
                AttendeeID = 2,
                Status = "Pending",
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
                Status = "Accepted",
                Start = new DateTime(2025, 12, 24, 10, 0, 0, DateTimeKind.Utc),
                End = new DateTime(2025, 12, 24, 11, 0, 0, DateTimeKind.Utc)
            }
        );
        // Specify the cardinality of the relationships between the entities
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Student)
            .WithMany()
            .HasForeignKey(p => p.StudentID);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.Supervisor)
            .WithMany()
            .HasForeignKey(p => p.SupervisorID);

        modelBuilder.Entity<Meeting>()
                    .HasOne(p => p.Project)
                    .WithMany()
                    .HasForeignKey(p => p.ProjectID);

        modelBuilder.Entity<Meeting>()
            .HasOne(p => p.Attendee)
            .WithMany()
            .HasForeignKey(p => p.AttendeeID);

        modelBuilder.Entity<Meeting>()
            .HasOne(p => p.Organizer)
            .WithMany()
            .HasForeignKey(p => p.OrganizerID);


    }
}