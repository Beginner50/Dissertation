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
                    .Where(f => f.Deliverable.TaskID == taskID &&
                                  f.Deliverable.Task.ProjectID == projectID &&
                                    f.Deliverable.Task.SubmittedDeliverableID == f.DeliverableID &&
                                            (f.Deliverable.Task.Project.StudentID == userID ||
                                                f.Deliverable.Task.Project.SupervisorID == userID))
                    .ToListAsync();
    }

    public async Task CreateFeedbackCriteria(
        Deliverable submittedDeliverable,
        List<CreateFeedbackCriterionDTO> feedbackCriteriaToCreate
    )
    {
        var newFeedbackCriteria = feedbackCriteriaToCreate.Select(c => new FeedbackCriterion
        {
            Description = c.Description,
            Status = "unmet",
            ChangeObserved = "",
            DeliverableID = submittedDeliverable.DeliverableID,
            ProvidedByID = submittedDeliverable.Task.AssignedByID
        });

        await dbContext.FeedbackCriterias.AddRangeAsync(newFeedbackCriteria);
        await dbContext.SaveChangesAsync();
    }

    public async Task UpdateFeedbackCriteria(
        Deliverable submittedDeliverable,
        List<UpdateFeedbackCriterionDTO> feedbackCriteriaToUpdate
    )
    {
        var feedbackCriterionIDs = feedbackCriteriaToUpdate.Select(c => c.FeedbackCriterionID);

        var prevFeedbackCriteria = submittedDeliverable.FeedbackCriterias.Where(c =>
                         feedbackCriterionIDs.Contains(c.FeedbackCriterionID))
                        .OrderBy(c => c.FeedbackCriterionID).ToList();
        var newCriteriaValues = feedbackCriteriaToUpdate.OrderBy(c => c.FeedbackCriterionID).ToList();

        if (prevFeedbackCriteria.Count != newCriteriaValues.Count)
            throw new Exception("Not all Criteria to update exists");

        for (int i = 0; i < prevFeedbackCriteria.Count; i++)
        {
            prevFeedbackCriteria[i].Description = newCriteriaValues[i].Description
                                ?? prevFeedbackCriteria[i].Description;
            prevFeedbackCriteria[i].Status = newCriteriaValues[i].Status
                                ?? prevFeedbackCriteria[i].Status;
            prevFeedbackCriteria[i].ChangeObserved = newCriteriaValues[i].ChangeObserved
                                ?? prevFeedbackCriteria[i].ChangeObserved;
        }

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteFeedbackCriteria(
        Deliverable submittedDeliverable,
        List<DeleteFeedbackCriterionDTO> feedbackCriteriaToDelete
    )
    {
        var feedbackCriterionIDs = feedbackCriteriaToDelete.Select(c => c.FeedbackCriterionID);

        var criteriaToDelete = submittedDeliverable.FeedbackCriterias.Where(c =>
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
        var submittedDeliverable = await dbContext.Deliverables
            .Where(d => d.TaskID == taskID
                        && d.Task.SubmittedDeliverableID == d.DeliverableID
                        && d.Task.ProjectID == projectID
                        && (d.Task.Project.StudentID == userID || d.Task.Project.SupervisorID == userID)
            )
            .Include(d => d.FeedbackCriterias)
            .Include(d => d.Task)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Submitted Deliverable Not Found");

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                await CreateFeedbackCriteria(submittedDeliverable, feedbackCriteriaToCreate);
                await UpdateFeedbackCriteria(submittedDeliverable, feedbackCriteriaToUpdate);
                await DeleteFeedbackCriteria(submittedDeliverable, feedbackCriteriaToDelete);

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
                    )
                    .Include(t => t.SubmittedDeliverable)
                        .ThenInclude(sd => sd.FeedbackCriterias)
                    .Include(t => t.StagedDeliverable)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync()
                    ?? throw new UnauthorizedAccessException("Task Not Found");

        if (task.StagedDeliverable == null || task.SubmittedDeliverable == null)
            throw new Exception("Task must have both a Staged and Submitted Deliverable");

        if (task.SubmittedDeliverable.FeedbackCriterias.Count == 0)
            throw new Exception("No Feedback Found for Submitted Deliverable");

        var newFeedbackCriteria = await AIService.EvaluateFeedbackCriteria(
                    task,
                    previousDeliverable: task.SubmittedDeliverable.File,
                    newDeliverable: task.StagedDeliverable.File,
                    previousCriteria: task.SubmittedDeliverable.FeedbackCriterias
                                          .Where(c => c.Status == "unmet").ToList()
            );

        await UpdateFeedbackCriteria(task.SubmittedDeliverable, newFeedbackCriteria);
    }
}