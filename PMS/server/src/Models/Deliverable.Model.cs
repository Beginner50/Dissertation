using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class Deliverable
{
    public long DeliverableID { get; set; }
    public required string Filename { get; set; }
    public required byte[] File { get; set; }
    public required string ContentType { get; set; }

    [Column(TypeName = "text")]
    public string TableOfContent { get; set; }
    public DateTime SubmissionTimestamp { get; set; } = DateTime.UtcNow;

    public required long TaskID { get; set; }
    [ForeignKey("TaskID")]
    [InverseProperty("AllDeliverables")]
    public ProjectTask Task { get; init; }

    public required long SubmittedByID { get; set; }
    [ForeignKey("SubmittedByID")]
    public User SubmittedBy { get; init; }

    /*
        The InverseProperty is explictly used to connect a Navigation property to its
        inverse in another entity referencing Deliverable.

        A Navigation Property does not actually exist in the database table
    */
    [InverseProperty("Deliverable")]
    public List<FeedbackCriteria> FeedbackCriterias { get; set; }
}
