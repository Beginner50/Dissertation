using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> GetProjectTask(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromRoute] long taskID
        )
    {
        var task = await projectTaskService.GetProjectTask(userID, projectID, taskID);
        if (task == null)
            return NotFound();
        return Ok(task);
    }

    [Route("api/users/{userID}/projects/{projectID}/[controller]")]
    [HttpGet]
    public async Task<IActionResult> GetProjectTasks(
        [FromRoute] long userID,
        [FromRoute] long projectID
    )
    {
        var tasks = await projectTaskService.GetProjectTasks(userID, projectID);
        return Ok(tasks);
    }
}