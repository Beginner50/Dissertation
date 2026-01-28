using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class FeedbackController : ControllerBase
{
    protected readonly FeedbackService feedbackService;
    public FeedbackController(FeedbackService feedbackService)
    {
        this.feedbackService = feedbackService;
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback")]
    [HttpGet]
    [Authorize(Policy = "Ownership")]
    public async Task<IActionResult> GetFeedbackCriteria(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromRoute] long taskID
    )
    {
        try
        {
            var feedbackCriteria = await feedbackService.GetFeedbackCriteria(userID, projectID, taskID);
            return Ok(feedbackCriteria);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback")]
    [HttpPost]
    [Authorize(Policy = "Ownership", Roles = "supervisor")]
    public async Task<IActionResult> ProvideFeedbackCriteria(
           [FromRoute] long userID,
           [FromRoute] long projectID,
           [FromRoute] long taskID,
           [FromBody] ProvideFeedbackCriteriaDTO provideFeedbackCriteriaDTO
       )
    {
        try
        {
            await feedbackService.ProvideFeedbackCriteria(userID, projectID, taskID,
                feedbackCriteriaToCreate: provideFeedbackCriteriaDTO.FeedbackCriteriaToCreate,
                feedbackCriteriaToUpdate: provideFeedbackCriteriaDTO.FeedbackCriteriaToUpdate,
                feedbackCriteriaToDelete: provideFeedbackCriteriaDTO.FeedbackCriteriaToDelete
            );

            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
            // return BadRequest("Failed to provide feedback criteria.");
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback/compliance-check")]
    [HttpPost]
    [Authorize(Policy = "Ownership")]
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