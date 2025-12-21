using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class Deliverable
{
    public long DeliverableID { get; set; }
    public required string Filename { get; set; }
    public required byte[] File { get; set; }
    public required string ContentType { get; set; }

    /*
        This data annotation ensures that the SubmissionDate is automatically set to the
        current date and time when a new Deliverable is created in the database.

        https://learn.microsoft.com/en-us/ef/core/modeling/generated-properties?tabs=data-annotations
    */
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime SubmissionTimestamp { get; set; }

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
