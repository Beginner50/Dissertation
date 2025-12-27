using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;

public class MeetingService
{
    protected readonly PMSDbContext dbContext;
    public MeetingService(PMSDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<Meeting?> GetMeeting(long meetingID)
    {
        var meeting = await dbContext.Meetings.FindAsync(meetingID) ?? throw new
                            InvalidOperationException("Meeting Not Found!");

        /*
            If the meeting has been past its end, update its Status

            While it breaks the idempotency principle for GET requests in REST, the alternative
            requires cron job scheduling for updating the status, which might be overkill for
            this dissertation project (can be suggested as an improvement).
        */
        if (meeting.End < DateTime.UtcNow && meeting.Status.Equals("pending"))
            meeting.Status = "missed";

        return meeting;
    }

    public async Task<IEnumerable<GetMeetingsDTO>> GetSupervisorMeetings(long supervisorID)
    {
        var meetings = await dbContext.Meetings
                    .Include(m => m.Project)
                    .Include(m => m.Organizer)
                    .Include(m => m.Attendee)
                    .Where(m => m.AttendeeID == supervisorID || m.OrganizerID == supervisorID)
                    .ToListAsync();

        // See GetMeeting above to see why GetSupervisorMeetings is not idempotent
        foreach (var meeting in meetings)
        {
            if (meeting.End < DateTime.UtcNow && meeting.Status.Equals("pending"))
                meeting.Status = "missed";
        }
        await dbContext.SaveChangesAsync();

        return meetings.Select(m => new GetMeetingsDTO
        {
            MeetingID = m.MeetingID,
            Start = m.Start,
            End = m.End,
            Description = m.Description,
            Project = new ProjectLookupDTO
            {
                ProjectID = m.Project.ProjectID,
                Title = m.Project.Title
            },
            Organizer = new UserLookupDTO
            {
                UserID = m.Organizer.UserID,
                Name = m.Organizer.Name,
                Email = m.Organizer.Email
            },
            Attendee = new UserLookupDTO
            {
                UserID = m.Attendee.UserID,
                Name = m.Attendee.Name,
                Email = m.Attendee.Email
            },
            Status = m.Status
        })
        .Distinct();
    }

    public async Task<Meeting> BookMeeting(
        long organizerID, long attendeeID, long projectID,
        string? description, DateTime start, DateTime end
    )
    {
        var newMeeting = new Meeting
        {
            ProjectID = projectID,
            OrganizerID = organizerID,
            AttendeeID = attendeeID,
            Description = description,
            Start = start,
            End = end,
            Status = "pending"
        };
        dbContext.Meetings.Add(entity: newMeeting);


        await dbContext.SaveChangesAsync();

        return newMeeting;
    }

    public async Task EditMeetingDescription(
        long userID,
        long meetingID,
        string description
    )
    {
        var meeting = await dbContext.Meetings.Where(m =>
                m.MeetingID == meetingID && (m.AttendeeID == userID || m.OrganizerID == userID
            )).FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Meeting Not Found!");

        meeting.Description = description;
        await dbContext.SaveChangesAsync();
    }

    public async Task CancelMeeting(long organizerID, long meetingID)
    {
        var meeting = await dbContext.Meetings.Where(m =>
            m.MeetingID == meetingID &&
                m.OrganizerID == organizerID)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Meeting Not Found!");

        dbContext.Remove(meeting);
        await dbContext.SaveChangesAsync();
    }

    public async Task AcceptMeeting(long attendeeID, long meetingID)
    {
        var meeting = await dbContext.Meetings.Where(m =>
            m.MeetingID == meetingID &&
                m.AttendeeID == attendeeID)
            .FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Unauthorized Access or Meeting Not Found!");


        meeting.Status = "accepted";
        await dbContext.SaveChangesAsync();
    }

    public async Task RejectMeeting(long attendeeID, long meetingID)
    {
        var meeting = await dbContext.Meetings.Where(m =>
          m.MeetingID == meetingID &&
              m.AttendeeID == attendeeID)
          .FirstOrDefaultAsync()
          ?? throw new UnauthorizedAccessException("Unauthorized Access or Meeting Not Found!");


        dbContext.Remove(meeting);
        await dbContext.SaveChangesAsync();
    }
}