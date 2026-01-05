using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
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
                    RefreshToken = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    ProjectID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    StudentID = table.Column<long>(type: "bigint", nullable: true),
                    SupervisorID = table.Column<long>(type: "bigint", nullable: true)
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
                        name: "FK_Meetings_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
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
                name: "Deliverables",
                columns: table => new
                {
                    DeliverableID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Filename = table.Column<string>(type: "text", nullable: false),
                    File = table.Column<byte[]>(type: "bytea", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    TableOfContent = table.Column<string>(type: "text", nullable: false),
                    SubmissionTimestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TaskID = table.Column<long>(type: "bigint", nullable: false),
                    SubmittedByID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deliverables", x => x.DeliverableID);
                    table.ForeignKey(
                        name: "FK_Deliverables_Users_SubmittedByID",
                        column: x => x.SubmittedByID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeedbackCriterias",
                columns: table => new
                {
                    FeedbackCriteriaID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DeliverableID = table.Column<long>(type: "bigint", nullable: false),
                    ProvidedByID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedbackCriterias", x => x.FeedbackCriteriaID);
                    table.ForeignKey(
                        name: "FK_FeedbackCriterias_Deliverables_DeliverableID",
                        column: x => x.DeliverableID,
                        principalTable: "Deliverables",
                        principalColumn: "DeliverableID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FeedbackCriterias_Users_ProvidedByID",
                        column: x => x.ProvidedByID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    ProjectTaskID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    StagedDeliverableID = table.Column<long>(type: "bigint", nullable: true),
                    SubmittedDeliverableID = table.Column<long>(type: "bigint", nullable: true),
                    ProjectID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.ProjectTaskID);
                    table.ForeignKey(
                        name: "FK_Tasks_Deliverables_StagedDeliverableID",
                        column: x => x.StagedDeliverableID,
                        principalTable: "Deliverables",
                        principalColumn: "DeliverableID");
                    table.ForeignKey(
                        name: "FK_Tasks_Deliverables_SubmittedDeliverableID",
                        column: x => x.SubmittedDeliverableID,
                        principalTable: "Deliverables",
                        principalColumn: "DeliverableID");
                    table.ForeignKey(
                        name: "FK_Tasks_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RecipientID = table.Column<long>(type: "bigint", nullable: false),
                    MeetingID = table.Column<long>(type: "bigint", nullable: true),
                    TaskID = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationID);
                    table.ForeignKey(
                        name: "FK_Notifications_Meetings_MeetingID",
                        column: x => x.MeetingID,
                        principalTable: "Meetings",
                        principalColumn: "MeetingID");
                    table.ForeignKey(
                        name: "FK_Notifications_Tasks_TaskID",
                        column: x => x.TaskID,
                        principalTable: "Tasks",
                        principalColumn: "ProjectTaskID");
                    table.ForeignKey(
                        name: "FK_Notifications_Users_RecipientID",
                        column: x => x.RecipientID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProgressLogEntries",
                columns: table => new
                {
                    ProgressLogEntryID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ProjectID = table.Column<long>(type: "bigint", nullable: false),
                    MeetingID = table.Column<long>(type: "bigint", nullable: true),
                    TaskID = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgressLogEntries", x => x.ProgressLogEntryID);
                    table.ForeignKey(
                        name: "FK_ProgressLogEntries_Meetings_MeetingID",
                        column: x => x.MeetingID,
                        principalTable: "Meetings",
                        principalColumn: "MeetingID");
                    table.ForeignKey(
                        name: "FK_ProgressLogEntries_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProgressLogEntries_Tasks_TaskID",
                        column: x => x.TaskID,
                        principalTable: "Tasks",
                        principalColumn: "ProjectTaskID");
                });

            migrationBuilder.CreateTable(
                name: "Reminders",
                columns: table => new
                {
                    ReminderID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RemindAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    RecipientID = table.Column<long>(type: "bigint", nullable: false),
                    MeetingID = table.Column<long>(type: "bigint", nullable: true),
                    TaskID = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reminders", x => x.ReminderID);
                    table.ForeignKey(
                        name: "FK_Reminders_Meetings_MeetingID",
                        column: x => x.MeetingID,
                        principalTable: "Meetings",
                        principalColumn: "MeetingID");
                    table.ForeignKey(
                        name: "FK_Reminders_Tasks_TaskID",
                        column: x => x.TaskID,
                        principalTable: "Tasks",
                        principalColumn: "ProjectTaskID");
                    table.ForeignKey(
                        name: "FK_Reminders_Users_RecipientID",
                        column: x => x.RecipientID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserID", "Email", "IsDeleted", "Name", "Password", "RefreshToken", "Role" },
                values: new object[,]
                {
                    { 1L, "alice@uni.com", false, "Alice Student", "hashed_password", "", "student" },
                    { 2L, "smith@uni.com", false, "Dr. Smith", "hashed_password", "", "supervisor" },
                    { 3L, "hashim@uni.com", false, "Hashim", "hashed_password", "", "student" },
                    { 4L, "charlie@uni.com", false, "Charlie Student", "hashed_password", "", "student" },
                    { 5L, "brown@uni.com", false, "Dr. Brown", "hashed_password", "", "supervisor" },
                    { 6L, "agent@smith.com", false, "Agent Smith", "hashed_password", "", "student" },
                    { 7L, "rebellius@uni.com", false, "Rebellius", "hashed_password", "", "student" }
                });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "ProjectID", "Description", "Status", "StudentID", "SupervisorID", "Title" },
                values: new object[,]
                {
                    { 1L, "Research on AI algorithms", "active", 1L, 2L, "AI Research" },
                    { 2L, "Research on Optical Character Recognition", "active", 3L, 2L, "OCR Research" },
                    { 3L, "Development of Blockchain applications", "active", 4L, 5L, "Blockchain Dev" },
                    { 4L, "Optimize an existing compiler", "active", 3L, null, "Compiler Optimization" },
                    { 5L, "Develop an augmented virtual reality application", "active", 1L, null, "Augmented Virtual Reality" }
                });

            migrationBuilder.InsertData(
                table: "Meetings",
                columns: new[] { "MeetingID", "AttendeeID", "Description", "End", "OrganizerID", "ProjectID", "Start", "Status" },
                values: new object[,]
                {
                    { 1L, 1L, null, new DateTime(2025, 12, 20, 11, 0, 0, 0, DateTimeKind.Utc), 2L, 1L, new DateTime(2025, 12, 20, 10, 0, 0, 0, DateTimeKind.Utc), "pending" },
                    { 2L, 2L, null, new DateTime(2025, 12, 21, 15, 0, 0, 0, DateTimeKind.Utc), 1L, 1L, new DateTime(2025, 12, 21, 14, 0, 0, 0, DateTimeKind.Utc), "pending" },
                    { 3L, 1L, null, new DateTime(2025, 12, 22, 10, 30, 0, 0, DateTimeKind.Utc), 2L, 1L, new DateTime(2025, 12, 22, 9, 30, 0, 0, DateTimeKind.Utc), "accepted" },
                    { 4L, 2L, null, new DateTime(2025, 12, 23, 12, 0, 0, 0, DateTimeKind.Utc), 1L, 1L, new DateTime(2025, 12, 23, 11, 0, 0, 0, DateTimeKind.Utc), "pending" },
                    { 5L, 3L, null, new DateTime(2025, 12, 20, 14, 0, 0, 0, DateTimeKind.Utc), 2L, 2L, new DateTime(2025, 12, 20, 13, 0, 0, 0, DateTimeKind.Utc), "accepted" },
                    { 6L, 2L, null, new DateTime(2025, 12, 21, 11, 0, 0, 0, DateTimeKind.Utc), 3L, 2L, new DateTime(2025, 12, 21, 10, 0, 0, 0, DateTimeKind.Utc), "pending" },
                    { 7L, 3L, null, new DateTime(2025, 12, 22, 16, 0, 0, 0, DateTimeKind.Utc), 2L, 2L, new DateTime(2025, 12, 22, 15, 0, 0, 0, DateTimeKind.Utc), "accepted" },
                    { 8L, 2L, null, new DateTime(2025, 12, 23, 10, 0, 0, 0, DateTimeKind.Utc), 3L, 2L, new DateTime(2025, 12, 23, 9, 0, 0, 0, DateTimeKind.Utc), "pending" },
                    { 9L, 4L, null, new DateTime(2025, 12, 24, 11, 0, 0, 0, DateTimeKind.Utc), 5L, 3L, new DateTime(2025, 12, 24, 10, 0, 0, 0, DateTimeKind.Utc), "accepted" }
                });

            migrationBuilder.InsertData(
                table: "Tasks",
                columns: new[] { "ProjectTaskID", "AssignedDate", "Description", "DueDate", "ProjectID", "StagedDeliverableID", "Status", "SubmittedDeliverableID", "Title" },
                values: new object[,]
                {
                    { 1L, new DateTime(2025, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Review current papers on Transformer models.", new DateTime(2025, 11, 15, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, "completed", null, "Literature Review" },
                    { 2L, new DateTime(2025, 11, 16, 0, 0, 0, 0, DateTimeKind.Utc), "Gather and clean the training dataset.", new DateTime(2025, 12, 10, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, "pending", null, "Dataset Collection" },
                    { 3L, new DateTime(2025, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Submit the formal research proposal.", new DateTime(2025, 10, 15, 0, 0, 0, 0, DateTimeKind.Utc), 1L, null, "missing", null, "Proposal Submission" },
                    { 4L, new DateTime(2025, 12, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Compare Tesseract vs EasyOCR.", new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), 2L, null, "pending", null, "Algorithm Selection" },
                    { 5L, new DateTime(2025, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Develop a basic Python script for image-to-text conversion.", new DateTime(2025, 11, 20, 0, 0, 0, 0, DateTimeKind.Utc), 2L, null, "completed", null, "Initial Prototype" },
                    { 6L, new DateTime(2025, 12, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Architect the voting system contract in Solidity.", new DateTime(2025, 12, 20, 0, 0, 0, 0, DateTimeKind.Utc), 3L, null, "pending", null, "Smart Contract Design" }
                });

            migrationBuilder.InsertData(
                table: "Notifications",
                columns: new[] { "NotificationID", "Description", "MeetingID", "RecipientID", "TaskID", "Timestamp", "Type" },
                values: new object[,]
                {
                    { 1L, "Dr. Smith accepted your meeting request.", 3L, 1L, null, new DateTime(2025, 12, 30, 15, 45, 0, 0, DateTimeKind.Utc), "meeting_accepted" },
                    { 2L, "Literature Review has been marked as completed.", null, 1L, 1L, new DateTime(2025, 12, 28, 10, 0, 0, 0, DateTimeKind.Utc), "task_completed" },
                    { 3L, "Hashim updated 'Initial Prototype' details.", null, 2L, 5L, new DateTime(2026, 1, 1, 11, 20, 0, 0, DateTimeKind.Utc), "task_updated" },
                    { 4L, "Dr. Brown scheduled a new meeting.", 9L, 4L, null, new DateTime(2026, 1, 2, 9, 0, 0, 0, DateTimeKind.Utc), "meeting_booked" }
                });

            migrationBuilder.InsertData(
                table: "Reminders",
                columns: new[] { "ReminderID", "MeetingID", "Message", "RecipientID", "RemindAt", "TaskID", "Type" },
                values: new object[,]
                {
                    { 1L, 1L, "Prepare for Dissertation Review", 1L, new DateTime(2026, 1, 4, 9, 0, 0, 0, DateTimeKind.Utc), null, "meeting" },
                    { 2L, null, "Finalize Dataset Collection draft", 1L, new DateTime(2026, 1, 4, 14, 0, 0, 0, DateTimeKind.Utc), 2L, "task" },
                    { 3L, 7L, "Review OCR Research with Hashim", 2L, new DateTime(2026, 1, 5, 10, 0, 0, 0, DateTimeKind.Utc), null, "meeting" },
                    { 4L, null, "Compare Tesseract vs EasyOCR", 3L, new DateTime(2026, 1, 4, 8, 30, 0, 0, DateTimeKind.Utc), 4L, "task" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Deliverables_SubmittedByID",
                table: "Deliverables",
                column: "SubmittedByID");

            migrationBuilder.CreateIndex(
                name: "IX_Deliverables_TaskID",
                table: "Deliverables",
                column: "TaskID");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackCriterias_DeliverableID",
                table: "FeedbackCriterias",
                column: "DeliverableID");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackCriterias_ProvidedByID",
                table: "FeedbackCriterias",
                column: "ProvidedByID");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_AttendeeID",
                table: "Meetings",
                column: "AttendeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_OrganizerID",
                table: "Meetings",
                column: "OrganizerID");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_ProjectID",
                table: "Meetings",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_MeetingID",
                table: "Notifications",
                column: "MeetingID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientID",
                table: "Notifications",
                column: "RecipientID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TaskID",
                table: "Notifications",
                column: "TaskID");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressLogEntries_MeetingID",
                table: "ProgressLogEntries",
                column: "MeetingID");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressLogEntries_ProjectID",
                table: "ProgressLogEntries",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressLogEntries_TaskID",
                table: "ProgressLogEntries",
                column: "TaskID");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_StudentID",
                table: "Projects",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_SupervisorID",
                table: "Projects",
                column: "SupervisorID");

            migrationBuilder.CreateIndex(
                name: "IX_Reminders_MeetingID",
                table: "Reminders",
                column: "MeetingID");

            migrationBuilder.CreateIndex(
                name: "IX_Reminders_RecipientID",
                table: "Reminders",
                column: "RecipientID");

            migrationBuilder.CreateIndex(
                name: "IX_Reminders_TaskID",
                table: "Reminders",
                column: "TaskID");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_ProjectID",
                table: "Tasks",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_StagedDeliverableID",
                table: "Tasks",
                column: "StagedDeliverableID");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_SubmittedDeliverableID",
                table: "Tasks",
                column: "SubmittedDeliverableID");

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverables_Tasks_TaskID",
                table: "Deliverables",
                column: "TaskID",
                principalTable: "Tasks",
                principalColumn: "ProjectTaskID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Deliverables_Tasks_TaskID",
                table: "Deliverables");

            migrationBuilder.DropTable(
                name: "FeedbackCriterias");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "ProgressLogEntries");

            migrationBuilder.DropTable(
                name: "Reminders");

            migrationBuilder.DropTable(
                name: "Meetings");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "Deliverables");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
