using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class FullSchemaBugFix2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Deliverable_Tasks_TaskID",
                table: "Deliverable");

            migrationBuilder.DropForeignKey(
                name: "FK_Deliverable_Users_SubmittedByID",
                table: "Deliverable");

            migrationBuilder.DropForeignKey(
                name: "FK_FeedbackCriteria_Deliverable_DeliverableID",
                table: "FeedbackCriteria");

            migrationBuilder.DropForeignKey(
                name: "FK_FeedbackCriteria_Users_ProvidedByID",
                table: "FeedbackCriteria");

            migrationBuilder.DropForeignKey(
                name: "FK_ProgressLogEntry_Meetings_MeetingID",
                table: "ProgressLogEntry");

            migrationBuilder.DropForeignKey(
                name: "FK_ProgressLogEntry_Projects_ProjectID",
                table: "ProgressLogEntry");

            migrationBuilder.DropForeignKey(
                name: "FK_ProgressLogEntry_Tasks_TaskID",
                table: "ProgressLogEntry");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Deliverable_StagingDeliverableID",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Deliverable_SubmittedDeliverableID",
                table: "Tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProgressLogEntry",
                table: "ProgressLogEntry");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FeedbackCriteria",
                table: "FeedbackCriteria");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Deliverable",
                table: "Deliverable");

            migrationBuilder.RenameTable(
                name: "ProgressLogEntry",
                newName: "ProgressLogEntries");

            migrationBuilder.RenameTable(
                name: "FeedbackCriteria",
                newName: "FeedbackCriterias");

            migrationBuilder.RenameTable(
                name: "Deliverable",
                newName: "Deliverables");

            migrationBuilder.RenameIndex(
                name: "IX_ProgressLogEntry_TaskID",
                table: "ProgressLogEntries",
                newName: "IX_ProgressLogEntries_TaskID");

            migrationBuilder.RenameIndex(
                name: "IX_ProgressLogEntry_ProjectID",
                table: "ProgressLogEntries",
                newName: "IX_ProgressLogEntries_ProjectID");

            migrationBuilder.RenameIndex(
                name: "IX_ProgressLogEntry_MeetingID",
                table: "ProgressLogEntries",
                newName: "IX_ProgressLogEntries_MeetingID");

            migrationBuilder.RenameIndex(
                name: "IX_FeedbackCriteria_ProvidedByID",
                table: "FeedbackCriterias",
                newName: "IX_FeedbackCriterias_ProvidedByID");

            migrationBuilder.RenameIndex(
                name: "IX_FeedbackCriteria_DeliverableID",
                table: "FeedbackCriterias",
                newName: "IX_FeedbackCriterias_DeliverableID");

            migrationBuilder.RenameIndex(
                name: "IX_Deliverable_TaskID",
                table: "Deliverables",
                newName: "IX_Deliverables_TaskID");

            migrationBuilder.RenameIndex(
                name: "IX_Deliverable_SubmittedByID",
                table: "Deliverables",
                newName: "IX_Deliverables_SubmittedByID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProgressLogEntries",
                table: "ProgressLogEntries",
                column: "ProgressLogEntryID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FeedbackCriterias",
                table: "FeedbackCriterias",
                column: "FeedbackCriteriaID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Deliverables",
                table: "Deliverables",
                column: "DeliverableID");

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverables_Tasks_TaskID",
                table: "Deliverables",
                column: "TaskID",
                principalTable: "Tasks",
                principalColumn: "TaskID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverables_Users_SubmittedByID",
                table: "Deliverables",
                column: "SubmittedByID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FeedbackCriterias_Deliverables_DeliverableID",
                table: "FeedbackCriterias",
                column: "DeliverableID",
                principalTable: "Deliverables",
                principalColumn: "DeliverableID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FeedbackCriterias_Users_ProvidedByID",
                table: "FeedbackCriterias",
                column: "ProvidedByID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProgressLogEntries_Meetings_MeetingID",
                table: "ProgressLogEntries",
                column: "MeetingID",
                principalTable: "Meetings",
                principalColumn: "MeetingID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProgressLogEntries_Projects_ProjectID",
                table: "ProgressLogEntries",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProgressLogEntries_Tasks_TaskID",
                table: "ProgressLogEntries",
                column: "TaskID",
                principalTable: "Tasks",
                principalColumn: "TaskID");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Deliverables_StagingDeliverableID",
                table: "Tasks",
                column: "StagingDeliverableID",
                principalTable: "Deliverables",
                principalColumn: "DeliverableID");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Deliverables_SubmittedDeliverableID",
                table: "Tasks",
                column: "SubmittedDeliverableID",
                principalTable: "Deliverables",
                principalColumn: "DeliverableID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Deliverables_Tasks_TaskID",
                table: "Deliverables");

            migrationBuilder.DropForeignKey(
                name: "FK_Deliverables_Users_SubmittedByID",
                table: "Deliverables");

            migrationBuilder.DropForeignKey(
                name: "FK_FeedbackCriterias_Deliverables_DeliverableID",
                table: "FeedbackCriterias");

            migrationBuilder.DropForeignKey(
                name: "FK_FeedbackCriterias_Users_ProvidedByID",
                table: "FeedbackCriterias");

            migrationBuilder.DropForeignKey(
                name: "FK_ProgressLogEntries_Meetings_MeetingID",
                table: "ProgressLogEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_ProgressLogEntries_Projects_ProjectID",
                table: "ProgressLogEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_ProgressLogEntries_Tasks_TaskID",
                table: "ProgressLogEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Deliverables_StagingDeliverableID",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Deliverables_SubmittedDeliverableID",
                table: "Tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProgressLogEntries",
                table: "ProgressLogEntries");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FeedbackCriterias",
                table: "FeedbackCriterias");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Deliverables",
                table: "Deliverables");

            migrationBuilder.RenameTable(
                name: "ProgressLogEntries",
                newName: "ProgressLogEntry");

            migrationBuilder.RenameTable(
                name: "FeedbackCriterias",
                newName: "FeedbackCriteria");

            migrationBuilder.RenameTable(
                name: "Deliverables",
                newName: "Deliverable");

            migrationBuilder.RenameIndex(
                name: "IX_ProgressLogEntries_TaskID",
                table: "ProgressLogEntry",
                newName: "IX_ProgressLogEntry_TaskID");

            migrationBuilder.RenameIndex(
                name: "IX_ProgressLogEntries_ProjectID",
                table: "ProgressLogEntry",
                newName: "IX_ProgressLogEntry_ProjectID");

            migrationBuilder.RenameIndex(
                name: "IX_ProgressLogEntries_MeetingID",
                table: "ProgressLogEntry",
                newName: "IX_ProgressLogEntry_MeetingID");

            migrationBuilder.RenameIndex(
                name: "IX_FeedbackCriterias_ProvidedByID",
                table: "FeedbackCriteria",
                newName: "IX_FeedbackCriteria_ProvidedByID");

            migrationBuilder.RenameIndex(
                name: "IX_FeedbackCriterias_DeliverableID",
                table: "FeedbackCriteria",
                newName: "IX_FeedbackCriteria_DeliverableID");

            migrationBuilder.RenameIndex(
                name: "IX_Deliverables_TaskID",
                table: "Deliverable",
                newName: "IX_Deliverable_TaskID");

            migrationBuilder.RenameIndex(
                name: "IX_Deliverables_SubmittedByID",
                table: "Deliverable",
                newName: "IX_Deliverable_SubmittedByID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProgressLogEntry",
                table: "ProgressLogEntry",
                column: "ProgressLogEntryID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FeedbackCriteria",
                table: "FeedbackCriteria",
                column: "FeedbackCriteriaID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Deliverable",
                table: "Deliverable",
                column: "DeliverableID");

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverable_Tasks_TaskID",
                table: "Deliverable",
                column: "TaskID",
                principalTable: "Tasks",
                principalColumn: "TaskID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Deliverable_Users_SubmittedByID",
                table: "Deliverable",
                column: "SubmittedByID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FeedbackCriteria_Deliverable_DeliverableID",
                table: "FeedbackCriteria",
                column: "DeliverableID",
                principalTable: "Deliverable",
                principalColumn: "DeliverableID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FeedbackCriteria_Users_ProvidedByID",
                table: "FeedbackCriteria",
                column: "ProvidedByID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProgressLogEntry_Meetings_MeetingID",
                table: "ProgressLogEntry",
                column: "MeetingID",
                principalTable: "Meetings",
                principalColumn: "MeetingID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProgressLogEntry_Projects_ProjectID",
                table: "ProgressLogEntry",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProgressLogEntry_Tasks_TaskID",
                table: "ProgressLogEntry",
                column: "TaskID",
                principalTable: "Tasks",
                principalColumn: "TaskID");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Deliverable_StagingDeliverableID",
                table: "Tasks",
                column: "StagingDeliverableID",
                principalTable: "Deliverable",
                principalColumn: "DeliverableID");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Deliverable_SubmittedDeliverableID",
                table: "Tasks",
                column: "SubmittedDeliverableID",
                principalTable: "Deliverable",
                principalColumn: "DeliverableID");
        }
    }
}
