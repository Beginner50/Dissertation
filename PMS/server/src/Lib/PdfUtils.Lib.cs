using System.ComponentModel.DataAnnotations;
using System.Reflection.PortableExecutable;
using System.Text;
using ClosedXML.Excel;
using PMS.DTOs;
using PMS.Models;
using Scalar.AspNetCore;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using UglyToad.PdfPig.Core;
using UglyToad.PdfPig.Fonts.Standard14Fonts;
using UglyToad.PdfPig.Writer;

namespace PMS.Lib;

// More information on PDFpig: https://www.nuget.org/packages/PdfPig/0.1.14-alpha-20251224-7c4f5
public class PDFUtils
{
    public static byte[] GenerateProgressLogReport(Project project, List<ProjectTask> projectTasksWithMeetings)
    {
        var builder = new PdfDocumentBuilder();

        var font = builder.AddStandard14Font(Standard14Font.Helvetica);
        var bold = builder.AddStandard14Font(Standard14Font.HelveticaBold);

        PdfPageBuilder page = builder.AddPage(PageSize.A4);
        double y = 790;
        const double x = 50;

        // Title & Project Header
        page.AddText("Progress Log Report", 20, new PdfPoint(x, y), bold);
        y -= 25;
        page.AddText($"Project: {project.Title}", 14, new PdfPoint(x, y), bold);
        y -= 15;
        page.AddText($"Generated: {DateTime.Now:dd/MM/yyyy}", 10, new PdfPoint(x, y), font);
        y -= 25;

        // Stakeholders
        page.AddText($"Student: {project.Student?.Name} ({project.Student?.UserID})", 11, new PdfPoint(x, y), font);
        y -= 15;
        page.AddText($"Supervisor: {project.Supervisor?.Name} ({project.Supervisor?.UserID})", 11, new PdfPoint(x, y), font);
        y -= 30;

        // Tasks and Meetings
        foreach (var task in projectTasksWithMeetings)
        {
            // Reset page if low on space
            if (y < 100) { page = builder.AddPage(PageSize.A4); y = 790; }

            page.AddText($"TASK: {task.Title}", 12, new PdfPoint(x, y), bold);
            y -= 15;
            page.AddText(task.Description, 10, new PdfPoint(x + 10, y), font);
            y -= 20;

            foreach (var meeting in task.Meetings)
            {
                if (y < 50) { page = builder.AddPage(PageSize.A4); y = 790; }

                page.AddText($"• {meeting.Start:dd/MM/yyyy}: {meeting.Description ?? "No notes"}", 9, new PdfPoint(x + 20, y), font);
                y -= 15;
            }

            // Space between task blocks
            y -= 10;
        }

        return builder.Build();
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

                    if (string.IsNullOrEmpty(studentEmail) || !(new EmailAddressAttribute().IsValid(studentEmail)))
                        throw new Exception($"Row {row.RowNumber()}: Invalid Student Email Format!");
                    if (string.IsNullOrEmpty(supervisorEmail) || !(new EmailAddressAttribute().IsValid(supervisorEmail)))
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