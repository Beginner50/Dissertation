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


    public MeetingsController(MeetingService _meetingService, ProjectService _projectService)
    {
        meetingService = _meetingService;
        projectService = _projectService;
    }

    // [Authorize]
    [Route("api/users/{userID}/[controller]")]
    [HttpGet]
    public async Task<IActionResult> GetMeetings(
        [FromRoute] long userID
    )
    {
        var project = await projectService.GetProject(userID: userID);
        if (project == null || project.SupervisorID == null)
            return NotFound();

        var meetings = await meetingService.GetSupervisorMeetings(supervisorID:
                                (long)project.SupervisorID);
        return Ok(meetings);
    }

    [Route("api/[controller]/{meetingID}")]
    [HttpGet]
    public async Task<IActionResult> GetMeeting([FromRoute] long meetingID)
    {
        var meeting = await meetingService.GetMeeting(meetingID);
        if (meeting == null)
            return NotFound();
        return Ok(meeting);
    }

    [Route("api/users/{userID}/projects/{projectID}/[controller]")]
    [HttpPost]
    public async Task<IActionResult> BookMeeting(
        [FromRoute] long userID,
        [FromRoute] long projectID,
        [FromBody] BookMeetingDTO bookMeetingDTO)
    {
        var meeting = await meetingService.BookMeeting(
            projectID: projectID, organizerID: userID,
            attendeeID: bookMeetingDTO.AttendeeID,
            description: bookMeetingDTO.Description,
            start: bookMeetingDTO.Start,
            end: bookMeetingDTO.End
        );

        /*
            This method returns a 201 Created status code and tells the client where it can
            find the new resource (meeting at GetMeeting endpoint with the new meetingID)
        */
        return CreatedAtAction(nameof(GetMeeting), new { meetingID = meeting.MeetingID }, meeting);
    }

    [Route("api/users/{userID}/[controller]/{meetingID}/edit-description")]
    [HttpPost]
    public async Task<IActionResult> CancelMeeting(
                    [FromRoute] long userID,
                    [FromRoute] long meetingID,
                    [FromBody] string description
                )
    {
        if (await meetingService.EditMeetingDescription(
            userID: userID,
            meetingID: meetingID,
            description: description
        ))
            return NoContent();
        return BadRequest();
    }



    [Route("api/users/{userID}/[controller]/{meetingID}/cancel")]
    [HttpPost]
    public async Task<IActionResult> CancelMeeting(
                    [FromRoute] long userID,
                    [FromRoute] long meetingID
                )
    {
        if (await meetingService.CancelMeeting(organizerID: userID, meetingID: meetingID))
            return NoContent();
        return BadRequest();
    }

    [Route("api/users/{userID}/[controller]/{meetingID}/accept")]
    [HttpPost]
    public async Task<IActionResult> AcceptMeeting(
        [FromRoute] long userID,
        [FromRoute] long meetingID
    )
    {
        if (await meetingService.AcceptMeeting(attendeeID: userID, meetingID: meetingID))
            return NoContent();
        return BadRequest();
    }

    [Route("api/users/{userID}/[controller]/{meetingID}/reject")]
    [HttpPost]
    public async Task<IActionResult> RejectMeeting(
            [FromRoute] long userID,
            [FromRoute] long meetingID
        )
    {
        if (await meetingService.RejectMeeting(attendeeID: userID, meetingID: meetingID))
            return NoContent();
        return BadRequest();
    }
}
