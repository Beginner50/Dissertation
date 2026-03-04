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
    private readonly NotificationService notificationService;
    private readonly ILogger<FeedbackService> logger;

    public FeedbackService(
        PMSDbContext dbContext,
        ProjectTaskService projectTaskService,
        NotificationService notificationService,
        ILogger<FeedbackService> logger
    )
    {
        this.dbContext = dbContext;
        this.logger = logger;
        this.projectTaskService = projectTaskService;
        this.notificationService = notificationService;
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
        long taskID,
        Func<IQueryable<ProjectTask>, IQueryable<ProjectTask>>? taskQueryExtension = null,
        Func<IQueryable<FeedbackCriterion>, IQueryable<FeedbackCriterion>>? feedbackQueryExtension = null
    )
    {
        IQueryable<ProjectTask> taskQuery = dbContext.Tasks
                                    .Where(t => t.ProjectTaskID == taskID);
        taskQuery = taskQueryExtension?.Invoke(taskQuery) ?? taskQuery;

        IQueryable<FeedbackCriterion> feedbackQuery = dbContext.FeedbackCriterias
                                        .Where(c => taskQuery.Any(t => t.ProjectTaskID == c.TaskID));
        feedbackQuery = feedbackQueryExtension?.Invoke(feedbackQuery) ?? feedbackQuery;

        return await feedbackQuery.ToListAsync();
    }

    public async Task<IEnumerable<FeedbackCriterion>> GetFeedbackCriteria(
        long userID, long projectID, long taskID,
        Func<IQueryable<FeedbackCriterion>, IQueryable<FeedbackCriterion>>? feedbackQueryExtension = null
    )
    {
        IQueryable<Project> projectQuery = dbContext.Projects
                                .NotArchived()
                                .ContainsMember(userID);

        return await GetFeedbackCriteria(
            taskID,
            taskQueryExtension: q => q.Where(t => t.ProjectID == projectID &&
                                                  projectQuery.Any(p => p.ProjectID == t.ProjectID)),
            feedbackQueryExtension: feedbackQueryExtension
        );
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
                                      .Include(t => t.Project)
                                        .ThenInclude(p => p.Supervisor)
                                      .Include(t => t.Project)
                                        .ThenInclude(p => p.Student)
        );

        if (task.SubmittedDeliverableID == null)
            throw new UnauthorizedAccessException("Feedback Provision Not Allowed For Task Without Deliverable Submission!");

        var newCriterion = new FeedbackCriterion
        {
            Description = description,
            Status = status ?? "unmet",
            TaskID = taskID,
        };

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                await dbContext.AddAsync(newCriterion);
                await dbContext.SaveChangesAsync();

                await notificationService.CreateTaskNotification(
                    task.Project.Supervisor,
                    task.Project.Student,
                    task,
                    NotificationType.FEEDBACK_PROVIDED);

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
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
}