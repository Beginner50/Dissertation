using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class SchemaFix2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reminders_MeetingID",
                table: "Reminders");

            migrationBuilder.CreateIndex(
                name: "IX_Reminders_MeetingID",
                table: "Reminders",
                column: "MeetingID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reminders_MeetingID",
                table: "Reminders");

            migrationBuilder.CreateIndex(
                name: "IX_Reminders_MeetingID",
                table: "Reminders",
                column: "MeetingID",
                unique: true);
        }
    }
}
