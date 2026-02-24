using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Lib;
using PMS.Models;

namespace PMS.Services;

public class ReportService
{
    private readonly PMSDbContext dbContext;
    public ReportService(PMSDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task IngestProjectSupervisionList(string filename, byte[] fileData, string contentType)
    {
        if (!Sanitization.IsValidExcel(fileData))
            throw new Exception("File Is Not Valid Excel!");

        var extractedProjects = PDFUtils.IngestProjectSupervisionList(filename, fileData, contentType);
        var extractedProjectEmails = extractedProjects.Select(d => d.StudentEmail)
            .Union(extractedProjects.Select(d => d.SupervisorEmail))
            .Distinct()
            .ToList();
        var extractedProjectTitles = extractedProjects.Select(d => d.Title).ToList();

        var emailUserIDMap = await dbContext.Users
            .Where(u => extractedProjectEmails.Contains(u.Email))
            .ToDictionaryAsync(u => u.Email, u => u.UserID);
        if (emailUserIDMap.Count < extractedProjectEmails.Count)
            throw new Exception("Not All Users In The List Exist!");

        var existingProjects = await dbContext.Projects
            .Where(p => extractedProjectTitles.Contains(p.Title))
            .ToListAsync();
        var newProjects = extractedProjects
            .ExceptBy(existingProjects.Select(p => p.Title), p => p.Title)
            .Select(d => new Project
            {
                Title = d.Title,
                Description = d.Description,
                IsArchived = false,
                StudentID = emailUserIDMap[d.StudentEmail],
                SupervisorID = emailUserIDMap[d.SupervisorEmail]
            })
            .ToList();

        if (newProjects.Count > 0)
        {
            await dbContext.Projects.AddRangeAsync(newProjects);
            await dbContext.SaveChangesAsync();
        }
    }

    public async Task IngestUserList(string filename, byte[] fileData, string contentType)
    {
        if (!Sanitization.IsValidExcel(fileData))
            throw new Exception("File Is Not Valid Excel!");

        var extractedUsers = PDFUtils.IngestUserList(filename, fileData, contentType);
        var extractedUserEmails = extractedUsers.Select(e => e.Email).ToList();

        var existingUsers = await dbContext.Users
                                .Where(u => extractedUserEmails.Contains(u.Email) && !u.IsDeleted)
                                .ToListAsync();
        var newUsers = extractedUsers.ExceptBy(existingUsers.Select(u => u.Email), u => u.Email).ToList();

        if (newUsers.Count > 0)
            dbContext.Users.AddRange(newUsers);

        await dbContext.SaveChangesAsync();
    }

    public async Task<FileDTO> GenerateProgressLogReport(long userID, long projectID)
    {
        var tasksWithMeetings = await dbContext.Tasks
                                    .Include(t => t.Project)
                                        .ThenInclude(p => p.Student)
                                    .Include(t => t.Project)
                                        .ThenInclude(p => p.Supervisor)
                                    .Include(t => t.Meetings)
                                    .Where(t => t.ProjectID == projectID &&
                                            t.Project.SupervisorID == userID || t.Project.StudentID == userID)
                                    .OrderBy(t => t.AssignedDate)
                                    .ToListAsync();

        if (tasksWithMeetings.Count == 0)
            throw new UnauthorizedAccessException("Tasks Not Found!");

        var project = tasksWithMeetings[0].Project;

        var pdfData = PDFUtils.GenerateProgressLogReport(project, tasksWithMeetings);
        return new FileDTO
        {
            Filename = Sanitization.SanitizeFilename($"{project.Title}_ProgressLog_{DateTime.UtcNow:dd/MM/yyyy}"),
            File = pdfData,
            ContentType = "application/pdf"
        };
    }
}