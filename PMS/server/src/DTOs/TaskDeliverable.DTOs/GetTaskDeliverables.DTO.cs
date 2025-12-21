namespace PMS.DTOs;

public class GetTaskDeliverablesDTO
{
    public required long DeliverableID { get; set; }
    public required string Filename { get; set; }
    public required DateTime SubmissionTimestamp { get; set; }
    public required long TaskID { get; set; }
    public required UserLookupDTO SubmittedBy { get; set; }
}