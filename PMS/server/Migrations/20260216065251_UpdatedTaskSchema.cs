using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedTaskSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeedbackCriterias_Deliverables_DeliverableID",
                table: "FeedbackCriterias");

            migrationBuilder.DropIndex(
                name: "IX_FeedbackCriterias_DeliverableID",
                table: "FeedbackCriterias");

            migrationBuilder.RenameColumn(
                name: "DeliverableID",
                table: "FeedbackCriterias",
                newName: "TaskID");

            migrationBuilder.AddColumn<long>(
                name: "ProjectTaskID",
                table: "FeedbackCriterias",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackCriterias_ProjectTaskID",
                table: "FeedbackCriterias",
                column: "ProjectTaskID");

            migrationBuilder.AddForeignKey(
                name: "FK_FeedbackCriterias_Tasks_ProjectTaskID",
                table: "FeedbackCriterias",
                column: "ProjectTaskID",
                principalTable: "Tasks",
                principalColumn: "ProjectTaskID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeedbackCriterias_Tasks_ProjectTaskID",
                table: "FeedbackCriterias");

            migrationBuilder.DropIndex(
                name: "IX_FeedbackCriterias_ProjectTaskID",
                table: "FeedbackCriterias");

            migrationBuilder.DropColumn(
                name: "ProjectTaskID",
                table: "FeedbackCriterias");

            migrationBuilder.RenameColumn(
                name: "TaskID",
                table: "FeedbackCriterias",
                newName: "DeliverableID");

            migrationBuilder.CreateIndex(
                name: "IX_FeedbackCriterias_DeliverableID",
                table: "FeedbackCriterias",
                column: "DeliverableID");

            migrationBuilder.AddForeignKey(
                name: "FK_FeedbackCriterias_Deliverables_DeliverableID",
                table: "FeedbackCriterias",
                column: "DeliverableID",
                principalTable: "Deliverables",
                principalColumn: "DeliverableID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
