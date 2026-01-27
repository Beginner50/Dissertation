namespace PMS.DTOs;

public class GetFeedbackCriterionDTO
{
    public long FeedbackCriterionID { get; set; }
    public required string Description { get; set; }
    public required string Status { get; set; }
    public string? ChangeObserved { get; set; }
}