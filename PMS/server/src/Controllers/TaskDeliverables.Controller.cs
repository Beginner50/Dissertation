using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.DTOs;
using PMS.Lib;
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
    [Authorize(Policy = "OwnershipRBAC", Roles = "student")]
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
    [Authorize(Policy = "OwnershipRBAC")]
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


    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/staged-deliverable")]
    [HttpPost]
    [Authorize(Policy = "OwnershipRBAC", Roles = "student")]
    public async Task<IActionResult> UploadStagedDeliverable(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromRoute] long taskID,
        [FromBody] TaskDeliverableFileDTO taskDeliverableFileDTO
    )
    {
        try
        {
            await taskDeliverableService.UploadDeliverable(
                userID,
                projectID,
                taskID,
                filename: taskDeliverableFileDTO.Filename,
                fileData: taskDeliverableFileDTO.File,
                contentType: taskDeliverableFileDTO.ContentType
            );
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/staged-deliverable")]
    [HttpDelete]
    [Authorize(Policy = "OwnershipRBAC", Roles = "student")]
    public async Task<IActionResult> RemoveStagedDeliverable(
           [FromRoute] long userID,
           [FromRoute] long projectID,
           [FromRoute] long taskID
       )
    {
        try
        {
            await taskDeliverableService.RemoveStagedDeliverable(
                userID,
                projectID,
                taskID
            );
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}/staged-deliverable/submit")]
    [HttpPost]
    [Authorize(Policy = "OwnershipRBAC", Roles = "student")]
    public async Task<IActionResult> SubmitStagedDeliverable(
           [FromRoute] long userID,
           [FromRoute] long projectID,
           [FromRoute] long taskID
       )
    {
        try
        {
            await taskDeliverableService.SubmitStagedDeliverable(
                userID,
                projectID,
                taskID
            );
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}