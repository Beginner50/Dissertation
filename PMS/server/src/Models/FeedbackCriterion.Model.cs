using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class FeedbackCriterion
{
    public long FeedbackCriterionID { get; set; }
    public required string Description { get; set; }
    public required string Status { get; set; }
    public string? ChangeObserved { get; set; }

    public required long DeliverableID { get; set; }
    [ForeignKey("DeliverableID")]
    public Deliverable Deliverable { get; init; }

    public required long ProvidedByID { get; set; }
    [ForeignKey("ProvidedByID")]
    public User ProvidedBy { get; init; }
}