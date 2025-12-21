using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class Reminder
{
    public long ReminderID { get; set; }
    public required DateTime RemindAt { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime Timestamp { get; set; }

    public required string Message { get; set; }

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