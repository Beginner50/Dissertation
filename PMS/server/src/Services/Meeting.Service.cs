using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;

public class MeetingService
{
    protected readonly PMSDbContext dbContext;
    public MeetingService(PMSDbContext _dbContext)
    {
        dbContext = _dbContext;
    }

    public async Task<Meeting?> GetMeeting(long meetingID)
    {
        return await dbContext.Meetings.FindAsync(meetingID);
    }

    public async Task<IEnumerable<GetMeetingsDTO>> GetSupervisorMeetings(long supervisorID)
    {
        return await dbContext.Meetings
                    .Where(m => m.AttendeeID == supervisorID || m.OrganizerID == supervisorID)
                    .Select(m => new GetMeetingsDTO
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
                    .Distinct()
                    .ToListAsync();
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
    public async Task<bool> EditMeetingDescription(long userID, long meetingID, string description)
    {
        var meeting = await dbContext.Meetings.Where(m =>
                m.MeetingID == meetingID && (m.AttendeeID == userID || m.OrganizerID == userID
            )).FirstAsync();
        if (meeting == null)
            return false;

        meeting.Description = description;
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelMeeting(long organizerID, long meetingID)
    {
        var meeting = await dbContext.Meetings.FindAsync(meetingID);
        if (meeting == null || meeting.OrganizerID != organizerID) return false;

        dbContext.Remove(meeting);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AcceptMeeting(long attendeeID, long meetingID)
    {
        var meeting = await dbContext.Meetings.FindAsync(meetingID);
        if (meeting == null || meeting.AttendeeID != attendeeID) return false;

        meeting.Status = "accepted";
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectMeeting(long attendeeID, long meetingID)
    {
        var meeting = await dbContext.Meetings.FindAsync(meetingID);
        if (meeting == null || meeting.AttendeeID != attendeeID) return false;

        dbContext.Remove(meeting);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public void PostponeMeeting(long attendeeID, long meetingID)
    {

    }
}