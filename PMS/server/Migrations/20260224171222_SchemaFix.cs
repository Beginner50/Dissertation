using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class SchemaFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reminders_Meetings_MeetingID",
                table: "Reminders");

            migrationBuilder.DropForeignKey(
                name: "FK_Reminders_Tasks_TaskID",
                table: "Reminders");

            migrationBuilder.DropIndex(
                name: "IX_Reminders_MeetingID",
                table: "Reminders");

            migrationBuilder.CreateIndex(
                name: "IX_Reminders_MeetingID",
                table: "Reminders",
                column: "MeetingID",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Reminders_Meetings_MeetingID",
                table: "Reminders",
                column: "MeetingID",
                principalTable: "Meetings",
                principalColumn: "MeetingID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reminders_Tasks_TaskID",
                table: "Reminders",
                column: "TaskID",
                principalTable: "Tasks",
                principalColumn: "ProjectTaskID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reminders_Meetings_MeetingID",
                table: "Reminders");

            migrationBuilder.DropForeignKey(
                name: "FK_Reminders_Tasks_TaskID",
                table: "Reminders");

            migrationBuilder.DropIndex(
                name: "IX_Reminders_MeetingID",
                table: "Reminders");

            migrationBuilder.CreateIndex(
                name: "IX_Reminders_MeetingID",
                table: "Reminders",
                column: "MeetingID");

            migrationBuilder.AddForeignKey(
                name: "FK_Reminders_Meetings_MeetingID",
                table: "Reminders",
                column: "MeetingID",
                principalTable: "Meetings",
                principalColumn: "MeetingID");

            migrationBuilder.AddForeignKey(
                name: "FK_Reminders_Tasks_TaskID",
                table: "Reminders",
                column: "TaskID",
                principalTable: "Tasks",
                principalColumn: "ProjectTaskID");
        }
    }
}
