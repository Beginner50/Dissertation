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

    public async Task CreateMeetingNotification(User organizer, User attendee, Meeting meeting, NotificationType notificationType)
    {
        Notification notification;
        switch (notificationType)
        {
            case NotificationType.MEETING_BOOKED:
                notification = new Notification
                {
                    Type = "meeting",
                    Description = $"{organizer.Name} has booked a meeting with you.",
                    RecipientID = attendee.UserID,
                };
                await dbContext.AddAsync(notification);
                break;
            case NotificationType.MEETING_CANCELLED:
                notification = new Notification
                {
                    Type = "meeting",
                    Description = $"{organizer.Name} has cancelled a meeting with you.",
                    RecipientID = attendee.UserID,
                };
                await dbContext.AddAsync(notification);
                break;
            case NotificationType.MEETING_ACCEPTED:
                notification = new Notification
                {
                    Type = "meeting",
                    Description = $"{attendee.Name} has accepted your meeting.",
                    RecipientID = organizer.UserID,
                };
                await dbContext.AddAsync(notification);
                break;
            case NotificationType.MEETING_REJECTED:
                notification = new Notification
                {
                    Type = "meeting",
                    Description = $"{attendee.Name} has rejected your meeting.",
                    RecipientID = organizer.UserID,
                };
                await dbContext.AddAsync(notification);
                break;
            default:
                throw new Exception("Invalid Notification Type!");
        }

        await dbContext.SaveChangesAsync();
    }

    public async Task CreateTaskNotification(
        User supervisor,
        User student,
        ProjectTask task,
        NotificationType notificationType
        )
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
                        Description = $"{supervisor.Name} has created a new task: {task.Title}",
                        RecipientID = (long)student.UserID,
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
                        Description = $"{supervisor.Name} has updated task: {task.Title}",
                        RecipientID = (long)student.UserID,
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
                        Description = $"{supervisor.Name} has deleted task: {task.Title}",
                        RecipientID = (long)student.UserID,
                    };
                    await dbContext.AddAsync(notification);
                }
                break;
            case NotificationType.DELIVERABLE_SUBMITTED:
                notification = new Notification
                {
                    Type = "task",
                    Description = $"{student.Name} has submitted a deliverable for task: {task.Title}",
                    RecipientID = (long)supervisor.UserID,
                };
                await dbContext.AddAsync(notification);
                break;
            case NotificationType.FEEDBACK_PROVIDED:
                notification = new Notification
                {
                    Type = "task",
                    Description = $"{supervisor.Name} provided feedback for task: {task.Title}",
                    RecipientID = (long)student.UserID,
                };
                await dbContext.AddAsync(notification);
                break;
            case NotificationType.FEEDBACK_UPDATED:
                notification = new Notification
                {
                    Type = "task",
                    Description = $"{supervisor.Name} updated feedback for task: {task.Title}",
                    RecipientID = (long)student.UserID
                };
                await dbContext.AddAsync(notification);
                break;
            default:
                throw new Exception("Invalid Notification Type!");
        }

        await dbContext.SaveChangesAsync();
    }
}