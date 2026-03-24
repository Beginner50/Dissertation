using System.Linq.Expressions;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.Models;

namespace PMS.Services;

public static class MeetingQueryExtensions
{
    public static IQueryable<Meeting> IsParticipant(this IQueryable<Meeting> query, long userID)
    {
        return query.Where(m => m.AttendeeID == userID || m.OrganizerID == userID);
    }

    public static IQueryable<Meeting> IsOrganizer(this IQueryable<Meeting> query, long userID)
    {
        return query.Where(m => m.OrganizerID == userID);
    }

    public static IQueryable<Meeting> IsAttendee(this IQueryable<Meeting> query, long userID)
    {
        return query.Where(m => m.AttendeeID == userID);
    }
}

public class MeetingService
{
    private readonly PMSDbContext dbContext;
    private readonly ProjectService projectService;
    private readonly ProjectTaskService projectTaskService;
    private readonly MailService mailService;
    private readonly ReminderService reminderService;
    private readonly ILogger<MeetingService> logger;
    public MeetingService(
        PMSDbContext dbContext,
        ProjectService projectService,
        ProjectTaskService projectTaskService,
        MailService mailService,
        ReminderService reminderService,
        ILogger<MeetingService> logger)
    {
        this.dbContext = dbContext;
        this.projectService = projectService;
        this.projectTaskService = projectTaskService;
        this.mailService = mailService;
        this.reminderService = reminderService;
        this.logger = logger;
    }

    public async Task<T> GetSupervisorMeeting<T>(
        long meetingID,
        Expression<Func<Meeting, T>> selector,
        Func<IQueryable<Meeting>, IQueryable<Meeting>>? queryExtension = null
    )
    {
        var query = dbContext.Meetings.Where(m => m.MeetingID == meetingID);

        if (queryExtension != null)
            query = queryExtension(query);

        return await query.Select(selector)
                          .FirstOrDefaultAsync()
                          ?? throw new UnauthorizedAccessException("Meeting Not Found!");
    }

    public async Task<IEnumerable<T>> GetSupervisorMeetings<T>(
        long userID,
        Expression<Func<Meeting, T>> selector,
        Func<IQueryable<Meeting>, IQueryable<Meeting>>? queryExtension = null
    )
    {
        var supervisorIDs = await dbContext.ProjectAssignment
                                        .ContainsMember(userID)
                                        .Where(ps => dbContext.Projects.Where(p => p.ProjectID == ps.ProjectID)
                                                                       .NotArchived()
                                                                       .Any())
                                        .Select(ps => ps.Supervisor!)
                                        .Select(u => u.UserID)
                                        .ToListAsync();

        var meetingsQuery = dbContext.Meetings.Where(
            m => supervisorIDs.Contains(m.OrganizerID) || supervisorIDs.Contains(m.AttendeeID)
        );
        if (queryExtension != null)
            meetingsQuery = queryExtension(meetingsQuery);

        return await meetingsQuery.Select(selector)
                                  .ToListAsync();
    }

    public async Task BookMeeting(
        long organizerID, long projectID, long taskID,
        long attendeeID, string? description, DateTime start, DateTime end
    )
    {
        var task = await projectTaskService.GetProjectTask(
            organizerID,
            projectID,
            taskID,
            selector: t => t,
            projectSupervisionQueryExtension: q => q.Where(ps => (ps.SupervisorID == organizerID
                                                                   && ps.StudentID == attendeeID)
                                                                   || (ps.SupervisorID == attendeeID
                                                                       && ps.StudentID == organizerID))
        );

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

                var meeting = await GetSupervisorMeeting(
                    newMeeting.MeetingID,
                    selector: m => m,
                    queryExtension: m => m.Include(m => m.Organizer)
                                          .Include(m => m.Attendee)
                );

                await reminderService.CreateMeetingReminders(
                    meeting.Organizer!, meeting.Attendee!, meeting);
                mailService.CreateAndEnqueueMeetingMail(
                    meeting.Organizer!, meeting.Attendee!, meeting, MailType.MEETING_SCHEDULED);

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
        var meeting = await GetSupervisorMeeting(
            meetingID,
            selector: m => m,
            queryExtension: m => m.IsParticipant(userID)
        );

        meeting.Description = description;

        await dbContext.SaveChangesAsync();
    }

    public async Task CancelMeeting(long organizerID, long meetingID)
    {
        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                var meeting = await GetSupervisorMeeting(
                    meetingID,
                    selector: m => m,
                    queryExtension: m => m.IsOrganizer(organizerID)
                                          .Include(m => m.Organizer)
                                          .Include(m => m.Attendee)
                );

                await reminderService.DeleteMeetingReminders(meeting);
                mailService.CreateAndEnqueueMeetingMail(
                    meeting.Organizer!, meeting.Attendee!, meeting, MailType.MEETING_CANCELLED);

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
        var meeting = await GetSupervisorMeeting(
            meetingID,
            selector: m => m,
            queryExtension: m => m.IsAttendee(attendeeID)
                                  .Include(m => m.Organizer)
                                  .Include(m => m.Attendee)
        );

        meeting.IsAccepted = true;
        await dbContext.SaveChangesAsync();

        mailService.CreateAndEnqueueMeetingMail(
            meeting.Organizer!, meeting.Attendee!, meeting, MailType.MEETING_ACCEPTED);
    }

    public async Task RejectMeeting(long attendeeID, long meetingID)
    {
        var meeting = await GetSupervisorMeeting(
            meetingID,
            selector: m => m,
            queryExtension: m => m.IsAttendee(attendeeID)
                                  .Include(m => m.Organizer)
                                  .Include(m => m.Attendee)
        );

        await reminderService.DeleteMeetingReminders(meeting);
        mailService.CreateAndEnqueueMeetingMail(
            meeting.Organizer!, meeting.Attendee!, meeting, MailType.MEETING_REJECTED);

        dbContext.Remove(meeting);
        await dbContext.SaveChangesAsync();
    }

    public static string GetMeetingStatus(bool isAccepted, DateTime end)
    {
        if (isAccepted)
            return "accepted";
        else if (end < DateTime.UtcNow)
            return "missed";
        else
            return "pending";
    }
}