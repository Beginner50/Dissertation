using Microsoft.AspNetCore.Mvc;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class TaskDeliverablesController : ControllerBase
{
    private readonly TaskDeliverableService taskDeliverableService;
    public TaskDeliverablesController(TaskDeliverableService taskDeliverableService)
    {
        this.taskDeliverableService = taskDeliverableService;
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/staged-deliverable")]
    [HttpGet]
    public async Task<IActionResult> GetStagedDeliverable(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromRoute] long taskID,
        [FromQuery] bool file = false
    )
    {
        try
        {
            if (file)
            {
                var result = await taskDeliverableService.GetStagedDeliverableFile(userID, projectID, taskID);
                return File(result.File, result.ContentType, result.Filename);
            }
            var stagedDeliverable = await taskDeliverableService.GetStagedDeliverable(userID, projectID, taskID);
            return Ok(stagedDeliverable);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/submitted-deliverable")]
    [HttpGet]
    public async Task<IActionResult> GetSubmittedDeliverable(
            [FromRoute] long userID,
            [FromRoute] long projectID,
            [FromRoute] long taskID,
            [FromQuery] bool file = false
        )
    {
        try
        {
            if (file)
            {
                var result = await taskDeliverableService.GetSubmittedDeliverableFile(userID, projectID, taskID);
                return File(result.File, result.ContentType, result.Filename);
            }
            var submittedDeliverable = await taskDeliverableService.GetSubmittedDeliverable(userID, projectID, taskID);
            return Ok(submittedDeliverable);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }
}