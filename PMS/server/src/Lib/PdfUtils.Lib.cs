using System.Reflection.PortableExecutable;
using System.Text;
using PMS.Models;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using UglyToad.PdfPig.Core;
using UglyToad.PdfPig.Fonts.Standard14Fonts;
using UglyToad.PdfPig.Graphics.Colors;
using UglyToad.PdfPig.Writer;

namespace PMS.Lib;

// More information on PDFpig: https://www.nuget.org/packages/PdfPig/0.1.14-alpha-20251224-7c4f5
public class PDFUtils
{
    public static byte[] ExtractPageRanges(byte[] original, List<PageRange> pageRangeList)
    {
        var pagesToInclude = new HashSet<int>();
        foreach (var range in pageRangeList)
        {
            for (int i = range.StartPage; i <= range.EndPage; i++)
                pagesToInclude.Add(i);
        }

        var builder = new PdfDocumentBuilder();
        using (var pdfDocument = PdfDocument.Open(original))
        {
            foreach (var pageNum in pagesToInclude.OrderBy(p => p))
            {
                builder.AddPage(pdfDocument, pageNum);
            }
        }

        return builder.Build();
    }

    /*
        Parse the document to identify distinct sections based on a heuristic (assumptions for
        heuristic given in TableOfContent.Lib.cs) 

        Output the TableOfContent in string format.
        Example:

            Document (Page 1-7)
                Analysis (Page 1-5) 
                    Solutions Review (Page 1-4)
                        Creatix Campus (Page 1-2)
                        Beekhy's PMS (Page 2-4)
                References (Page 5-7)
        
        NOTE:
        Explanation for line:
             var lines = page.GetWords().GroupBy(w => Math.Round(w.BoundingBox.Bottom, 0));

        The pdf parser does not normally which words belong on the same line, and hence, we
        have to group them manually.

        However, since each word has a bounding box (xLeft, yTop, xRight, yBottom), and each
        word on the same line usually having the same yBottom (given in floating point), we
        can group them by their integer values.
    */
    public static string GenerateTableOfContent(byte[] pdfData)
    {
        using (PdfDocument pdfDocument = PdfDocument.Open(pdfData))
        {
            var tocTreeBuilder = new TableOfContentTreeBuilder(1, pdfDocument.NumberOfPages);

            foreach (var page in pdfDocument.GetPages())
            {
                var lines = page.GetWords().GroupBy(w => Math.Round(w.BoundingBox.Bottom, 0));

                foreach (var line in lines)
                {
                    var firstWord = line.First();
                    var fontSize = firstWord.Letters[0].FontSize;
                    var isBold = firstWord.Letters.Any(l => l.FontName.Contains("Bold") || l.FontName.Contains("Heavy"));

                    if (fontSize > 12 && isBold)
                    {
                        var sectionName = string.Join(" ", line.Select(w => w.Text));

                        tocTreeBuilder.AddNode(fontSize, sectionName, page.Number);
                    }
                }
            }

            var tableOfContents = tocTreeBuilder.Build();
            return tableOfContents.ToString();
        }
    }

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
}