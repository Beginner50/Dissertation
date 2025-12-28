using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class UnsupervisedStudentsTest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserID", "Email", "IsDeleted", "Name", "Password", "Role" },
                values: new object[,]
                {
                    { 6L, "agent@smith.com", false, "Agent Smith", "hashed_password", "student" },
                    { 7L, "rebellius@uni.com", false, "Rebellius", "hashed_password", "student" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 6L);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 7L);
        }
    }
}
