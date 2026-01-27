using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

namespace PMS.Services;

public enum NotificationType
{
    MEETING_BOOKED,
    MEETING_CANCELLED,
    MEETING_ACCEPTED,
    MEETING_REJECTED,
    TASK_CREATED,
    TASK_UPDATED,
    TASK_DELETED,
    DELIVERABLE_SUBMITTED,
    FEEDBACK_PROVIDED,
    FEEDBACK_UPDATED,
}

public class NotificationService
{
    protected readonly PMSDbContext dbContext;
    protected readonly ILogger<NotificationService> logger;
    public NotificationService(PMSDbContext dbContext, ILogger<NotificationService> logger)
    {
        this.dbContext = dbContext;
        this.logger = logger;
    }

    public async Task<IEnumerable<NotificationDTO>> GetAllNotifications(long userID)
    {
        return await dbContext.Notifications
                                .Where(n => n.RecipientID == userID)
                                .Select(n => new NotificationDTO
                                {
                                    NotificationID = n.NotificationID,
                                    Type = n.Type,
                                    Description = n.Description,
                                    Timestamp = n.Timestamp,
                                    RecipientID = n.RecipientID
                                })
                                .ToListAsync();
    }

    public async Task CreateMeetingNotification(Meeting meeting, NotificationType notificationType)
    {
        Notification notification;
        switch (notificationType)
        {
            case NotificationType.MEETING_BOOKED:
                notification = new Notification
                {
                    Type = "meeting",
                    Description = $"{meeting.Organizer.Name} has booked a meeting with you.",
                    RecipientID = meeting.AttendeeID,
                };
                await dbContext.AddAsync(notification);
                break;
            case NotificationType.MEETING_CANCELLED:
                notification = new Notification
                {
                    Type = "meeting",
                    Description = $"{meeting.Organizer.Name} has cancelled a meeting with you.",
                    RecipientID = meeting.AttendeeID,
                };
                await dbContext.AddAsync(notification);
                break;
            case NotificationType.MEETING_ACCEPTED:
                notification = new Notification
                {
                    Type = "meeting",
                    Description = $"{meeting.Attendee.Name} has accepted your meeting.",
                    RecipientID = meeting.OrganizerID,
                };
                await dbContext.AddAsync(notification);
                break;
            case NotificationType.MEETING_REJECTED:
                notification = new Notification
                {
                    Type = "meeting",
                    Description = $"{meeting.Attendee.Name} has rejected your meeting.",
                    RecipientID = meeting.OrganizerID,
                };
                await dbContext.AddAsync(notification);
                break;
            default:
                throw new Exception("Invalid Notification Type!");
        }

        await dbContext.SaveChangesAsync();
    }

    public async Task CreateTaskNotification(ProjectTask task, NotificationType notificationType)
    {
        Notification notification;
        switch (notificationType)
        {
            case NotificationType.TASK_CREATED:
                if (task.Project.StudentID != null)
                {

                    notification = new Notification
                    {
                        Type = "task",
                        Description = $"{task.Project.Supervisor.Name} has created a new task: {task.Title}",
                        RecipientID = (long)task.Project.StudentID,
                    };
                    await dbContext.AddAsync(notification);
                }
                break;
            case NotificationType.TASK_UPDATED:
                if (task.Project.StudentID != null)
                {
                    notification = new Notification
                    {
                        Type = "task",
                        Description = $"{task.Project.Supervisor.Name} has updated task: {task.Title}",
                        RecipientID = (long)task.Project.StudentID,
                    };
                    await dbContext.AddAsync(notification);
                }
                break;
            case NotificationType.TASK_DELETED:
                if (task.Project.StudentID != null)
                {
                    notification = new Notification
                    {
                        Type = "task",
                        Description = $"{task.Project.Supervisor.Name} has deleted task: {task.Title}",
                        RecipientID = (long)task.Project.StudentID,
                    };
                    await dbContext.AddAsync(notification);
                }
                break;
            case NotificationType.DELIVERABLE_SUBMITTED:
                notification = new Notification
                {
                    Type = "task",
                    Description = $"{task.Project.Student.Name} has submitted a deliverable for task: {task.Title}",
                    RecipientID = (long)task.Project.SupervisorID,
                };
                await dbContext.AddAsync(notification);
                break;
            case NotificationType.FEEDBACK_PROVIDED:
                notification = new Notification
                {
                    Type = "task",
                    Description = $"{task.Project.Supervisor.Name} provided feedback for task: {task.Title}",
                    RecipientID = (long)task.Project.StudentID,
                };
                await dbContext.AddAsync(notification);
                break;
            case NotificationType.FEEDBACK_UPDATED:
                notification = new Notification
                {
                    Type = "task",
                    Description = $"{task.Project.Supervisor.Name} updated feedback for task: {task.Title}",
                    RecipientID = (long)task.Project.StudentID,
                };
                await dbContext.AddAsync(notification);
                break;
            default:
                throw new Exception("Invalid Notification Type!");
        }

        await dbContext.SaveChangesAsync();
    }
}