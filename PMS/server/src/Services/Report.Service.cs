using System.Diagnostics;
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
        List<ExtractProjectDTO> extractedProjects
    )
    {
        var extractedStudentEmails = extractedProjects.Select(d => d.StudentEmail).ToList();
        var extractedSupervisorEmails = extractedProjects.Select(d => d.SupervisorEmail).ToList();
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
        var emailUserIDMap = await ExtractAndValidateEmailUserIDMap(extractedProjects);

        var existingProjects = await dbContext.Projects
                                    .Where(p => extractedProjects.Select(e => e.Title)
                                                                 .Contains(p.Title))
                                    .ToListAsync();
        var projectsToCreate = extractedProjects
            .ExceptBy(existingProjects.Select(p => p.Title), p => p.Title)
            .ToList();


        if (projectsToCreate.Count > 0)
        {
            using (var transaction = await dbContext.Database.BeginTransactionAsync())
            {
                try
                {

                    var newProjects = projectsToCreate.Select(ps => new Project
                    {
                        Title = ps.Title,
                        Description = ps.Description,
                        IsArchived = false
                    })
                    .ToList();

                    await dbContext.Projects.AddRangeAsync(newProjects);
                    await dbContext.SaveChangesAsync();

                    var supervisions = projectsToCreate.Select(data => new ProjectSupervision
                    {
                        ProjectID = newProjects.First(p => p.Title == data.Title).ProjectID,
                        StudentID = emailUserIDMap[data.StudentEmail],
                        SupervisorID = emailUserIDMap[data.SupervisorEmail]
                    }).ToList();

                    await dbContext.ProjectSupervision.AddRangeAsync(supervisions);
                    await dbContext.SaveChangesAsync();

                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                }
            }
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

    /*
        Allow report generation for Archived Projects
    */
    public async Task<FileDTO> GenerateProgressLogReport(long userID, long projectID)
    {
        var project = await dbContext.ProjectSupervision
                                                    .AsSplitQuery()
                                                    .ContainsMember(userID)
                                                    .Select(ps => ps.Project!)
                                                    .Where(p => p.ProjectID == projectID)
                                                    .Include(p => p.Supervisions)
                                                        .ThenInclude(s => s.Student)
                                                    .Include(p => p.Supervisions)
                                                        .ThenInclude(s => s.Supervisor)
                                                    .Include(p => p.Tasks.OrderBy(t => t.AssignedDate))
                                                        .ThenInclude(t => t.Meetings)
                                                    .FirstOrDefaultAsync()
                                        ?? throw new Exception("Project Not Found!");

        if (project.Tasks.Count == 0)
            throw new UnauthorizedAccessException("Tasks Not Found!");

        var pdfData = PDFUtils.GenerateProgressLogReport(project);

        return new FileDTO
        {
            Filename = Sanitization.SanitizeFilename($"{project.Title}_ProgressLog_{DateTime.UtcNow:dd/MM/yyyy}"),
            File = pdfData,
            ContentType = "application/pdf"
        };
    }
}