using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class Notification
{
    public long NotificationID { get; set; }
    public string Type { get; set; }
    public string Description { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public required long RecipientID { get; set; }
    [ForeignKey("RecipientID")]
    public User Recipient { get; init; }

    public long? MeetingID { get; set; }
    [ForeignKey("MeetingID")]
    public Meeting? Meeting { get; set; }

    public long? TaskID { get; set; }
    [ForeignKey("TaskID")]
    public ProjectTask? Task { get; set; }
}