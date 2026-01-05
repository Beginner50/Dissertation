using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.DTOs;
using PMS.Models;
using PMS.Services;
namespace PMS.Controllers;

[ApiController]
public class MeetingsController : ControllerBase
{
    protected readonly MeetingService meetingService;
    protected readonly ProjectService projectService;


    public MeetingsController(MeetingService meetingService, ProjectService projectService)
    {
        this.meetingService = meetingService;
        this.projectService = projectService;
    }

    // [Authorize]
    [Route("api/users/{userID}/[controller]")]
    [HttpGet]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> GetSupervisorMeetings(
        [FromRoute] long userID
    )
    {
        try
        {
            var project = await projectService.GetProject(userID: userID);
            var meetings = await meetingService.GetSupervisorMeetings(supervisorID:
                                                    (long)project.SupervisorID);
            return Ok(meetings);
        }
        catch (Exception e)
        {
            return NotFound(e);
        }
    }

    [Route("api/[controller]/{meetingID}")]
    [HttpGet]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> GetMeeting([FromRoute] long meetingID)
    {
        try
        {
            var meeting = await meetingService.GetMeeting(meetingID);
            return Ok(meeting);
        }
        catch (Exception e)
        {
            return NotFound(e);
        }
    }

    [Route("api/users/{userID}/projects/{projectID}/[controller]")]
    [HttpPost]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> BookMeeting(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromBody] BookMeetingDTO bookMeetingDTO)
    {
        try
        {
            await meetingService.BookMeeting(
                projectID: projectID, organizerID: userID,
                attendeeID: bookMeetingDTO.AttendeeID,
                description: bookMeetingDTO.Description,
                start: bookMeetingDTO.Start,
                end: bookMeetingDTO.End
            );

            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e);
        }
    }

    [Route("api/users/{userID}/[controller]/{meetingID}/edit-description")]
    [HttpPut]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> EditMeetingDescription(
                    [FromRoute] long userID,
                    [FromRoute] long meetingID,
                    [FromBody] EditMeetingDescriptionDTO editMeetingDescriptionDTO
                )
    {
        try
        {
            await meetingService.EditMeetingDescription(
                userID: userID,
                meetingID: meetingID,
                description: editMeetingDescriptionDTO.Description
            );
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e);
        }
    }

    [Route("api/users/{userID}/[controller]/{meetingID}/cancel")]
    [HttpDelete]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> CancelMeeting(
                    [FromRoute] long userID,
                    [FromRoute] long meetingID
                )
    {
        try
        {
            await meetingService.CancelMeeting(organizerID: userID, meetingID: meetingID);
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e);
        }
    }

    [Route("api/users/{userID}/[controller]/{meetingID}/accept")]
    [HttpPut]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> AcceptMeeting(
        [FromRoute] long userID,
        [FromRoute] long meetingID
    )
    {
        try
        {
            await meetingService.AcceptMeeting(attendeeID: userID, meetingID: meetingID);
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e);
        }
    }

    [Route("api/users/{userID}/[controller]/{meetingID}/reject")]
    [HttpDelete]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> RejectMeeting(
            [FromRoute] long userID,
            [FromRoute] long meetingID
        )
    {
        try
        {
            await meetingService.RejectMeeting(attendeeID: userID, meetingID: meetingID);
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e);
        }
    }
}
