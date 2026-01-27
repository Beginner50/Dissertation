namespace PMS.DTOs;

public class UpdateFeedbackCriterionDTO
{
    public long FeedbackCriterionID { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public string? ChangeObserved { get; set; }
}