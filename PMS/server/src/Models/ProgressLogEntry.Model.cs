using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class ProgressLogEntry
{
    public long ProgressLogEntryID { get; set; }

    /* 
        This data annotation ensures that the Timestamp is automatically set to the
        current date and time when a new ProgressLogEntry is created in the database.

        https://learn.microsoft.com/en-us/ef/core/modeling/generated-properties?tabs=data-annotations
    */
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime Timestamp { get; set; }
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