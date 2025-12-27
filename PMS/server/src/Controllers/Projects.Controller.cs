using System.ComponentModel;
using Microsoft.AspNetCore.Mvc;
using PMS.DTOs;
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
        try
        {
            var projects = await projectService.GetProjects(userID);
            return Ok(projects);
        }
        catch (Exception e)
        {
            return NotFound(e);
        }
    }

    [Route("api/users/{userID}/[controller]/{projectID}")]
    [HttpGet]
    public async Task<IActionResult> GetProject(
            [FromRoute] long userID,
            [FromRoute] long projectID
        )
    {
        try
        {
            var project = await projectService.GetProject(userID, projectID);
            return Ok(project);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects")]
    [HttpPost]
    public async Task<IActionResult> CreateProject(
        [FromRoute] long userID,
        [FromBody] CreateProjectDTO createProjectDTO
    )
    {
        var role = "supervisor";
        try
        {
            await projectService.CreateProject(userID, role, createProjectDTO);
            return Ok();

        }
        catch (Exception e)
        {
            return Conflict(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}")]
    [HttpPut]
    public async Task<IActionResult> EditProject(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromBody] EditProjectDTO editProjectDTO)
    {
        try
        {
            await projectService.EditProject(userID, projectID, editProjectDTO);
            return Ok();
        }
        catch (Exception e)
        {
            return Conflict(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}")]
    [HttpDelete]
    public async Task<IActionResult> ArchiveProject(
            [FromRoute] long userID,
            [FromRoute] long projectID)
    {
        try
        {
            await projectService.ArchiveProject(userID, projectID);
            return Ok();
        }
        catch (Exception e)
        {
            return Conflict(e);
        }
    }
}