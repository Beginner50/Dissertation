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
    protected readonly Client llmClient;
    protected readonly ProjectTaskService projectTaskService;
    protected readonly TaskDeliverableService taskDeliverableService;
    protected readonly NotificationService notificationService;
    protected readonly ReminderService reminderService;
    protected readonly ILogger<FeedbackService> logger;

    public FeedbackService(
        PMSDbContext dbContext,
        Client llmClient,
        ProjectTaskService projectTaskService,
        TaskDeliverableService taskDeliverableService,
        NotificationService notificationService,
        ReminderService reminderService,
        ILogger<FeedbackService> logger
    )
    {
        this.dbContext = dbContext;
        this.llmClient = llmClient;
        this.logger = logger;
        this.projectTaskService = projectTaskService;
        this.taskDeliverableService = taskDeliverableService;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
    }

    public async Task<IEnumerable<FeedbackCriteria>> GetFeedback(
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

    public async Task ProvideFeedback(
        long userID, long projectID, long taskID, IEnumerable<FeedbackDTO> feedbackList
    )
    {
        var submittedDeliverable = await taskDeliverableService.GetSubmittedDeliverable(
            userID,
            projectID,
            taskID
        );

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {

            try
            {
                /*----------------------------- Update Criteria ------------------------------*/
                var criteriaToUpdateIDs = feedbackList.Where(c => c.FeedbackCriteriaID > 0)
                                          .Select(c => c.FeedbackCriteriaID)
                                          .ToHashSet();
                var oldCriteriaValues = submittedDeliverable.FeedbackCriterias.Where(c =>
                                 criteriaToUpdateIDs.Contains(c.FeedbackCriteriaID))
                                .OrderBy(c => c.FeedbackCriteriaID).ToList();
                var newCriteriaValues = feedbackList.Where(c =>
                                 criteriaToUpdateIDs.Contains(c.FeedbackCriteriaID))
                                 .OrderBy(c => c.FeedbackCriteriaID).ToList();

                if (oldCriteriaValues.Count != newCriteriaValues.Count)
                    throw new Exception("Invalid Feedback Criteria Detected During Update!");

                for (int i = 0; i < oldCriteriaValues.Count; i++)
                {
                    oldCriteriaValues[i].Description = newCriteriaValues[i].Description;
                    oldCriteriaValues[i].Status = newCriteriaValues[i].Status;
                }

                /*----------------------------- Delete Criteria ------------------------------*/
                var criteriaToDelete = submittedDeliverable.FeedbackCriterias.Where(c =>
                                 !newCriteriaValues.Select(u => u.FeedbackCriteriaID)
                                 .Contains(c.FeedbackCriteriaID)).ToList();
                if (criteriaToDelete.Count > 0)
                    dbContext.FeedbackCriterias.RemoveRange(criteriaToDelete);


                /*----------------------------- Create Criteria ------------------------------*/
                var criteriaToCreate = feedbackList.Where(x => x.FeedbackCriteriaID == 0).ToList();
                if (criteriaToCreate.Count > 0)
                {
                    var newCriteria = criteriaToCreate.Select(dto => new FeedbackCriteria
                    {
                        Description = dto.Description,
                        Status = "unmet",
                        ChangeObserved = "",
                        DeliverableID = submittedDeliverable.DeliverableID,
                        ProvidedByID = userID
                    });

                    await dbContext.FeedbackCriterias.AddRangeAsync(newCriteria);
                }
                await dbContext.SaveChangesAsync();

                if (criteriaToDelete.Count > 0 || criteriaToUpdateIDs.Count > 0)
                    await notificationService.CreateTaskNotification(taskID, NotificationType.FEEDBACK_UPDATED);
                else
                    await notificationService.CreateTaskNotification(taskID, NotificationType.FEEDBACK_PROVIDED);

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
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
                            && t.Project.StudentID == userID || t.Project.SupervisorID == userID
                    )
                    .Include(t => t.SubmittedDeliverable)
                        .ThenInclude(sd => sd.FeedbackCriterias)
                    .Include(t => t.StagedDeliverable)
                    .FirstOrDefaultAsync()
                    ?? throw new UnauthorizedAccessException("Task Not Found");

        if (task.StagedDeliverable == null || task.SubmittedDeliverable == null)
            throw new Exception("Task must have both a Staged and Submitted Deliverable");

        if (task.SubmittedDeliverable.FeedbackCriterias == null
            || task.SubmittedDeliverable.FeedbackCriterias.Count == 0)
            throw new Exception("No Feedback Found for Submitted Deliverable");

        var oldCriteriaValues = task.SubmittedDeliverable.FeedbackCriterias
                                        .Where(c => c.Status == "unmet")
                                        .OrderBy(c => c.FeedbackCriteriaID)
                                        .ToList();

        var newCriteriaValues = (
            await AIUtils.EvaluateCriteria(
                    llmClient,
                    task,
                    previousDeliverable: task.SubmittedDeliverable.File,
                    newDeliverable: task.StagedDeliverable.File,
                    feedbackCriterias: oldCriteriaValues,
                    logger
            )
        ).OrderBy(c => c.FeedbackCriteriaID).ToList();


        if (oldCriteriaValues.Count != newCriteriaValues.Count)
            throw new Exception("Invalid Feedback Criteria Generated During LLM Ouput!");

        for (int i = 0; i < oldCriteriaValues.Count; i++)
        {
            oldCriteriaValues[i].Status = newCriteriaValues[i].Status;
            oldCriteriaValues[i].ChangeObserved = newCriteriaValues[i].ChangeObserved;
        }

        await dbContext.SaveChangesAsync();
    }
}