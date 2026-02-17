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

    public ProjectsController(ProjectService projectService)
    {
        this.projectService = projectService;
    }

    [Route("/api/projects")]
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllProjects(
        [FromQuery] long limit = 5,
        [FromQuery] long offset = 0
    )
    {
        try
        {
            if (limit > 100) limit = 100;

            var (projects, count) = await projectService.GetAllProjectsWithCount(limit, offset);
            return Ok(new { Items = projects, TotalCount = count });
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
            if (limit > 100) limit = 100;
            var (projects, count) = await projectService.GetUserProjectsWithCount(userID, limit, offset);

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

    [Route("api/projects")]
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> CreateProject(
        [FromBody] CreateProjectDTO createProjectDTO
    )
    {
        try
        {
            if (createProjectDTO.SupervisorID == null)
                throw new Exception("No Project Supervisor Provided!");

            await projectService.CreateProject(
                title: createProjectDTO.Title,
                description: createProjectDTO.Description,
                supervisorID: (long)createProjectDTO.SupervisorID,
                studentID: createProjectDTO.StudentID
            );
            return NoContent();

        }
        catch (Exception e)
        {
            return Conflict(e.Message);
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
            await projectService.CreateProject(
                title: createProjectDTO.Title,
                description: createProjectDTO.Description,
                supervisorID: userID
            );
            return NoContent();

        }
        catch (Exception e)
        {
            return Conflict(e.Message);
        }
    }

    [Route("api/projects/{projectID}")]
    [HttpPut]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> EditProject(
        [FromRoute] long projectID,
        [FromBody] EditProjectDTO editProjectDTO)
    {
        try
        {
            await projectService.EditProject(projectID,
                title: editProjectDTO.Title,
                description: editProjectDTO.Description,
                studentID: editProjectDTO.StudentID,
                supervisorID: editProjectDTO.SupervisorID,
                status: editProjectDTO.Status
            );
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
            await projectService.EditProject(userID, projectID,
                title: editProjectDTO.Title,
                description: editProjectDTO.Description
            );
            return NoContent();
        }
        catch (Exception e)
        {
            return Conflict(e.Message);
        }
    }

    [Route("api/projects/{projectID}")]
    [HttpDelete]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ArchiveProject(
            [FromRoute] long projectID)
    {
        try
        {
            await projectService.ArchiveProject(projectID);
            return NoContent();
        }
        catch (Exception e)
        {
            return Conflict(e);
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

    [Route("api/projects/{projectID}/restore")]
    [HttpPut]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> RestoreProject(
                [FromRoute] long projectID)
    {
        try
        {
            await projectService.RestoreProject(projectID);
            return NoContent();
        }
        catch (Exception e)
        {
            return Conflict(e);
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