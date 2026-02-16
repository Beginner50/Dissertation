using PMS.Models;

namespace PMS.DTOs;

public class GetTaskDeliverablesDTO
{
    public long DeliverableID { get; set; }
    public required string Filename { get; set; }
    public DateTime SubmissionTimestamp { get; set; }
    public long TaskID { get; set; }
    public UserLookupDTO? SubmittedBy { get; set; }
}