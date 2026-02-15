using System.CodeDom;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Lib;
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

    public async Task CreateMeetingReminders(Meeting meeting)
    {
        var attendeeReminder = new Reminder
        {
            Message = $"{meeting.Organizer.Name} has booked a meeting with you.",
            RemindAt = meeting.Start,
            Type = "meeting",
            RecipientID = meeting.AttendeeID,
            MeetingID = meeting.MeetingID,
        };

        var organizerReminder = new Reminder
        {
            Message = $"You have booked a meeting with {meeting.Attendee.Name}.",
            RemindAt = meeting.Start,
            Type = "meeting",
            RecipientID = meeting.OrganizerID,
            MeetingID = meeting.MeetingID,
        };

        await dbContext.AddAsync(attendeeReminder);
        await dbContext.AddAsync(organizerReminder);

        await dbContext.SaveChangesAsync();
    }

    public async Task UpdateMeetingReminders(Meeting meeting)
    {
        var reminders = await dbContext.Reminders
                        .Where(r => r.MeetingID == meeting.MeetingID)
                        .ToListAsync()
                        ?? throw new Exception("Reminder Not Found!");

        foreach (var reminder in reminders)
            reminder.RemindAt = meeting.Start;

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteMeetingReminders(Meeting meeting)
    {
        var reminders = await dbContext.Reminders
                        .Where(r => r.MeetingID == meeting.MeetingID)
                        .ToListAsync()
                        ?? throw new Exception("Reminder Not Found!");

        dbContext.Reminders.RemoveRange(reminders);
        await dbContext.SaveChangesAsync();
    }

    public async Task CreateTaskReminder(ProjectTask task)
    {

        var taskReminder = new Reminder
        {
            Message = $"{task.Project.Supervisor.Name} has created a new task: {task.Title}",
            RemindAt = task.DueDate,
            Type = "task",
            RecipientID = (long)task.Project.StudentID,
            TaskID = task.ProjectTaskID,
        };

        await dbContext.AddAsync(taskReminder);

        await dbContext.SaveChangesAsync();
    }

    public async Task UpdateTaskReminder(ProjectTask task)
    {
        var reminder = await dbContext.Reminders.Where(r => r.TaskID == task.ProjectTaskID)
                                                .FirstOrDefaultAsync()
                                                ?? throw new Exception("Reminder Not Found");

        reminder.RemindAt = task.DueDate;

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteTaskReminder(ProjectTask task)
    {
        var reminder = await dbContext.Reminders.Where(r => r.TaskID == task.ProjectTaskID)
                                                .FirstOrDefaultAsync()
                                                ?? throw new Exception("Reminder Not Found");
        dbContext.Remove(reminder);

        await dbContext.SaveChangesAsync();
    }
}