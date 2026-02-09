using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class Rem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 1L);

            migrationBuilder.DeleteData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 2L);

            migrationBuilder.DeleteData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 3L);

            migrationBuilder.DeleteData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 4L);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 4L);

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 1L,
                column: "StudentID",
                value: null);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 3L,
                columns: new[] { "Email", "Name" },
                values: new object[] { "prashant.jatoo@umail.uom.ac.mu", "Rebellius" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Meetings",
                columns: new[] { "MeetingID", "AttendeeID", "Description", "End", "OrganizerID", "Start", "Status", "TaskID" },
                values: new object[,]
                {
                    { 1L, 3L, null, new DateTime(2026, 1, 30, 11, 0, 0, 0, DateTimeKind.Utc), 2L, new DateTime(2026, 1, 30, 10, 0, 0, 0, DateTimeKind.Utc), "pending", 1L },
                    { 2L, 2L, null, new DateTime(2026, 1, 22, 15, 0, 0, 0, DateTimeKind.Utc), 3L, new DateTime(2026, 1, 22, 14, 0, 0, 0, DateTimeKind.Utc), "pending", 2L },
                    { 3L, 3L, null, new DateTime(2026, 1, 30, 10, 30, 0, 0, DateTimeKind.Utc), 2L, new DateTime(2026, 1, 30, 9, 30, 0, 0, DateTimeKind.Utc), "accepted", 1L },
                    { 4L, 2L, null, new DateTime(2026, 1, 23, 12, 0, 0, 0, DateTimeKind.Utc), 3L, new DateTime(2026, 1, 23, 11, 0, 0, 0, DateTimeKind.Utc), "rejected", 3L }
                });

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 1L,
                column: "StudentID",
                value: 3L);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 3L,
                columns: new[] { "Email", "Name" },
                values: new object[] { "prashant_pms@outlook.com", "Roland" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserID", "Email", "IsDeleted", "Name", "Password", "RefreshToken", "Role" },
                values: new object[] { 4L, "prashant.jatoo@umail.uom.ac.mu", false, "Rebellius", "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m", "", "student" });
        }
    }
}
