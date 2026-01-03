using System.CodeDom;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;

public class ReminderService
{
    protected readonly PMSDbContext dbContext;
    public ReminderService(PMSDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<IEnumerable<ReminderDTO>> GetAllReminders(long userID)
    {
        var reminders = await dbContext.Reminders
                        .Where(r => r.RecipientID == userID)
                        .ToListAsync();

        var expiredReminders = reminders.Where(r => r.RemindAt < DateTime.UtcNow).ToList();
        dbContext.RemoveRange(expiredReminders);

        await dbContext.SaveChangesAsync();

        return reminders.Where(r => r.RemindAt > DateTime.UtcNow)
                        .OrderBy(r => r.RemindAt)
                        .Select(r => new ReminderDTO
                        {
                            ReminderID = r.ReminderID,
                            Type = r.Type,
                            RemindAt = r.RemindAt,
                            Message = r.Message,
                            RecipientID = r.RecipientID,
                        })
                        .ToList();
    }

    public async Task CreateMeetingReminder(long meetingID)
    {
        var meeting = await dbContext.Meetings.Where(m => m.MeetingID == meetingID)
                                              .Include(m => m.Organizer)
                                              .Include(m => m.Attendee)
                                              .FirstOrDefaultAsync()
                                              ?? throw new UnauthorizedAccessException("Meeting Not Found!");


        var meetingReminder = new Reminder
        {
            Message = $"{meeting.Organizer.Name} has booked a meeting with you.",
            RemindAt = meeting.Start,
            Type = "meeting",
            RecipientID = meeting.AttendeeID,
            MeetingID = meeting.MeetingID,
        };
        await dbContext.AddAsync(meetingReminder);

        await dbContext.SaveChangesAsync();
    }

    public async Task UpdateMeetingReminder(long meetingID)
    {
        var meeting = await dbContext.Meetings
                        .Where(m => m.MeetingID == meetingID)
                        .FirstOrDefaultAsync()
                        ?? throw new Exception("Meeting Not Found!");
        var reminder = await dbContext.Reminders
                        .Where(r => r.MeetingID == meetingID)
                        .FirstOrDefaultAsync()
                        ?? throw new Exception("Reminder Not Found!");

        reminder.RemindAt = meeting.Start;

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteMeetingReminder(long meetingID)
    {
        var reminder = await dbContext.Reminders
                        .Where(r => r.MeetingID == meetingID).FirstOrDefaultAsync()
                        ?? throw new Exception("Reminder Not Found!");

        dbContext.Reminders.Remove(reminder);
        await dbContext.SaveChangesAsync();
    }

    public async Task CreateTaskReminder(long taskID)
    {

        var task = await dbContext.Tasks.Where(t => t.ProjectTaskID == taskID)
                                        .Include(t => t.Project)
                                            .ThenInclude(p => p.Supervisor)
                                        .Include(t => t.Project)
                                            .ThenInclude(p => p.Student)
                                        .FirstOrDefaultAsync()
                                        ?? throw new UnauthorizedAccessException("Task Not Found!");


        if (task.Project.StudentID != null)
        {
            var taskNotification = new Reminder
            {
                Message = $"{task.Project.Supervisor.Name} has created a new task: {task.Title}",
                RemindAt = task.DueDate,
                Type = "task",
                RecipientID = (long)task.Project.StudentID,
                TaskID = task.ProjectTaskID,
            };
            await dbContext.AddAsync(taskNotification);
        }

        await dbContext.SaveChangesAsync();
    }

    public async Task UpdateTaskReminder(long taskID)
    {
        var task = await dbContext.Tasks.Where(t => t.ProjectTaskID == taskID)
                                        .FirstOrDefaultAsync()
                                        ?? throw new Exception("Task Not Found!");
        var reminder = await dbContext.Reminders.Where(r => r.TaskID == taskID)
                                                .FirstOrDefaultAsync()
                                                ?? throw new Exception("Reminder Not Found");

        reminder.RemindAt = task.DueDate;

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteTaskReminder(long taskID)
    {
        var reminder = await dbContext.Reminders.Where(r => r.TaskID == taskID)
                                                .FirstOrDefaultAsync()
                                                ?? throw new Exception("Reminder Not Found");
        dbContext.Remove(reminder);

        await dbContext.SaveChangesAsync();
    }
}