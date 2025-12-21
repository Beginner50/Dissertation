using PMS.DatabaseContext;
using PMS.Models;

namespace PMS.Services;

public enum ReminderType
{
    MEETING_BOOKED,
    MEETING_CANCELLED,
    MEETING_ACCEPTED,
    MEETING_REJECTED
}

public class ReminderService
{
    protected readonly PMSDbContext dbContext;
    public ReminderService(PMSDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public void CreateMeetingReminder(Meeting meeting, ReminderType reminderType)
    {
        Reminder newReminder;
        switch (reminderType)
        {
            case ReminderType.MEETING_BOOKED:
                newReminder = new Reminder
                {
                    Message = $"{meeting.Organizer.Name} has booked a meeting with you.",
                    RemindAt = meeting.Start,
                    RecipientID = meeting.AttendeeID,
                    MeetingID = meeting.MeetingID,
                };
                break;
            case ReminderType.MEETING_CANCELLED:
                newReminder = new Reminder
                {
                    Message = $"{meeting.Organizer.Name} has cancelled a meeting with you.",
                    RemindAt = meeting.Start,
                    RecipientID = meeting.AttendeeID,
                    MeetingID = meeting.MeetingID,
                };
                break;
            case ReminderType.MEETING_ACCEPTED:
                break;
            case ReminderType.MEETING_REJECTED:
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(reminderType), reminderType, null);
        }
    }

    public void DeleteMeetingReminders(long meetingID)
    {
        var reminders = dbContext.Reminders
                        .Where(r => r.MeetingID == meetingID);
        dbContext.Reminders.RemoveRange(reminders);
        dbContext.SaveChanges();
    }
}