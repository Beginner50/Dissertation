using System.Linq.Expressions;
using System.Text.Json;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;


public class FeedbackService
{
    private readonly PMSDbContext dbContext;
    private readonly ProjectTaskService projectTaskService;
    private readonly ILogger<FeedbackService> logger;

    public FeedbackService(
        PMSDbContext dbContext,
        ProjectTaskService projectTaskService,
        ILogger<FeedbackService> logger
    )
    {
        this.dbContext = dbContext;
        this.logger = logger;
        this.projectTaskService = projectTaskService;
    }

    // Reserved for AI compliance
    public async Task<IEnumerable<FeedbackCriterion>> GetFeedbackCriteria(
        long taskID,
        Func<IQueryable<FeedbackCriterion>, IQueryable<FeedbackCriterion>>? feedbackQueryExtension = null,
        Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null
    )
    {
        IQueryable<ProjectTask> taskQuery = dbContext.Tasks
                                    .Where(t => t.ProjectTaskID == taskID);
        if (taskQueryExtension != null)
            taskQuery = taskQueryExtension(taskQuery);

        IQueryable<FeedbackCriterion> feedbackQuery = taskQuery.SelectMany(t => t.FeedbackCriterias);
        if (feedbackQueryExtension != null)
            feedbackQuery = feedbackQueryExtension(feedbackQuery);

        return await feedbackQuery.ToListAsync();
    }

    public async Task<IEnumerable<T>> GetFeedbackCriteria<T>(
        long userID, long projectID, long taskID,
        Expression<Func<FeedbackCriterion, T>> selector,
        Func<IQueryable<FeedbackCriterion>, IQueryable<FeedbackCriterion>>? feedbackQueryExtension = null,
        Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null,
        Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null,
        Func<IQueryable<ProjectSupervision>, IQueryable<ProjectSupervision>>? projectSupervisionQueryExtension = null
    )
    {
        var task = await projectTaskService.GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            projectSupervisionQueryExtension: projectSupervisionQueryExtension,
            projectQueryExtension: projectQueryExtension,
            taskQueryExtension: taskQueryExtension
        );

        IQueryable<FeedbackCriterion> feedbackQuery = dbContext.Tasks
                                            .Where(t => t.ProjectTaskID == task.ProjectTaskID)
                                            .SelectMany(t => t.FeedbackCriterias!);
        if (feedbackQueryExtension != null)
            feedbackQuery = feedbackQueryExtension(feedbackQuery);

        return await feedbackQuery
            .Select(selector)
            .ToListAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Feedback Criteria Not Found!");
    }
    public async Task<T> GetFeedbackCriterion<T>(
        long userID, long projectID, long taskID, long feedbackCriterionID,
        Expression<Func<FeedbackCriterion, T>> selector,
        Func<IQueryable<FeedbackCriterion>, IQueryable<FeedbackCriterion>>? feedbackQueryExtension = null,
        Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null,
        Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null,
        Func<IQueryable<ProjectSupervision>, IQueryable<ProjectSupervision>>? projectSupervisionQueryExtension = null
    )
    {
        var task = await projectTaskService.GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            projectSupervisionQueryExtension: projectSupervisionQueryExtension,
            projectQueryExtension: projectQueryExtension,
            taskQueryExtension: taskQueryExtension
        );

        IQueryable<FeedbackCriterion> feedbackQuery = dbContext.Tasks
                                            .Where(t => t.ProjectTaskID == task.ProjectTaskID)
                                            .SelectMany(t => t.FeedbackCriterias!)
                                            .Where(c => c.FeedbackCriterionID == feedbackCriterionID);
        if (feedbackQueryExtension != null)
            feedbackQuery = feedbackQueryExtension(feedbackQuery);

        return await feedbackQuery
            .Select(selector)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Feedback Criteria Not Found!");
    }

    public async Task CreateFeedbackCriterion
        (long userID, long projectID, long taskID, string description, string? status)
    {
        var task = await projectTaskService.GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            taskQueryExtension: t => t.Where(t => t.AssignedByID == userID)
        );

        if (task.SubmittedDeliverableID == null)
            throw new UnauthorizedAccessException("Feedback Provision Not Allowed For Task Without Deliverable Submission!");

        var newCriterion = new FeedbackCriterion
        {
            Description = description,
            Status = status ?? "unmet",
            TaskID = taskID,
        };

        await dbContext.AddAsync(newCriterion);
        await dbContext.SaveChangesAsync();
    }

    public async Task EditFeedbackCriterion
        (long userID, long projectID, long taskID, long feedbackCriterionID
            , string? description = null, string? status = null)
    {
        var feedbackCriterion = await GetFeedbackCriterion(
            userID,
            projectID,
            taskID,
            feedbackCriterionID,
            selector: f => f,
            taskQueryExtension: t => t.Where(t => t.AssignedByID == userID)
        );

        feedbackCriterion.Description = description ?? feedbackCriterion.Description;
        feedbackCriterion.Status = status ?? feedbackCriterion.Status;

        await dbContext.SaveChangesAsync();
    }

    // Currently reserved FOR AI Compliance
    public async Task EditFeedbackCriteria(long taskID, List<UpdateFeedbackCriterionDTO> newFeedbackValues)
    {
        var newFeedbackValuesMap = newFeedbackValues.ToDictionary(c => c.FeedbackCriterionID);
        var feedbackCriterionIDs = newFeedbackValues.Select(c => c.FeedbackCriterionID).ToList();

        var originalFeedbackValues = (await GetFeedbackCriteria(
            taskID,
            feedbackQueryExtension: q => q.Where(c => feedbackCriterionIDs.Contains(c.FeedbackCriterionID))
        )).ToList();

        originalFeedbackValues.ForEach(c =>
        {
            c.Status = newFeedbackValuesMap[c.FeedbackCriterionID].Status ?? c.Status;
            c.ChangeObserved = newFeedbackValuesMap[c.FeedbackCriterionID].ChangeObserved ?? c.ChangeObserved;
        });

        await dbContext.SaveChangesAsync();
    }

    public async Task OverrideFeedbackCriterion
            (long userID, long projectID, long taskID, long feedbackCriterionID, string? status)
    {
        var feedbackCriterion = await GetFeedbackCriterion(
            userID,
            projectID,
            taskID,
            feedbackCriterionID,
            selector: f => f,
            projectSupervisionQueryExtension: q => q.ContainsStudent(userID)
        )
        ?? throw new UnauthorizedAccessException("Feedback Criterion Not Found!");

        feedbackCriterion.Status = status ?? "overridden";

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteFeedbackCriterion
         (long userID, long projectID, long taskID, long feedbackCriterionID)
    {
        var feedbackCriterion = await GetFeedbackCriterion(
            userID,
            projectID,
            taskID,
            feedbackCriterionID,
            selector: f => f,
            taskQueryExtension: t => t.Where(t => t.AssignedByID == userID)
        )
        ?? throw new UnauthorizedAccessException("Feedback Criterion Not Found!");

        dbContext.Remove(feedbackCriterion);
        await dbContext.SaveChangesAsync();
    }
}