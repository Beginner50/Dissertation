using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class FullSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Users_UserID",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_UserID",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "Projects");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Projects",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Deliverable",
                columns: table => new
                {
                    DeliverableID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Filename = table.Column<string>(type: "text", nullable: false),
                    File = table.Column<byte[]>(type: "bytea", nullable: false),
                    SubmissionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TaskID = table.Column<long>(type: "bigint", nullable: false),
                    SubmittedByID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deliverable", x => x.DeliverableID);
                    table.ForeignKey(
                        name: "FK_Deliverable_Users_SubmittedByID",
                        column: x => x.SubmittedByID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeedbackCriteria",
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
                    table.PrimaryKey("PK_FeedbackCriteria", x => x.FeedbackCriteriaID);
                    table.ForeignKey(
                        name: "FK_FeedbackCriteria_Deliverable_DeliverableID",
                        column: x => x.DeliverableID,
                        principalTable: "Deliverable",
                        principalColumn: "DeliverableID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FeedbackCriteria_Users_ProvidedByID",
                        column: x => x.ProvidedByID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    TaskID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    StagingDeliverableID = table.Column<long>(type: "bigint", nullable: true),
                    SubmittedDeliverableID = table.Column<long>(type: "bigint", nullable: true),
                    ProjectID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.TaskID);
                    table.ForeignKey(
                        name: "FK_Tasks_Deliverable_StagingDeliverableID",
                        column: x => x.StagingDeliverableID,
                        principalTable: "Deliverable",
                        principalColumn: "DeliverableID");
                    table.ForeignKey(
                        name: "FK_Tasks_Deliverable_SubmittedDeliverableID",
                        column: x => x.SubmittedDeliverableID,
                        principalTable: "Deliverable",
                        principalColumn: "DeliverableID");
                    table.ForeignKey(
                        name: "FK_Tasks_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProgressLogEntry",
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
                    table.PrimaryKey("PK_ProgressLogEntry", x => x.ProgressLogEntryID);
                    table.ForeignKey(
                        name: "FK_ProgressLogEntry_Meetings_MeetingID",
                        column: x => x.MeetingID,
                        principalTable: "Meetings",
                        principalColumn: "MeetingID");
                    table.ForeignKey(
                        name: "FK_ProgressLogEntry_Projects_ProjectID",
                        column: x => x.ProjectID,
                        principalTable: "Projects",
                        principalColumn: "ProjectID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProgressLogEntry_Tasks_TaskID",
                        column: x => x.TaskID,
                        principalTable: "Tasks",
                        principalColumn: "TaskID");
                });

            migrationBuilder.CreateTable(
                name: "Reminders",
                columns: table => new
                {
                    ReminderID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RemindAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                        principalColumn: "TaskID");
                    table.ForeignKey(
                        name: "FK_Reminders_Users_RecipientID",
                        column: x => x.RecipientID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 1L,
                column: "Status",
                value: "pending");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 2L,
                column: "Status",
                value: "pending");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 3L,
                column: "Status",
                value: "accepted");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 4L,
                column: "Status",
                value: "pending");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 5L,
                column: "Status",
                value: "accepted");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 6L,
                column: "Status",
                value: "pending");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 7L,
                column: "Status",
                value: "accepted");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 8L,
                column: "Status",
                value: "pending");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 9L,
                column: "Status",
                value: "accepted");

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 1L,
                column: "Description",
                value: "Research on AI algorithms");

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 2L,
                column: "Description",
                value: "Research on Optical Character Recognition");

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 3L,
                column: "Description",
                value: "Development of Blockchain applications");

            migrationBuilder.CreateIndex(
                name: "IX_Deliverable_SubmittedByID",
                table: "Deliverable",
                column: "SubmittedByID");

            migrationBuilder.CreateIndex(
                name: "IX_Deliverable_TaskID",
                table: "Deliverable",
                column: "TaskID");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackCriteria_DeliverableID",
                table: "FeedbackCriteria",
                column: "DeliverableID");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackCriteria_ProvidedByID",
                table: "FeedbackCriteria",
                column: "ProvidedByID");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressLogEntry_MeetingID",
                table: "ProgressLogEntry",
                column: "MeetingID");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressLogEntry_ProjectID",
                table: "ProgressLogEntry",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressLogEntry_TaskID",
                table: "ProgressLogEntry",
                column: "TaskID");

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
                name: "IX_Tasks_StagingDeliverableID",
                table: "Tasks",
                column: "StagingDeliverableID");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_SubmittedDeliverableID",
                table: "Tasks",
                column: "SubmittedDeliverableID");

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverable_Tasks_TaskID",
                table: "Deliverable",
                column: "TaskID",
                principalTable: "Tasks",
                principalColumn: "TaskID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Deliverable_Tasks_TaskID",
                table: "Deliverable");

            migrationBuilder.DropTable(
                name: "FeedbackCriteria");

            migrationBuilder.DropTable(
                name: "ProgressLogEntry");

            migrationBuilder.DropTable(
                name: "Reminders");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "Deliverable");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Projects",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<long>(
                name: "UserID",
                table: "Projects",
                type: "bigint",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 1L,
                column: "Status",
                value: "Accepted");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 2L,
                column: "Status",
                value: "Pending");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 3L,
                column: "Status",
                value: "Accepted");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 4L,
                column: "Status",
                value: "Pending");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 5L,
                column: "Status",
                value: "Accepted");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 6L,
                column: "Status",
                value: "Pending");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 7L,
                column: "Status",
                value: "Accepted");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 8L,
                column: "Status",
                value: "Pending");

            migrationBuilder.UpdateData(
                table: "Meetings",
                keyColumn: "MeetingID",
                keyValue: 9L,
                column: "Status",
                value: "Accepted");

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 1L,
                columns: new[] { "Description", "UserID" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 2L,
                columns: new[] { "Description", "UserID" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 3L,
                columns: new[] { "Description", "UserID" },
                values: new object[] { null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_UserID",
                table: "Projects",
                column: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Users_UserID",
                table: "Projects",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");
        }
    }
}
