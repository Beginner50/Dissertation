using System.Diagnostics;
using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;

public class MeetingService
{
    protected readonly PMSDbContext dbContext;
    protected readonly NotificationService notificationService;
    protected readonly ReminderService reminderService;
    public MeetingService(PMSDbContext dbContext, NotificationService notificationService, ReminderService reminderService)
    {
        this.dbContext = dbContext;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
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

    public async Task<IEnumerable<GetMeetingsDTO>> GetSupervisorMeetings(long userID)
    {
        var projectSupervisor = await dbContext.Projects
                                .Where(p => p.SupervisorID == userID || p.StudentID == userID)
                                .Select(p => p.Supervisor)
                                .FirstOrDefaultAsync()
                                ?? throw new Exception("Project Supervisor Not Found!");

        var meetings = await dbContext.Meetings
                    .Include(m => m.Task)
                    .Include(m => m.Organizer)
                    .Include(m => m.Attendee)
                    .Where(m => m.AttendeeID == projectSupervisor.UserID || m.OrganizerID == projectSupervisor.UserID)
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
            Task = new ProjectTaskLookupDTO
            {
                TaskID = m.Task.ProjectID,
                Title = m.Task.Title
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
        .ToList();
    }

    public async Task<Meeting> BookMeeting(
        long organizerID, long attendeeID, long taskID,
        string? description, DateTime start, DateTime end
    )
    {
        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                var newMeeting = new Meeting
                {
                    TaskID = taskID,
                    OrganizerID = organizerID,
                    AttendeeID = attendeeID,
                    Description = description,
                    Start = start,
                    End = end,
                    Status = "pending"
                };
                dbContext.Meetings.Add(entity: newMeeting);

                await dbContext.SaveChangesAsync();

                await notificationService.CreateMeetingNotification(newMeeting.MeetingID, NotificationType.MEETING_BOOKED);
                await reminderService.CreateMeetingReminder(newMeeting.MeetingID);

                await transaction.CommitAsync();

                return newMeeting;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
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
        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                var meeting = await dbContext.Meetings.Where(m =>
                    m.MeetingID == meetingID &&
                        m.OrganizerID == organizerID)
                    .FirstOrDefaultAsync()
                    ?? throw new UnauthorizedAccessException("Unauthorized Access or Meeting Not Found!");


                await notificationService.CreateMeetingNotification(meeting.MeetingID, NotificationType.MEETING_CANCELLED);
                await reminderService.DeleteMeetingReminder(meeting.MeetingID);

                dbContext.Remove(meeting);
                await dbContext.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public async Task AcceptMeeting(long attendeeID, long meetingID)
    {
        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                var meeting = await dbContext.Meetings.Where(m =>
                    m.MeetingID == meetingID &&
                        m.AttendeeID == attendeeID)
                    .FirstOrDefaultAsync()
                    ?? throw new UnauthorizedAccessException("Unauthorized Access or Meeting Not Found!");


                meeting.Status = "accepted";
                await dbContext.SaveChangesAsync();

                await notificationService.CreateMeetingNotification(meeting.MeetingID, NotificationType.MEETING_ACCEPTED);

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public async Task RejectMeeting(long attendeeID, long meetingID)
    {
        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                var meeting = await dbContext.Meetings.Where(m =>
                  m.MeetingID == meetingID &&
                      m.AttendeeID == attendeeID)
                  .FirstOrDefaultAsync()
                  ?? throw new UnauthorizedAccessException("Unauthorized Access or Meeting Not Found!");

                await notificationService.CreateMeetingNotification(meeting.MeetingID, NotificationType.MEETING_REJECTED);

                dbContext.Remove(meeting);
                await dbContext.SaveChangesAsync();

                await reminderService.DeleteMeetingReminder(meeting.MeetingID);

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}