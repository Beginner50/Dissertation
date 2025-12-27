using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class ProgressLogEntry
{
    public long ProgressLogEntryID { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public required string Description { get; set; }

    public required long ProjectID { get; set; }
    [ForeignKey("ProjectID")]
    public Project Project { get; init; }

    public long? MeetingID { get; set; }
    [ForeignKey("MeetingID")]
    public Meeting? Meeting { get; set; }

    public long? TaskID { get; set; }
    [ForeignKey("TaskID")]
    public ProjectTask? Task { get; set; }
}