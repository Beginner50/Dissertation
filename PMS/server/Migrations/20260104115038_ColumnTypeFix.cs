using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PMS.Migrations
{
    /// <inheritdoc />
    public partial class ColumnTypeFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Password",
                table: "Users",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 1L,
                column: "Password",
                value: "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 2L,
                column: "Password",
                value: "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 3L,
                column: "Password",
                value: "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 4L,
                column: "Password",
                value: "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 5L,
                column: "Password",
                value: "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 6L,
                column: "Password",
                value: "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "UserID",
                keyValue: 7L,
                column: "Password",
                value: "$2a$12$FkZUs6elcp0MMrmAVvZXaud.SkwEG0JSQo0eQueIKmP63bHvbrK1m");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Password",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128);

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
    }
}
