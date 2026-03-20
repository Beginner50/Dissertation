using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class FeedbackController : ControllerBase
{
    private readonly FeedbackService feedbackService;
    private readonly AIComplianceService AIComplianceService;
    public FeedbackController(FeedbackService feedbackService, AIComplianceService AIComplianceService)
    {
        this.feedbackService = feedbackService;
        this.AIComplianceService = AIComplianceService;
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
            var feedbackCriteria = await feedbackService.GetFeedbackCriteria(
                    userID, projectID, taskID, selector: fc => fc
            );
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
    public async Task<IActionResult> CreateFeedbackCriterion(
           [FromRoute] long userID,
           [FromRoute] long projectID,
           [FromRoute] long taskID,
           [FromBody] CreateFeedbackCriterionDTO dto
       )
    {
        try
        {
            await feedbackService.CreateFeedbackCriterion(userID, projectID, taskID, description: dto.Description, status: dto.Status);
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback/{feedbackCriterionID}")]
    [HttpPut]
    [Authorize(Policy = "Ownership", Roles = "supervisor")]
    public async Task<IActionResult> EditFeedbackCriterion(
           [FromRoute] long userID,
           [FromRoute] long projectID,
           [FromRoute] long taskID,
           [FromRoute] long feedbackCriterionID,
           [FromBody] UpdateFeedbackCriterionDTO dto
       )
    {
        try
        {
            await feedbackService.EditFeedbackCriterion(userID, projectID, taskID,
                feedbackCriterionID,
                description: dto.Description,
                status: dto.Status
            );
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback/{feedbackCriterionID}/override")]
    [HttpPut]
    [Authorize(Policy = "Ownership", Roles = "student")]
    public async Task<IActionResult> OverrideFeedbackCriterion(
              [FromRoute] long userID,
              [FromRoute] long projectID,
              [FromRoute] long taskID,
              [FromRoute] long feedbackCriterionID,
              [FromBody] UpdateFeedbackCriterionDTO dto
          )
    {
        try
        {
            await feedbackService.OverrideFeedbackCriterion(userID, projectID, taskID,
                feedbackCriterionID,
                status: dto.Status
            );
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback/{feedbackCriterionID}")]
    [HttpDelete]
    [Authorize(Policy = "Ownership", Roles = "supervisor")]
    public async Task<IActionResult> DeleteFeedbackCriterion(
           [FromRoute] long userID,
           [FromRoute] long projectID,
           [FromRoute] long taskID,
           [FromRoute] long feedbackCriterionID
       )
    {
        try
        {
            await feedbackService.DeleteFeedbackCriterion(userID, projectID, taskID, feedbackCriterionID);
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost]
    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback/compliance-check")]
    [Authorize(Policy = "Ownership")]
    public async Task<IActionResult> StartFeedbackComplianceCheck(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromRoute] long taskID
    )
    {
        try
        {
            await AIComplianceService.CreateAndEnqueueAIComplianceJob(userID, projectID, taskID);

            return Accepted();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet]
    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/feedback/compliance-status")]
    [Authorize(Policy = "Ownership")]
    public IActionResult GetFeedbackComplianceStatus([FromRoute] long taskID)
    {
        var status = AIComplianceService.PollAIComplianceJob(taskID);

        return Ok(new { status });
    }
}