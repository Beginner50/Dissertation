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

    private async Task<Dictionary<string, long>> ExtractAndValidateEmailUserIDMap(
        List<string> extractedStudentEmails,
        List<string> extractedSupervisorEmails
    )
    {
        var allEmails = extractedStudentEmails.Union(extractedSupervisorEmails).ToList();

        var users = await dbContext.Users
            .NotDeleted()
            .Where(u => allEmails.Contains(u.Email))
            .ToListAsync();

        var studentMap = users
            .Where(u => u.Role == "student")
            .ToDictionary(u => u.Email,
                          u => u.UserID);

        var supervisorMap = users
            .Where(u => u.Role == "supervisor")
            .ToDictionary(u => u.Email, u => u.UserID);

        foreach (var email in extractedStudentEmails)
        {
            if (!studentMap.ContainsKey(email))
                throw new Exception($"Student '{email}' Not Found!");
        }

        foreach (var email in extractedSupervisorEmails)
        {
            if (!supervisorMap.ContainsKey(email))
                throw new Exception($"Supervisor '{email}' Not Found!");
        }

        foreach (var entry in supervisorMap)
        {
            studentMap.TryAdd(entry.Key, entry.Value);
        }

        return studentMap;
    }

    public async Task IngestProjectSupervisionList(string filename, byte[] fileData, string contentType)
    {
        if (!Sanitization.IsValidExcel(fileData))
            throw new Exception("File Is Not Valid Excel!");

        var extractedProjects = PDFUtils.IngestProjectSupervisionList(filename, fileData, contentType);
        var extractedStudentEmails = extractedProjects.Select(d => d.StudentEmail).ToList();
        var extractedSupervisorEmails = extractedProjects.Select(d => d.SupervisorEmail).ToList();
        var extractedProjectTitles = extractedProjects.Select(d => d.Title).ToList();

        var emailUserIDMap = await ExtractAndValidateEmailUserIDMap(extractedStudentEmails, extractedSupervisorEmails);

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