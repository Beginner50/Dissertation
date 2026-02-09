using System.ComponentModel;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using PMS.DTOs;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class ProjectsController : ControllerBase
{
    private readonly ProjectService projectService;
    private readonly ILogger<ProjectsController> logger;

    public ProjectsController(ProjectService projectService, ILogger<ProjectsController> logger)
    {
        this.projectService = projectService;
        this.logger = logger;
    }

    [Route("/api/projects")]
    [HttpGet]
    [Authorize(Roles = "supervisor")]
    public async Task<IActionResult> GetUnsupervisedProjects()
    {
        try
        {

            var projects = await projectService.GetAllUnsupervisedProjects();
            return Ok(projects);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects")]
    [HttpGet]
    [Authorize(Policy = "Ownership")]
    public async Task<IActionResult> GetProjectsByUser(
        [FromRoute] long userID,
        [FromQuery] long limit = 5,
        [FromQuery] long offset = 0
    )
    {
        try
        {
            var (projects, count) = await projectService.GetProjectsWithCount(userID, limit, offset);

            return Ok(new
            {
                Items = projects,
                TotalCount = count
            });
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}")]
    [HttpGet]
    [Authorize(Policy = "Ownership")]
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
    [Authorize(Policy = "Ownership", Roles = "supervisor")]
    public async Task<IActionResult> CreateProject(
        [FromRoute] long userID,
        [FromBody] CreateProjectDTO createProjectDTO
    )
    {
        try
        {
            await projectService.CreateProject(userID, createProjectDTO);
            return NoContent();

        }
        catch (Exception e)
        {
            return Conflict(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}")]
    [HttpPut]
    [Authorize(Policy = "Ownership", Roles = "supervisor")]
    public async Task<IActionResult> EditProject(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromBody] EditProjectDTO editProjectDTO)
    {
        try
        {
            await projectService.EditProject(userID, projectID, editProjectDTO);
            return NoContent();
        }
        catch (Exception e)
        {
            return Conflict(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}")]
    [HttpDelete]
    [Authorize(Policy = "Ownership", Roles = "supervisor")]
    public async Task<IActionResult> ArchiveProject(
            [FromRoute] long userID,
            [FromRoute] long projectID)
    {
        try
        {
            await projectService.ArchiveProject(userID, projectID);
            return NoContent();
        }
        catch (Exception e)
        {
            return Conflict(e);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/add-student/{studentID}")]
    [HttpPut]
    [Authorize(Policy = "Ownership", Roles = "supervisor")]
    public async Task<IActionResult> AddStudentToProject(
            [FromRoute] long userID,
            [FromRoute] long projectID,
            [FromRoute] long studentID
        )
    {
        try
        {
            await projectService.AssignStudentToProject(userID, projectID, studentID); ;
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/progress-log")]
    [HttpGet]
    [Authorize(Policy = "Ownership")]
    public async Task<IActionResult> GenerateProgressLogReport(
        [FromRoute] long userID,
        [FromRoute] long projectID
    )
    {
        try
        {
            var progressLogReport = await projectService.GenerateProgressLogReport(userID, projectID);
            return File(progressLogReport.File, progressLogReport.ContentType, progressLogReport.Filename);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}