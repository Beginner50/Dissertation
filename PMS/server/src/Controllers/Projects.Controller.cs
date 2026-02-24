using System.ComponentModel;
using System.Linq.Expressions;
using System.Text.Json;
using Google.GenAI.Types;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PMS.DTOs;
using PMS.Models;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class ProjectsController : ControllerBase
{
    private readonly ProjectService projectService;
    private readonly ReportService reportService;
    private readonly Expression<Func<Project, GetProjectDTO>> projectSelector = p => new GetProjectDTO
    {
        ProjectID = p.ProjectID,
        Title = p.Title,
        IsArchived = p.IsArchived,
        Description = p.Description,
        Supervisor = p.Supervisor != null ? new UserLookupDTO
        {
            UserID = p.Supervisor.UserID,
            Name = p.Supervisor.Name,
            Email = p.Supervisor.Email,
            IsDeleted = p.Supervisor.IsDeleted
        } : null,
        Student = p.Student != null ? new UserLookupDTO
        {
            UserID = p.Student.UserID,
            Name = p.Student.Name,
            Email = p.Student.Email,
            IsDeleted = p.Student.IsDeleted
        } : null,
        Tasks = p.Tasks
                    .OrderByDescending(t => t.AssignedDate)
                    .Select(t => new ProjectTaskLookupDTO
                    {
                        TaskID = t.ProjectTaskID,
                        Title = t.Title
                    })
                    .ToList()
    };

    public ProjectsController(ProjectService projectService, ReportService reportService)
    {
        this.projectService = projectService;
        this.reportService = reportService;
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

            var (items, totalCount) = await projectService.GetProjectsWithCount(
                selector: projectSelector,
                queryExtension: p => p.AsSplitQuery(),
                limit: limit,
                offset: offset
            );
            return Ok(new { Items = items, TotalCount = totalCount });
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/projects")]
    [HttpGet]
    [Authorize(Policy = "Ownership")]
    public async Task<IActionResult> GetUserProjects(
        [FromRoute] long userID,
        [FromQuery] long limit = 5,
        [FromQuery] long offset = 0
    )
    {
        try
        {
            if (limit > 100) limit = 100;
            var (items, totalCount) = await projectService.GetProjectsWithCount(
                selector: projectSelector,
                queryExtension: p => p.AsSplitQuery().NotArchived().ContainsMember(userID),
                limit: limit,
                offset: offset
            );

            return Ok(new
            {
                Items = items,
                TotalCount = totalCount
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
            var project = await projectService.GetProject(
                projectID,
                selector: projectSelector,
                queryExtension: p => p.AsSplitQuery().ContainsMember(userID)
            );
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
    public async Task<IActionResult> CreateProjectAdmin(
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
            await projectService.EditProject(
                projectID,
                title: editProjectDTO.Title,
                description: editProjectDTO.Description,
                studentID: editProjectDTO.StudentID,
                supervisorID: editProjectDTO.SupervisorID,
                isArchived: editProjectDTO.IsArchived
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
            await projectService.EditProject(
                userID,
                projectID,
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
            await projectService.ArchiveProject(
                userID,
                projectID
            );
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
            var progressLogReport = await reportService.GenerateProgressLogReport(userID, projectID);
            return File(progressLogReport.File, progressLogReport.ContentType, progressLogReport.Filename);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Route("api/projects/ingest-list")]
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> IngestProjectList([FromBody] FileDTO dto)
    {
        try
        {
            await reportService.IngestProjectSupervisionList(dto.Filename, dto.File, dto.ContentType);
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}