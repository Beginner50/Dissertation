using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class Test : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 3L,
                columns: new[] { "Email", "Name" },
                values: new object[] { "prashant_pms@outlook.com", "Roland" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserID", "Email", "IsDeleted", "Name", "Password", "RefreshToken", "Role" },
                values: new object[] { 4L, "prashant.jatoo@umail.uom.ac.mu", false, "Rebellius", "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m", "", "student" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 4L);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 3L,
                columns: new[] { "Email", "Name" },
                values: new object[] { "prashant.jatoo@umail.uom.ac.mu", "Rebellius" });
        }
    }
}
