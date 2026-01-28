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

    [Route("api/users/{userID}/meetings")]
    [HttpGet]
    [Authorize(Policy = "Ownership")]
    public async Task<IActionResult> GetSupervisorMeetings(
        [FromRoute] long userID
    )
    {
        try
        {
            var meetings = await meetingService.GetSupervisorMeetings(userID);
            return Ok(meetings);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/meetings/{meetingID}")]
    [HttpGet]
    [Authorize(Policy = "Ownership")]
    public async Task<IActionResult> GetMeeting([FromRoute] long meetingID)
    {
        try
        {
            var meeting = await meetingService.GetMeeting(meetingID);
            return Ok(meeting);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/meetings")]
    [HttpPost]
    [Authorize(Policy = "Ownership")]
    public async Task<IActionResult> BookMeeting(
        [FromRoute] long userID,
        [FromBody] BookMeetingDTO bookMeetingDTO)
    {
        try
        {
            await meetingService.BookMeeting(
                taskID: bookMeetingDTO.TaskID,
                organizerID: userID,
                attendeeID: bookMeetingDTO.AttendeeID,
                description: bookMeetingDTO.Description,
                start: bookMeetingDTO.Start,
                end: bookMeetingDTO.End
            );

            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Route("api/users/{userID}/meetings/{meetingID}/edit-description")]
    [HttpPut]
    [Authorize(Policy = "Ownership")]
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
            return BadRequest(e.Message);
        }
    }

    [Route("api/users/{userID}/meetings/{meetingID}/cancel")]
    [HttpDelete]
    [Authorize(Policy = "Ownership")]
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
            return BadRequest(e.Message);
        }
    }

    [Route("api/users/{userID}/meetings/{meetingID}/accept")]
    [HttpPut]
    [Authorize(Policy = "Ownership")]
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
            return BadRequest(e.Message);
        }
    }

    [Route("api/users/{userID}/meetings/{meetingID}/reject")]
    [HttpDelete]
    [Authorize(Policy = "Ownership")]
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
            return BadRequest(e.Message);
        }
    }
}
