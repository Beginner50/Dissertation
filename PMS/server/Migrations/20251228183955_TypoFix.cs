using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class TypoFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Deliverables_StagingDeliverableID",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_StagingDeliverableID",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "StagingDeliverableID",
                table: "Tasks");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_StagedDeliverableID",
                table: "Tasks",
                column: "StagedDeliverableID");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Deliverables_StagedDeliverableID",
                table: "Tasks",
                column: "StagedDeliverableID",
                principalTable: "Deliverables",
                principalColumn: "DeliverableID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Deliverables_StagedDeliverableID",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_StagedDeliverableID",
                table: "Tasks");

            migrationBuilder.AddColumn<long>(
                name: "StagingDeliverableID",
                table: "Tasks",
                type: "bigint",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "ProjectTaskID",
                keyValue: 1L,
                column: "StagingDeliverableID",
                value: null);

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "ProjectTaskID",
                keyValue: 2L,
                column: "StagingDeliverableID",
                value: null);

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "ProjectTaskID",
                keyValue: 3L,
                column: "StagingDeliverableID",
                value: null);

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "ProjectTaskID",
                keyValue: 4L,
                column: "StagingDeliverableID",
                value: null);

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "ProjectTaskID",
                keyValue: 5L,
                column: "StagingDeliverableID",
                value: null);

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "ProjectTaskID",
                keyValue: 6L,
                column: "StagingDeliverableID",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_StagingDeliverableID",
                table: "Tasks",
                column: "StagingDeliverableID");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Deliverables_StagingDeliverableID",
                table: "Tasks",
                column: "StagingDeliverableID",
                principalTable: "Deliverables",
                principalColumn: "DeliverableID");
        }
    }
}
