using Microsoft.AspNetCore.Mvc;
using PMS.Migrations;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class TaskDeliverablesController : ControllerBase
{
    private readonly TaskDeliverableService deliverableService;
    public TaskDeliverablesController(TaskDeliverableService deliverableService)
    {
        this.deliverableService = deliverableService;
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/staging-deliverable")]
    public async Task<IActionResult> GetStagingDeliverable(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromRoute] long taskID
    )
    {
        var stagingDeliverable = await deliverableService.GetStagedDeliverable(userID, projectID, taskID);
        return Ok(stagingDeliverable);
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/submitted-deliverable")]
    public async Task<IActionResult> GetSubmittedDeliverable(
            [FromRoute] long userID,
            [FromRoute] long projectID,
            [FromRoute] long taskID
        )
    {
        var stagingDeliverable = await deliverableService.GetSubmittedDeliverable(userID, projectID, taskID);
        return Ok(stagingDeliverable);
    }
}