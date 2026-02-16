using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class FeedbackCriterion
{
    public long FeedbackCriterionID { get; set; }
    public required string Description { get; set; }
    public required string Status { get; set; }
    public string? ChangeObserved { get; set; }

    public required long TaskID { get; set; }
    [ForeignKey("TaskID")]
    public ProjectTask Task { get; init; }

    public required long ProvidedByID { get; set; }
    [ForeignKey("ProvidedByID")]
    public User ProvidedBy { get; init; }
}