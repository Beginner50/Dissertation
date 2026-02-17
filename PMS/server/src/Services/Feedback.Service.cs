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

    public async Task CreateFeedbackCriteria(
        long userID, long projectID, long taskID,
        List<CreateFeedbackCriterionDTO> feedbackCriteriaToCreate
    )
    {
        var task = await dbContext.Tasks.Where(t => t.ProjectTaskID == taskID &&
                                                t.ProjectID == projectID &&
                                                    t.AssignedByID == userID &&
                                                    t.Project.Status != "archived")
                                        .Include(t => t.SubmittedDeliverable)
                                        .FirstOrDefaultAsync()
                                        ?? throw new UnauthorizedAccessException("Task Not Found!");

        if (task.SubmittedDeliverable == null)
            throw new UnauthorizedAccessException("Feedback Provision Not Allowed For Task Without Deliverable Submission!");

        var newFeedbackCriteria = feedbackCriteriaToCreate.Select(c => new FeedbackCriterion
        {
            Description = c.Description,
            Status = "unmet",
            ChangeObserved = "",
            TaskID = task.ProjectTaskID,
            ProvidedByID = task.AssignedByID
        });

        await dbContext.FeedbackCriterias.AddRangeAsync(newFeedbackCriteria);
        await dbContext.SaveChangesAsync();
    }

    public async Task UpdateFeedbackCriteria(
        long userID, long projectID, long taskID,
        List<UpdateFeedbackCriterionDTO> feedbackCriteriaToUpdate,
        bool bypassOwnershipCheck = false
    )
    {
        var task = await dbContext.Tasks.Where(t => t.ProjectTaskID == taskID &&
                                                t.ProjectID == projectID &&
                                                    (t.AssignedByID == userID
                                                    || bypassOwnershipCheck) &&
                                                t.Project.Status != "archived"
                                        )
                                        .Include(t => t.FeedbackCriterias)
                                        .FirstOrDefaultAsync()
                                        ?? throw new UnauthorizedAccessException("Task Not Found!");

        if (task.FeedbackCriterias == null || task.FeedbackCriterias.Count == 0)
            throw new UnauthorizedAccessException("Prior Feedback Criteria Not Found!");

        var feedbackCriterionIDs = feedbackCriteriaToUpdate.Select(c => c.FeedbackCriterionID);

        var prevFeedbackCriteria = task.FeedbackCriterias.Where(c =>
                         feedbackCriterionIDs.Contains(c.FeedbackCriterionID))
                        .OrderBy(c => c.FeedbackCriterionID).ToList();

        var newCriteriaValues = feedbackCriteriaToUpdate.OrderBy(c => c.FeedbackCriterionID).ToList();

        if (prevFeedbackCriteria.Count != newCriteriaValues.Count)
            throw new Exception("Invalid Criteria Found In Criteria To Update!");

        for (int i = 0; i < prevFeedbackCriteria.Count; i++)
        {
            prevFeedbackCriteria[i].Description = newCriteriaValues[i].Description ?? prevFeedbackCriteria[i].Description;
            prevFeedbackCriteria[i].Status = newCriteriaValues[i].Status
                                ?? prevFeedbackCriteria[i].Status;
            prevFeedbackCriteria[i].ChangeObserved = newCriteriaValues[i].ChangeObserved
                                ?? prevFeedbackCriteria[i].ChangeObserved;
        }

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteFeedbackCriteria(
        long userID, long projectID, long taskID,
        List<DeleteFeedbackCriterionDTO> feedbackCriteriaToDelete
    )
    {
        var task = await dbContext.Tasks.Where(t => t.ProjectTaskID == taskID &&
                                                t.ProjectID == projectID &&
                                                    t.AssignedByID == userID &&
                                                    t.Project.Status != "archived")
                                        .Include(t => t.FeedbackCriterias)
                                        .FirstOrDefaultAsync()
                                        ?? throw new UnauthorizedAccessException("Task Not Found!");

        if (task.FeedbackCriterias == null || task.FeedbackCriterias.Count == 0)
            throw new UnauthorizedAccessException("Prior Feedback Criteria Not Found!");


        var feedbackCriterionIDs = feedbackCriteriaToDelete.Select(c => c.FeedbackCriterionID);

        var criteriaToDelete = task.FeedbackCriterias.Where(c =>
                         feedbackCriterionIDs.Contains(c.FeedbackCriterionID)).ToList();

        dbContext.FeedbackCriterias.RemoveRange(criteriaToDelete);
        await dbContext.SaveChangesAsync();
    }

    public async Task ProvideFeedbackCriteria(
        long userID, long projectID, long taskID,
        List<CreateFeedbackCriterionDTO> feedbackCriteriaToCreate,
        List<UpdateFeedbackCriterionDTO> feedbackCriteriaToUpdate,
        List<DeleteFeedbackCriterionDTO> feedbackCriteriaToDelete
    )
    {
        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                await CreateFeedbackCriteria(userID, projectID, taskID, feedbackCriteriaToCreate);
                await UpdateFeedbackCriteria(userID, projectID, taskID, feedbackCriteriaToUpdate);
                await DeleteFeedbackCriteria(userID, projectID, taskID, feedbackCriteriaToDelete);

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
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

        if (task.FeedbackCriterias == null || task.FeedbackCriterias.Count == 0)
            throw new UnauthorizedAccessException("Prior Feedback Criteria Not Found!");

        if (task.StagedDeliverable == null || task.SubmittedDeliverable == null)
            throw new Exception("Staged Or Submitted Deliverable Not Found!");

        var newFeedbackCriteria = await AIService.EvaluateFeedbackCriteria(
                    task,
                    previousDeliverable: task.SubmittedDeliverable.File,
                    newDeliverable: task.StagedDeliverable.File,
                    previousCriteria: task.FeedbackCriterias.Where(c => c.Status == "unmet").ToList()
            );

        await UpdateFeedbackCriteria(userID, projectID, taskID, newFeedbackCriteria, bypassOwnershipCheck: true);
    }
}