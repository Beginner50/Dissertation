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
    protected readonly ReminderService reminderService;
    protected readonly ILogger<FeedbackService> logger;

    public FeedbackService(
        PMSDbContext dbContext,
        Client llmClient,
        ProjectTaskService projectTaskService,
        TaskDeliverableService taskDeliverableService,
        ReminderService reminderService,
        ILogger<FeedbackService> logger
    )
    {
        this.dbContext = dbContext;
        this.llmClient = llmClient;
        this.logger = logger;
        this.projectTaskService = projectTaskService;
        this.taskDeliverableService = taskDeliverableService;
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
                        DeliverableID = submittedDeliverable.DeliverableID,
                        ProvidedByID = userID
                    });

                    await dbContext.FeedbackCriterias.AddRangeAsync(newCriteria);
                }
                await dbContext.SaveChangesAsync();

                if (criteriaToDelete.Count > 0 || criteriaToUpdateIDs.Count > 0)
                { }
                // await reminderService.CreateTaskReminder(submittedDeliverable.TaskID, ReminderType.FEEDBACK_UPDATED);
                else
                {

                }
                // await reminderService.CreateTaskReminder(submittedDeliverable.TaskID, ReminderType.FEEDBACK_PROVIDED);

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
        var task = await projectTaskService.GetProjectTask(
            userID, projectID, taskID);

        var stagedDeliverable = await taskDeliverableService.GetStagedDeliverable(
            userID, projectID, taskID);
        var stagedDeliverableFile = await taskDeliverableService.GetStagedDeliverableFile(
            userID, projectID, taskID);

        var submittedDeliverable = await taskDeliverableService.GetSubmittedDeliverable(
            userID, projectID, taskID);
        // var submittedDeliverableFile = await taskDeliverableService.GetSubmittedDeliverableFile(
        //     userID,
        //     projectID,
        //     taskID
        // );

        if (submittedDeliverable.FeedbackCriterias == null || submittedDeliverable.FeedbackCriterias.Count == 0)
            throw new Exception("No Feedback Found for Submitted Deliverable");

        var pageRangeList = (await AIUtils.LocatePagesFromCriteria(
            llmClient,
            submittedDeliverable.FeedbackCriterias,
            stagedDeliverable.TableOfContent,
            task,
            logger
        ))
        .ToList();

        var extractedPDF = PDFUtils.ExtractPageRanges(stagedDeliverableFile.File, pageRangeList);

        var oldCriteriaValues = submittedDeliverable.FeedbackCriterias
                                .Where(c => c.Status == "unmet")
                                .OrderBy(c => c.FeedbackCriteriaID)
                                .ToList();
        var newCriteriaValues = (await AIUtils.EvaluateCriteria(
            llmClient,
            extractedPDF,
            oldCriteriaValues,
            task,
            logger
        )).OrderBy(c => c.FeedbackCriteriaID).ToList();
        logger.LogDebug("Updated Feedback: {feedbackCriteria}", JsonSerializer.Serialize(oldCriteriaValues.Select(c => new { c.FeedbackCriteriaID, c.Description, c.Status })));

        if (oldCriteriaValues.Count != newCriteriaValues.Count)
            throw new Exception("Invalid Feedback Criteria Generated During LLM Ouput!");

        for (int i = 0; i < oldCriteriaValues.Count; i++)
        {
            oldCriteriaValues[i].Status = newCriteriaValues[i].Status;
        }

        await dbContext.SaveChangesAsync();
    }
}