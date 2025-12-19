using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class Project : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Meetings_ProjectID",
                table: "Meetings",
                column: "ProjectID");

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Projects_ProjectID",
                table: "Meetings",
                column: "ProjectID",
                principalTable: "Projects",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Projects_ProjectID",
                table: "Meetings");

            migrationBuilder.DropIndex(
                name: "IX_Meetings_ProjectID",
                table: "Meetings");
        }
    }
}
