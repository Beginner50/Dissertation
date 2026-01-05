using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class PasswordUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 1L,
                column: "Password",
                value: "$2a$11$VuPbqwmrwFzfNyMcA5kw5uN8FTANUUch1QVlvY1TFs3hgwK3hVrl2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 2L,
                column: "Password",
                value: "$2a$11$VuPbqwmrwFzfNyMcA5kw5uN8FTANUUch1QVlvY1TFs3hgwK3hVrl2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 3L,
                column: "Password",
                value: "$2a$11$VuPbqwmrwFzfNyMcA5kw5uN8FTANUUch1QVlvY1TFs3hgwK3hVrl2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 4L,
                column: "Password",
                value: "$2a$11$VuPbqwmrwFzfNyMcA5kw5uN8FTANUUch1QVlvY1TFs3hgwK3hVrl2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 5L,
                column: "Password",
                value: "$2a$11$VuPbqwmrwFzfNyMcA5kw5uN8FTANUUch1QVlvY1TFs3hgwK3hVrl2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 6L,
                column: "Password",
                value: "$2a$11$VuPbqwmrwFzfNyMcA5kw5uN8FTANUUch1QVlvY1TFs3hgwK3hVrl2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 7L,
                column: "Password",
                value: "$2a$11$VuPbqwmrwFzfNyMcA5kw5uN8FTANUUch1QVlvY1TFs3hgwK3hVrl2");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 1L,
                column: "Password",
                value: "hashed_password");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 2L,
                column: "Password",
                value: "hashed_password");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 3L,
                column: "Password",
                value: "hashed_password");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 4L,
                column: "Password",
                value: "hashed_password");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 5L,
                column: "Password",
                value: "hashed_password");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 6L,
                column: "Password",
                value: "hashed_password");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 7L,
                column: "Password",
                value: "hashed_password");
        }
    }
}
