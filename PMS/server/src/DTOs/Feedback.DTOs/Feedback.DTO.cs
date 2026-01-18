namespace PMS.DTOs;

public class FeedbackDTO
{
    public long FeedbackCriteriaID { get; set; }
    public string Description { get; set; }
    public string Status { get; set; }
    public string? ChangeObserved { get; set; }
}