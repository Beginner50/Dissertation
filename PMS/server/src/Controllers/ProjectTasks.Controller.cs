using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.DTOs;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class TasksController : ControllerBase
{
    private readonly ProjectTaskService projectTaskService;
    public TasksController(ProjectService projectService, ProjectTaskService projectTaskService)
    {
        this.projectTaskService = projectTaskService;
    }

    [Route("api/users/{userID}/projects/{projectID}/[controller]/{taskID}")]
    [HttpGet]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> GetProjectTask(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromRoute] long taskID
        )
    {
        try
        {
            var task = await projectTaskService.GetProjectTask(userID, projectID, taskID);
            return Ok(task);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/[controller]")]
    [HttpGet]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> GetProjectTasks(
        [FromRoute] long userID,
        [FromRoute] long projectID
    )
    {
        try
        {
            var tasks = await projectTaskService.GetProjectTasks(userID, projectID);
            return Ok(tasks);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks")]
    [HttpPost]
    [Authorize(Policy = "OwnershipRBAC", Roles = "supervisor")]
    public async Task<IActionResult> CreateProjectTask(
            [FromRoute] long userID,
            [FromRoute] long projectID,
            [FromBody] CreateProjectTaskDTO createProjectTaskDTO
        )
    {
        try
        {
            await projectTaskService.CreateProjectTask(userID, projectID, createProjectTaskDTO);
            return NoContent();
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}")]
    [HttpPut]
    [Authorize(Policy = "OwnershipRBAC", Roles = "supervisor")]
    public async Task<IActionResult> EditProjectTask(
                [FromRoute] long userID,
                [FromRoute] long projectID,
                [FromRoute] long taskID,
                [FromBody] EditProjectTaskDTO editProjectTaskDTO
            )
    {
        try
        {
            await projectTaskService.EditProjectTask(
                userID: userID,
                projectID: projectID,
                taskID: taskID,
                dto: editProjectTaskDTO);
            return NoContent();
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/tasks/{taskID}")]
    [HttpDelete]
    [Authorize(Policy = "OwnershipRBAC", Roles = "supervisor")]
    public async Task<IActionResult> DeleteProjectTask(
                    [FromRoute] long userID,
                    [FromRoute] long projectID,
                    [FromRoute] long taskID
                )
    {
        try
        {
            await projectTaskService.DeleteProjectTask(
                userID: userID,
                projectID: projectID,
                taskID: taskID);
            return NoContent();
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }
}