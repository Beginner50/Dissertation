using System.Linq.Expressions;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.Models;

namespace PMS.Services;


public class FeedbackService
{
    private readonly PMSDbContext dbContext;
    private readonly ProjectTaskService projectTaskService;
    private readonly NotificationService notificationService;
    private readonly ReminderService reminderService;
    private readonly AIService AIService;
    private readonly ILogger<FeedbackService> logger;

    public FeedbackService(
        PMSDbContext dbContext,
        AIService aiService,
        ProjectTaskService projectTaskService,
        NotificationService notificationService,
        ReminderService reminderService,
        ILogger<FeedbackService> logger
    )
    {
        this.dbContext = dbContext;
        this.logger = logger;
        this.projectTaskService = projectTaskService;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
        this.AIService = aiService;
    }

    public async Task<T> GetFeedbackCriterion<T>(
        long userID, long projectID, long taskID, long feedbackCriterionID,
        Expression<Func<FeedbackCriterion, T>> selector,
        Func<IQueryable<FeedbackCriterion>, IQueryable<FeedbackCriterion>>? feedbackQueryExtension = null,
        Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null,
        Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null
    )
    {
        IQueryable<Project> projectQuery = dbContext.Projects
                                .NotArchived()
                                .ContainsMember(userID);
        projectQuery = projectQueryExtension?.Invoke(projectQuery) ?? projectQuery;

        IQueryable<ProjectTask> taskQuery = dbContext.Tasks
                                .Where(t => t.ProjectTaskID == taskID && t.ProjectID == projectID)
                                .Where(t => projectQuery.Any(p => p.ProjectID == t.ProjectID));
        taskQuery = taskQueryExtension?.Invoke(taskQuery) ?? taskQuery;

        IQueryable<FeedbackCriterion> query = dbContext.FeedbackCriterias
                    .Where(f => f.FeedbackCriterionID == feedbackCriterionID)
                    .Where(f => taskQuery.Any(t => t.ProjectTaskID == f.TaskID));
        query = feedbackQueryExtension?.Invoke(query) ?? query;

        return await query
            .Select(selector)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Feedback Criterion Not Found!");
    }

    public async Task<IEnumerable<FeedbackCriterion>> GetFeedbackCriteria(
    long userID, long projectID, long taskID,
    Func<IQueryable<FeedbackCriterion>, IQueryable<FeedbackCriterion>>? feedbackQueryExtension = null,
    Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null,
    Func<IQueryable<Project>, IQueryable<Project>>? projectQueryExtension = null
)
    {
        IQueryable<Project> projectQuery = dbContext.Projects
                                .NotArchived()
                                .ContainsMember(userID);
        projectQuery = projectQueryExtension?.Invoke(projectQuery) ?? projectQuery;

        IQueryable<ProjectTask> taskQuery = dbContext.Tasks
                                .Where(t => t.ProjectTaskID == taskID && t.ProjectID == projectID)
                                .Where(t => projectQuery.Any(p => p.ProjectID == t.ProjectID));
        taskQuery = taskQueryExtension?.Invoke(taskQuery) ?? taskQuery;

        var query = dbContext.FeedbackCriterias
                    .Where(f => taskQuery.Any(t => t.ProjectTaskID == f.TaskID));

        query = feedbackQueryExtension?.Invoke(query) ?? query;

        return await query.ToListAsync();
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

    public async Task OverrideFeedbackCriterion
            (long userID, long projectID, long taskID, long feedbackCriterionID, string? status)
    {
        var feedbackCriterion = await GetFeedbackCriterion(
            userID,
            projectID,
            taskID,
            feedbackCriterionID,
            selector: f => f,
            projectQueryExtension: p => p.ContainsStudent(userID)
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

    public async Task AIFeedbackComplianceCheck(
        long userID, long projectID, long taskID
    )
    {
        var task = await projectTaskService.GetProjectTask(
            userID,
            projectID,
            taskID,
            selector: t => t,
            taskQueryExtension: t => t.Include(t => t.SubmittedDeliverable)
                                      .Include(t => t.StagedDeliverable)
                                      .Include(t => t.FeedbackCriterias)
        );

        if (task.StagedDeliverable == null || task.SubmittedDeliverable == null)
            throw new Exception("Staged Or Submitted Deliverable Not Found!");
        if (task.FeedbackCriterias == null || task.FeedbackCriterias.Count == 0)
            throw new UnauthorizedAccessException("Prior Feedback Criteria Not Found!");

        var newFeedbackCriteriaMap = (await AIService.EvaluateFeedbackCriteria(
                    task,
                    previousDeliverable: task.SubmittedDeliverable.File,
                    newDeliverable: task.StagedDeliverable.File,
                    previousCriteria: task.FeedbackCriterias.Where(c => c.Status == "unmet").ToList()
            )).ToDictionary(f => f.FeedbackCriterionID);

        task.FeedbackCriterias.ForEach(c =>
        {
            if (c.Status == "unmet")
            {
                var updatedCriterion = newFeedbackCriteriaMap[c.FeedbackCriterionID];
                c.ChangeObserved = updatedCriterion.ChangeObserved;
                c.Status = updatedCriterion.Status ?? c.Status;
            }
        });

        await dbContext.SaveChangesAsync();
    }
}