using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class FeedbackController : ControllerBase
{
    protected readonly PMSDbContext dbContext;
    protected readonly FeedbackService feedbackService;
    public FeedbackController(PMSDbContext dbContext, FeedbackService feedbackService)
    {
        this.dbContext = dbContext;
        this.feedbackService = feedbackService;
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback")]
    [HttpGet]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> GetFeedbackCriteria(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromRoute] long taskID
    )
    {
        try
        {
            var feedbackCriteria = await feedbackService.GetFeedback(userID, projectID, taskID);
            return Ok(feedbackCriteria);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback")]
    [HttpPost]
    [Authorize(Policy = "OwnershipRBAC", Roles = "supervisor")]
    public async Task<IActionResult> ProvideFeedbackCriteria(
           [FromRoute] long userID,
           [FromRoute] long projectID,
           [FromRoute] long taskID,
           [FromBody] List<FeedbackDTO> provideFeedbackDTO
       )
    {
        try
        {
            await feedbackService.ProvideFeedback(userID, projectID, taskID, provideFeedbackDTO);
            return NoContent();
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback/compliance-check")]
    [HttpPost]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> FeedbackComplianceCheck(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromRoute] long taskID
    )
    {
        try
        {
            await feedbackService.AIFeedbackComplianceCheck(userID, projectID, taskID);
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}