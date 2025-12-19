using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class MeetingModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "Meetings",
                columns: table => new
                {
                    MeetingID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    End = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    OrganizerID = table.Column<long>(type: "bigint", nullable: false),
                    AttendeeID = table.Column<long>(type: "bigint", nullable: false),
                    ProjectID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meetings", x => x.MeetingID);
                    table.ForeignKey(
                        name: "FK_Meetings_Users_AttendeeID",
                        column: x => x.AttendeeID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Meetings_Users_OrganizerID",
                        column: x => x.OrganizerID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    ProjectID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    StudentID = table.Column<long>(type: "bigint", nullable: true),
                    SupervisorID = table.Column<long>(type: "bigint", nullable: true),
                    UserID = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.ProjectID);
                    table.ForeignKey(
                        name: "FK_Projects_Users_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_Projects_Users_SupervisorID",
                        column: x => x.SupervisorID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_Projects_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserID", "Email", "IsDeleted", "Name", "Password", "Role" },
                values: new object[,]
                {
                    { 1L, "alice@uni.com", false, "Alice Student", "hashed_password", "Student" },
                    { 2L, "smith@uni.com", false, "Dr. Smith", "hashed_password", "Supervisor" },
                    { 3L, "hashim@uni.com", false, "Hashim", "hashed_password", "Student" },
                    { 4L, "charlie@uni.com", false, "Charlie Student", "hashed_password", "Student" },
                    { 5L, "brown@uni.com", false, "Dr. Brown", "hashed_password", "Supervisor" }
                });

            migrationBuilder.InsertData(
                table: "Meetings",
                columns: new[] { "MeetingID", "AttendeeID", "Description", "End", "OrganizerID", "ProjectID", "Start", "Status" },
                values: new object[,]
                {
                    { 1L, 1L, null, new DateTime(2025, 12, 20, 11, 0, 0, 0, DateTimeKind.Utc), 2L, 1L, new DateTime(2025, 12, 20, 10, 0, 0, 0, DateTimeKind.Utc), "Accepted" },
                    { 2L, 2L, null, new DateTime(2025, 12, 21, 15, 0, 0, 0, DateTimeKind.Utc), 1L, 1L, new DateTime(2025, 12, 21, 14, 0, 0, 0, DateTimeKind.Utc), "Pending" },
                    { 3L, 1L, null, new DateTime(2025, 12, 22, 10, 30, 0, 0, DateTimeKind.Utc), 2L, 1L, new DateTime(2025, 12, 22, 9, 30, 0, 0, DateTimeKind.Utc), "Accepted" },
                    { 4L, 2L, null, new DateTime(2025, 12, 23, 12, 0, 0, 0, DateTimeKind.Utc), 1L, 1L, new DateTime(2025, 12, 23, 11, 0, 0, 0, DateTimeKind.Utc), "Pending" },
                    { 5L, 3L, null, new DateTime(2025, 12, 20, 14, 0, 0, 0, DateTimeKind.Utc), 2L, 2L, new DateTime(2025, 12, 20, 13, 0, 0, 0, DateTimeKind.Utc), "Accepted" },
                    { 6L, 2L, null, new DateTime(2025, 12, 21, 11, 0, 0, 0, DateTimeKind.Utc), 3L, 2L, new DateTime(2025, 12, 21, 10, 0, 0, 0, DateTimeKind.Utc), "Pending" },
                    { 7L, 3L, null, new DateTime(2025, 12, 22, 16, 0, 0, 0, DateTimeKind.Utc), 2L, 2L, new DateTime(2025, 12, 22, 15, 0, 0, 0, DateTimeKind.Utc), "Accepted" },
                    { 8L, 2L, null, new DateTime(2025, 12, 23, 10, 0, 0, 0, DateTimeKind.Utc), 3L, 2L, new DateTime(2025, 12, 23, 9, 0, 0, 0, DateTimeKind.Utc), "Pending" },
                    { 9L, 4L, null, new DateTime(2025, 12, 24, 11, 0, 0, 0, DateTimeKind.Utc), 5L, 3L, new DateTime(2025, 12, 24, 10, 0, 0, 0, DateTimeKind.Utc), "Accepted" }
                });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "ProjectID", "Description", "Status", "StudentID", "SupervisorID", "Title", "UserID" },
                values: new object[,]
                {
                    { 1L, null, "Active", 1L, 2L, "AI Research", null },
                    { 2L, null, "Active", 3L, 2L, "OCR Research", null },
                    { 3L, null, "Active", 4L, 5L, "Blockchain Dev", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_AttendeeID",
                table: "Meetings",
                column: "AttendeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_OrganizerID",
                table: "Meetings",
                column: "OrganizerID");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_StudentID",
                table: "Projects",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_SupervisorID",
                table: "Projects",
                column: "SupervisorID");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_UserID",
                table: "Projects",
                column: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Meetings");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
