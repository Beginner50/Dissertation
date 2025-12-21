using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;

public class FeedbackService
{
    private readonly PMSDbContext dbContext;
    public FeedbackService(PMSDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<IEnumerable<GetFeedbackDTO>> GetFeedback(long userID, long projectID, long taskID, long deliverableID)
    {
        return await dbContext.FeedbackCriterias
                    .Where(f => f.DeliverableID == deliverableID &&
                                    f.Deliverable.TaskID == taskID &&
                                        f.Deliverable.Task.ProjectID == projectID &&
                                            (f.Deliverable.Task.Project.StudentID == userID ||
                                            f.Deliverable.Task.Project.SupervisorID == userID))
                    .Select(f => new GetFeedbackDTO
                    {
                        FeedbackCriteriaID = f.FeedbackCriteriaID,
                        Description = f.Description,
                        Status = f.Status,
                        DeliverableID = f.DeliverableID,
                        ProvidedByID = f.ProvidedByID
                    }).ToListAsync();
    }

    public async Task CreateFeedback(
        long userID,
        long deliverableID,
        IEnumerable<CreateFeedbackDTO> feedbackList
    )
    {
        var deliverable = await dbContext.Deliverables
            .Where(d => d.DeliverableID == deliverableID &&
                            d.Task.Project.SupervisorID == userID)
            .FirstOrDefaultAsync()
            ?? throw new
                UnauthorizedAccessException("Unauthorized Access or Deliverable not found!");

        var newCriteria = feedbackList.Select(dto => new FeedbackCriteria
        {
            Description = dto.Description,
            Status = dto.Status ?? "Pending",
            DeliverableID = deliverableID,
            ProvidedByID = userID
        });

        await dbContext.FeedbackCriterias.AddRangeAsync(newCriteria);
        await dbContext.SaveChangesAsync();
    }

    public async Task EditFeedback(long userID, IEnumerable<EditFeedbackDTO> updates)
    {
        var criteriaIds = updates.Select(u => u.FeedbackCriteriaID).ToList();

        var existingCriteria = await dbContext.FeedbackCriterias
            .Where(f => criteriaIds.Contains(f.FeedbackCriteriaID) && f.ProvidedByID == userID)
            .ToListAsync();

        if (existingCriteria.Count != criteriaIds.Count)
            throw new UnauthorizedAccessException("Unauthorized Access or Invalid Feedback Criteria!");

        foreach (var updateDto in updates)
        {
            var criteria = existingCriteria.First(f => f.FeedbackCriteriaID == updateDto.FeedbackCriteriaID);
            criteria.Status = updateDto.Status;
            criteria.Description = updateDto.Description;
        }

        await dbContext.SaveChangesAsync();
    }

    public async Task OverrideFeedback(long userID, IEnumerable<long> feedbackCriteriaIDs)
    {
        var feedbackCriterias = dbContext.FeedbackCriterias.Where(f =>
                feedbackCriteriaIDs.Contains(f.FeedbackCriteriaID) &&
                    f.Deliverable.SubmittedByID == userID);

        foreach (var feedbackCriteria in feedbackCriterias)
        {
            feedbackCriteria.Status = "Overriden";
        }

        await dbContext.SaveChangesAsync();
    }

    public bool AreCriteriaMet(List<FeedbackCriteria> feedbackCriteria)
    {
        if (feedbackCriteria == null || feedbackCriteria.Count == 0)
            return false;

        return !feedbackCriteria.Any(c =>
            c.Status.Equals("Unmet"));
    }

    public async Task<bool> AIFeedbackComplianceCheck()
    {
        return false;
    }
}