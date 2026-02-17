using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class NewSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Tasks",
                keyColumn: "ProjectTaskID",
                keyValue: 1L);

            migrationBuilder.DeleteData(
                table: "Tasks",
                keyColumn: "ProjectTaskID",
                keyValue: 2L);

            migrationBuilder.DeleteData(
                table: "Tasks",
                keyColumn: "ProjectTaskID",
                keyValue: 3L);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 4L);

            migrationBuilder.DeleteData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 1L);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 2L);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 3L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserID", "Email", "IsDeleted", "Name", "Password", "RefreshToken", "Role" },
                values: new object[,]
                {
                    { 2L, "jatooprashant099@gmail.com", false, "Dr. Smith", "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m", "", "supervisor" },
                    { 3L, "prashant_pms@outlook.com", false, "Roland", "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m", "", "student" },
                    { 4L, "prashant.jatoo@umail.uom.ac.mu", false, "Rebellius", "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m", "", "student" }
                });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "ProjectID", "Description", "Status", "StudentID", "SupervisorID", "Title" },
                values: new object[] { 1L, "Research on AI algorithms", "active", 3L, 2L, "AI Research" });

            migrationBuilder.InsertData(
                table: "Tasks",
                columns: new[] { "ProjectTaskID", "AssignedByID", "AssignedDate", "Description", "DueDate", "IsLocked", "ProjectID", "StagedDeliverableID", "SubmittedDeliverableID", "Title" },
                values: new object[,]
                {
                    { 1L, 2L, new DateTime(2025, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Review current papers on Transformer models.", new DateTime(2025, 11, 15, 0, 0, 0, 0, DateTimeKind.Utc), false, 1L, null, null, "Literature Review" },
                    { 2L, 2L, new DateTime(2025, 12, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Gather and clean the training dataset.", new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), false, 1L, null, null, "Dataset Collection" },
                    { 3L, 2L, new DateTime(2025, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Submit the formal research proposal.", new DateTime(2025, 10, 15, 0, 0, 0, 0, DateTimeKind.Utc), false, 1L, null, null, "Proposal Submission" }
                });
        }
    }
}
