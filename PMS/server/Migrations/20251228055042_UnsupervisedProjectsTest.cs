using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class UnsupervisedProjectsTest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "ProjectID", "Description", "Status", "StudentID", "SupervisorID", "Title" },
                values: new object[,]
                {
                    { 4L, "Optimize an existing compiler", "active", 3L, null, "Compiler Optimization" },
                    { 5L, "Develop an augmented virtual reality application", "active", 1L, null, "Augmented Virtual Reality" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 4L);

            migrationBuilder.DeleteData(
                table: "Projects",
                keyColumn: "ProjectID",
                keyValue: 5L);
        }
    }
}
