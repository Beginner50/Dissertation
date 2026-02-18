using System.Text.Json;
using Google.GenAI;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Lib;
using PMS.Models;

namespace PMS.Services;


public class FeedbackService
{
    protected readonly PMSDbContext dbContext;
    protected readonly NotificationService notificationService;
    protected readonly ReminderService reminderService;
    protected readonly AIService AIService;
    protected readonly ILogger<FeedbackService> logger;

    public FeedbackService(
        PMSDbContext dbContext,
        AIService aiService,
        NotificationService notificationService,
        ReminderService reminderService,
        ILogger<FeedbackService> logger
    )
    {
        this.dbContext = dbContext;
        this.logger = logger;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
        this.AIService = aiService;
    }

    public async Task<IEnumerable<FeedbackCriterion>> GetFeedbackCriteria(
        long userID, long projectID, long taskID
    )
    {
        return await dbContext.FeedbackCriterias
                    .Where(f => f.TaskID == taskID &&
                                  f.Task.ProjectID == projectID &&
                                    (f.Task.Project.StudentID == userID ||
                                      f.Task.Project.SupervisorID == userID))
                    .ToListAsync();
    }

    public async Task CreateFeedbackCriterion
        (long userID, long projectID, long taskID, string description, string? status)
    {
        var task = await dbContext.Tasks.Where(t => t.ProjectTaskID == taskID &&
                                                     t.ProjectID == projectID &&
                                                         t.AssignedByID == userID &&
                                                         t.Project.Status != "archived")
                                             .Include(t => t.SubmittedDeliverable)
                                             .Include(t => t.FeedbackCriterias)
                                             .FirstOrDefaultAsync()
                                             ?? throw new UnauthorizedAccessException("Task Not Found!");
        if (task.SubmittedDeliverable == null)
            throw new UnauthorizedAccessException("Feedback Provision Not Allowed For Task Without Deliverable Submission!");

        var newCriterion = new FeedbackCriterion
        {
            Description = description,
            Status = status ?? "unmet",
            ProvidedByID = userID,
            TaskID = taskID,
        };

        await dbContext.AddAsync(newCriterion);
        await dbContext.SaveChangesAsync();
    }

    public async Task EditFeedbackCriterion
        (long userID, long projectID, long taskID, long feedbackCriterionID
            , string? description = null, string? status = null)
    {
        var feedbackCriterion = await dbContext.FeedbackCriterias.Where(f =>
                    f.FeedbackCriterionID == feedbackCriterionID &&
                    f.Task.ProjectTaskID == taskID &&
                    f.Task.ProjectID == projectID &&
                    f.Task.AssignedByID == userID &&
                    f.Task.Project.Status != "archived"
                )
               .FirstOrDefaultAsync()
               ?? throw new UnauthorizedAccessException("Feedback Criterion Not Found!");

        feedbackCriterion.Description = description ?? feedbackCriterion.Description;
        feedbackCriterion.Status = status ?? feedbackCriterion.Status;

        await dbContext.SaveChangesAsync();
    }

    public async Task OverrideFeedbackCriterion
            (long userID, long projectID, long taskID, long feedbackCriterionID, string? status)
    {
        var feedbackCriterion = await dbContext.FeedbackCriterias.Where(f =>
                    f.FeedbackCriterionID == feedbackCriterionID &&
                    f.Task.ProjectTaskID == taskID &&
                    f.Task.ProjectID == projectID &&
                    f.Task.Project.StudentID == userID &&
                    f.Task.Project.Status != "archived"
                )
               .FirstOrDefaultAsync()
               ?? throw new UnauthorizedAccessException("Feedback Criterion Not Found!");

        feedbackCriterion.Status = status ?? "overridden";

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteFeedbackCriterion
         (long userID, long projectID, long taskID, long feedbackCriterionID)
    {
        var feedbackCriterion = await dbContext.FeedbackCriterias.Where(f =>
                    f.FeedbackCriterionID == feedbackCriterionID &&
                    f.Task.ProjectTaskID == taskID &&
                    f.Task.ProjectID == projectID &&
                    f.Task.AssignedByID == userID &&
                    f.Task.Project.Status != "archived"
                )
               .FirstOrDefaultAsync()
               ?? throw new UnauthorizedAccessException("Feedback Criterion Not Found!");

        dbContext.Remove(feedbackCriterion);
        await dbContext.SaveChangesAsync();
    }

    public async Task AIFeedbackComplianceCheck(
        long userID, long projectID, long taskID
    )
    {
        var task = await dbContext.Tasks.Where(
                    t => t.ProjectTaskID == taskID
                        && t.ProjectID == projectID
                            && (t.Project.StudentID == userID || t.Project.SupervisorID == userID)
                            && t.Project.Status != "archived"
                    )
                    .Include(t => t.SubmittedDeliverable)
                    .Include(t => t.StagedDeliverable)
                    .Include(t => t.FeedbackCriterias)
                    .FirstOrDefaultAsync()
                    ?? throw new UnauthorizedAccessException("Task Not Found!");
        if (task.StagedDeliverable == null || task.SubmittedDeliverable == null)
            throw new Exception("Staged Or Submitted Deliverable Not Found!");
        if (task.FeedbackCriterias == null || task.FeedbackCriterias.Count == 0)
            throw new UnauthorizedAccessException("Prior Feedback Criteria Not Found!");


        var newFeedbackCriteriaMap = (await AIService.EvaluateFeedbackCriteria(
                    task,
                    previousDeliverable: task.SubmittedDeliverable.File,
                    newDeliverable: task.StagedDeliverable.File,
                    previousCriteria: task.FeedbackCriterias.Where(c => c.Status == "unmet")
                                      .ToList()
            )).ToDictionary(c => c.FeedbackCriterionID);

        task.FeedbackCriterias.ForEach(c =>
        {
            var updatedCriterion = newFeedbackCriteriaMap[c.FeedbackCriterionID];

            c.ChangeObserved = updatedCriterion.ChangeObserved;
            c.Status = updatedCriterion.Status ?? c.Status;
        });

        await dbContext.SaveChangesAsync();
    }
}