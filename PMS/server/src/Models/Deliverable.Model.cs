using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class Deliverable
{
    public long DeliverableID { get; set; }
    public required string Filename { get; set; }
    public required byte[] File { get; set; }
    public required string ContentType { get; set; }
    public DateTime SubmissionTimestamp { get; set; } = DateTime.UtcNow;

    public required long TaskID { get; set; }
    [ForeignKey("TaskID")]
    [InverseProperty("AllDeliverables")]
    public ProjectTask Task { get; init; }

    public required long SubmittedByID { get; set; }
    [ForeignKey("SubmittedByID")]
    public User SubmittedBy { get; init; }

}
