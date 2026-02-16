using System.Diagnostics;
using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;

public class MeetingService
{
    protected readonly PMSDbContext dbContext;
    protected readonly MailService mailService;
    protected readonly NotificationService notificationService;
    protected readonly ReminderService reminderService;
    protected readonly ILogger<MeetingService> logger;
    public MeetingService(
        PMSDbContext dbContext,
        MailService mailService,
        NotificationService notificationService,
        ReminderService reminderService,
        ILogger<MeetingService> logger)
    {
        this.dbContext = dbContext;
        this.mailService = mailService;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
        this.logger = logger;
    }

    public async Task<GetMeetingsDTO> GetMeeting(long meetingID)
    {
        var meeting = await dbContext.Meetings.FindAsync(meetingID) ?? throw new
                            UnauthorizedAccessException("Meeting Not Found!");

        return new GetMeetingsDTO
        {
            MeetingID = meeting.MeetingID,
            Description = meeting.Description,
            Start = meeting.Start,
            End = meeting.End,
            Organizer = new UserLookupDTO
            {
                UserID = meeting.Organizer.UserID,
                Name = meeting.Organizer.Name,
                Email = meeting.Organizer.Email
            },
            Attendee = new UserLookupDTO
            {
                UserID = meeting.Attendee.UserID,
                Name = meeting.Attendee.Name,
                Email = meeting.Attendee.Email
            },
            Task = new ProjectTaskLookupDTO
            {
                TaskID = meeting.Task.ProjectTaskID,
                Title = meeting.Task.Title
            },
            Status = GetMeetingStatus(meeting.IsAccepted, meeting.End)
        };
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
            Status = GetMeetingStatus(m.IsAccepted, m.End)
        })
        .Distinct()
        .ToList();
    }

    public async Task BookMeeting(
        long organizerID, long attendeeID, long taskID,
        string? description, DateTime start, DateTime end
    )
    {
        var task = await dbContext.Tasks.Where(
                        t => t.ProjectTaskID == taskID
                            && ((t.Project.StudentID == organizerID
                                 && t.Project.SupervisorID == attendeeID)
                            || (t.Project.SupervisorID == organizerID
                                && t.Project.StudentID == attendeeID))
                    ).FirstOrDefaultAsync()
                    ?? throw new UnauthorizedAccessException("Unauthorized Access!");

        var organizer = await dbContext.Users.FindAsync(organizerID)
                            ?? throw new Exception("Organizer Not Found!");
        var attendee = await dbContext.Users.FindAsync(attendeeID)
                            ?? throw new Exception("Attendee Not Found!");

        Meeting newMeeting;

        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                newMeeting = new Meeting
                {
                    TaskID = taskID,
                    OrganizerID = organizerID,
                    AttendeeID = attendeeID,
                    Description = description,
                    Start = start,
                    End = end,
                    IsAccepted = false
                };
                dbContext.Meetings.Add(newMeeting);

                await dbContext.SaveChangesAsync();

                await dbContext.Entry(newMeeting).Reference(m => m.Organizer).LoadAsync();
                await dbContext.Entry(newMeeting).Reference(m => m.Attendee).LoadAsync();

                await notificationService.CreateMeetingNotification(newMeeting, NotificationType.MEETING_BOOKED);
                await reminderService.CreateMeetingReminders(newMeeting);
                mailService.CreateAndEnqueueMeetingMail(newMeeting, MailType.MEETING_SCHEDULED);

                await transaction.CommitAsync();
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
                    .Include(m => m.Organizer)
                    .Include(m => m.Attendee)
                    .FirstOrDefaultAsync()
                    ?? throw new UnauthorizedAccessException("Unauthorized Access or Meeting Not Found!");


                await notificationService.CreateMeetingNotification(meeting, NotificationType.MEETING_CANCELLED);
                await reminderService.DeleteMeetingReminders(meeting);
                mailService.CreateAndEnqueueMeetingMail(meeting, MailType.MEETING_CANCELLED);

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
                        .Include(m => m.Organizer)
                        .Include(m => m.Attendee)
                    .FirstOrDefaultAsync()
                    ?? throw new UnauthorizedAccessException("Unauthorized Access or Meeting Not Found!");


                meeting.IsAccepted = true;
                await dbContext.SaveChangesAsync();

                await notificationService.CreateMeetingNotification(meeting, NotificationType.MEETING_ACCEPTED);
                mailService.CreateAndEnqueueMeetingMail(meeting, MailType.MEETING_ACCEPTED);

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
                    .Include(m => m.Organizer)
                    .Include(m => m.Attendee)
                  .FirstOrDefaultAsync()
                  ?? throw new UnauthorizedAccessException("Unauthorized Access or Meeting Not Found!");

                await notificationService.CreateMeetingNotification(meeting, NotificationType.MEETING_REJECTED);
                await reminderService.DeleteMeetingReminders(meeting);
                mailService.CreateAndEnqueueMeetingMail(meeting, MailType.MEETING_REJECTED);

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

    protected static string GetMeetingStatus(bool isAccepted, DateTime end)
    {
        if (isAccepted)
            return "accepted";
        else if (end < DateTime.UtcNow)
            return "missed";
        else
            return "pending";
    }
}