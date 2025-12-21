using Microsoft.AspNetCore.Mvc;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class ProjectsController : ControllerBase
{
    private readonly ProjectService projectService;

    public ProjectsController(ProjectService projectService)
    {
        this.projectService = projectService;
    }

    [Route("api/users/{userID}/[controller]")]
    [HttpGet]
    public async Task<IActionResult> GetProjectsByUser(
        [FromRoute] long userID
    )
    {
        var projects = await projectService.GetProjects(userID);
        return Ok(projects);
    }

    [Route("api/users/{userID}/[controller]/{projectID}")]
    [HttpGet]
    public async Task<IActionResult> GetProject(
            [FromRoute] long userID,
            [FromRoute] long projectID
        )
    {
        var project = await projectService.GetProject(userID, projectID);
        if (project != null)
            return Ok(project);
        return NotFound();
    }
}