using System.ComponentModel.DataAnnotations;
using ClosedXML.Excel;
using PMS.DTOs;
using PMS.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
namespace PMS.Lib;

// More information on PDFpig: https://www.nuget.org/packages/PdfPig/0.1.14-alpha-20251224-7c4f5
public class PDFUtils
{
    public static byte[] GenerateProgressLogReport(Project project)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(50);
                page.Header().Text("Progress Log Report").FontSize(24).SemiBold().FontColor(Colors.Blue.Medium);

                page.Content().Column(col =>
                {
                    col.Spacing(10);

                    // Header 
                    col.Item().Text($"Project: {project.Title}").FontSize(16).Bold();
                    col.Item().Text($"Generated: {DateTime.Now:dd/MM/yyyy}").Italic();

                    var assignment = project.Assignments.FirstOrDefault();
                    col.Item().Text($"Student: {assignment?.Student?.Name} | Supervisor: {assignment?.Supervisor?.Name}");

                    col.Item().PaddingTop(10).LineHorizontal(1);

                    // Tasks 
                    foreach (var task in project.Tasks)
                    {
                        col.Item().Background(Colors.Grey.Lighten4).Padding(5).Column(taskCol =>
                        {
                            taskCol.Item().Text($"TASK: {task.Title}").Bold();
                            taskCol.Item().Text(task.Description).FontSize(10);

                            foreach (var meeting in task.Meetings)
                            {
                                taskCol.Item().PaddingLeft(10).Text($"• {meeting.Start:dd/MM/yyyy}: {meeting.Description}").FontSize(9);
                            }
                        });
                    }
                });
            });
        }).GeneratePdf();
    }

    public static List<User> IngestUserList(string filename, byte[] fileData, string contentType)
    {
        var users = new List<User>();
        var acceptableRoles = new[] { "student", "supervisor", "admin" };
        var expectedHeaders = new[] { "Name", "Email", "Password", "Role" };

        using (var stream = new MemoryStream(fileData))
        {
            using (var workbook = new XLWorkbook(stream))
            {
                var worksheet = workbook.Worksheets.First();
                var columnMap = MapHeadersToColumns(worksheet.Row(1), expectedHeaders);

                foreach (var row in worksheet.RowsUsed().Skip(1))
                {
                    var name = row.Cell(columnMap["Name"]).GetValue<string>();
                    var email = row.Cell(columnMap["Email"]).GetValue<string>();
                    var rawPassword = row.Cell(columnMap["Password"]).GetValue<string>();
                    var role = row.Cell(columnMap["Role"]).GetValue<string>().ToLower();

                    if (string.IsNullOrEmpty(email) || !(new EmailAddressAttribute().IsValid(email)))
                        throw new Exception($"Row {row.RowNumber()}: Invalid Email Format!");
                    if (string.IsNullOrEmpty(role) || !acceptableRoles.Contains(role))
                        throw new Exception($"Row {row.RowNumber()}: Invalid Role Format!");

                    var newUser = new User
                    {
                        Name = name,
                        Email = email,
                        Password = BCrypt.Net.BCrypt.HashPassword(rawPassword),
                        Role = role
                    };

                    users.Add(newUser);
                }
            }
        }

        return users;
    }

    public static List<ExtractProjectDTO> IngestProjectSupervisionList(string filename, byte[] fileData, string contentType)
    {
        var extractedProjects = new List<ExtractProjectDTO>();
        var expectedHeaders = new[] { "Title", "Description", "Student Email", "Supervisor Email" };

        using (var stream = new MemoryStream(fileData))
        {
            using (var workbook = new XLWorkbook(stream))
            {
                var worksheet = workbook.Worksheets.First();
                var columnMap = MapHeadersToColumns(worksheet.Row(1), expectedHeaders);


                foreach (var row in worksheet.RowsUsed().Skip(1))
                {
                    var studentEmail = row.Cell(columnMap["Student Email"]).GetValue<string>()?.Trim();
                    var supervisorEmail = row.Cell(columnMap["Supervisor Email"]).GetValue<string>()?.Trim();

                    if (string.IsNullOrEmpty(studentEmail) || !new EmailAddressAttribute().IsValid(studentEmail))
                        throw new Exception($"Row {row.RowNumber()}: Invalid Student Email Format!");
                    if (string.IsNullOrEmpty(supervisorEmail) || !new EmailAddressAttribute().IsValid(supervisorEmail))
                        throw new Exception($"Row {row.RowNumber()}: Invalid Supervisor Email Format!");

                    extractedProjects.Add(new ExtractProjectDTO
                    {
                        Title = row.Cell(columnMap["Title"]).GetValue<string>(),
                        Description = row.Cell(columnMap["Description"]).GetValue<string>(),
                        StudentEmail = studentEmail,
                        SupervisorEmail = supervisorEmail
                    });
                }
            }
        }

        return extractedProjects;
    }

    private static Dictionary<string, int> MapHeadersToColumns(IXLRow firstRow, string[] expectedHeaders)
    {
        var columnMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var cell in firstRow.CellsUsed())
        {
            string headerText = cell.GetValue<string>().Trim();
            if (expectedHeaders.Contains(headerText, StringComparer.OrdinalIgnoreCase))
            {
                columnMap[headerText] = cell.Address.ColumnNumber;
            }
        }

        if (columnMap.Count < expectedHeaders.Length)
        {
            var missing = expectedHeaders.Where(h => !columnMap.ContainsKey(h));
            throw new Exception($"Excel is missing required columns: {string.Join(", ", missing)}");
        }

        return columnMap;
    }
}