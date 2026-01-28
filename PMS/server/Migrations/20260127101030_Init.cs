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
                    Email = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Password = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    RefreshToken = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
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
                    RecipientID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationID);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_RecipientID",
                        column: x => x.RecipientID,
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
                name: "Deliverables",
                columns: table => new
                {
                    DeliverableID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Filename = table.Column<string>(type: "text", nullable: false),
                    File = table.Column<byte[]>(type: "bytea", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
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
                    FeedbackCriterionID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ChangeObserved = table.Column<string>(type: "text", nullable: true),
                    DeliverableID = table.Column<long>(type: "bigint", nullable: false),
                    ProvidedByID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedbackCriterias", x => x.FeedbackCriterionID);
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
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false),
                    StagedDeliverableID = table.Column<long>(type: "bigint", nullable: true),
                    SubmittedDeliverableID = table.Column<long>(type: "bigint", nullable: true),
                    ProjectID = table.Column<long>(type: "bigint", nullable: false),
                    AssignedByID = table.Column<long>(type: "bigint", nullable: false)
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
                    table.ForeignKey(
                        name: "FK_Tasks_Users_AssignedByID",
                        column: x => x.AssignedByID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
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
                    TaskID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meetings", x => x.MeetingID);
                    table.ForeignKey(
                        name: "FK_Meetings_Tasks_TaskID",
                        column: x => x.TaskID,
                        principalTable: "Tasks",
                        principalColumn: "ProjectTaskID",
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
                    { 1L, "admin@uni.com", false, "Admin", "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m", "", "admin" },
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
                columns: new[] { "ProjectTaskID", "AssignedByID", "AssignedDate", "Description", "DueDate", "IsLocked", "ProjectID", "StagedDeliverableID", "Status", "SubmittedDeliverableID", "Title" },
                values: new object[,]
                {
                    { 1L, 2L, new DateTime(2025, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Review current papers on Transformer models.", new DateTime(2025, 11, 15, 0, 0, 0, 0, DateTimeKind.Utc), false, 1L, null, "completed", null, "Literature Review" },
                    { 2L, 2L, new DateTime(2025, 12, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Gather and clean the training dataset.", new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), false, 1L, null, "pending", null, "Dataset Collection" },
                    { 3L, 2L, new DateTime(2025, 10, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Submit the formal research proposal.", new DateTime(2025, 10, 15, 0, 0, 0, 0, DateTimeKind.Utc), false, 1L, null, "missing", null, "Proposal Submission" }
                });

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
                name: "IX_Meetings_TaskID",
                table: "Meetings",
                column: "TaskID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientID",
                table: "Notifications",
                column: "RecipientID");

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
                name: "IX_Tasks_AssignedByID",
                table: "Tasks",
                column: "AssignedByID");

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
