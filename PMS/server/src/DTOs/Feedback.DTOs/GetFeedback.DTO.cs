namespace PMS.DTOs;

public class GetFeedbackDTO
{
    public long FeedbackCriteriaID { get; set; }
    public string Description { get; set; }
    public string Status { get; set; }
    public long DeliverableID { get; set; }
    public long ProvidedByID { get; set; }
}