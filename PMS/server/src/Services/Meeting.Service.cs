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
    public MeetingService(PMSDbContext dbContext, MailService mailService, NotificationService notificationService, ReminderService reminderService, ILogger<MeetingService> logger)
    {
        this.dbContext = dbContext;
        this.mailService = mailService;
        this.notificationService = notificationService;
        this.reminderService = reminderService;
        this.logger = logger;
    }

    public async Task<Meeting?> GetMeeting(long meetingID)
    {
        var meeting = await dbContext.Meetings.FindAsync(meetingID) ?? throw new
                            InvalidOperationException("Meeting Not Found!");

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

    public async Task BookMeeting(
        long organizerID, long attendeeID, long taskID,
        string? description, DateTime start, DateTime end
    )
    {
        var organizer = await dbContext.Users.FindAsync(organizerID)
                            ?? throw new Exception("Organizer Not Found!");
        var attendee = await dbContext.Users.FindAsync(attendeeID)
                            ?? throw new Exception("Attendee Not Found!");

        Meeting newMeeting;
        MimeMessage? mail;

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
                    Status = "pending"
                };
                dbContext.Meetings.Add(newMeeting);

                await dbContext.SaveChangesAsync();

                await dbContext.Entry(newMeeting).Reference(m => m.Organizer).LoadAsync();
                await dbContext.Entry(newMeeting).Reference(m => m.Attendee).LoadAsync();

                await notificationService.CreateMeetingNotification(newMeeting, NotificationType.MEETING_BOOKED);
                await reminderService.CreateMeetingReminder(newMeeting);
                mail = mailService.CreateMeetingMail(newMeeting, MailType.MEETING_SCHEDULED);

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        await mailService.SendMail(mail);
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
        MimeMessage? mail;

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
                await reminderService.DeleteMeetingReminder(meeting);
                mail = mailService.CreateMeetingMail(meeting, MailType.MEETING_CANCELLED);

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

        await mailService.SendMail(mail);
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


                meeting.Status = "accepted";
                await dbContext.SaveChangesAsync();

                await notificationService.CreateMeetingNotification(meeting, NotificationType.MEETING_ACCEPTED);

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
        MimeMessage? mail;

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
                await reminderService.DeleteMeetingReminder(meeting);
                mail = mailService.CreateMeetingMail(meeting, MailType.MEETING_REJECTED);

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

        await mailService.SendMail(mail);
    }
}