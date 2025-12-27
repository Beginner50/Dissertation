using PMS.Models;

namespace PMS.DTOs;

public class GetTaskDeliverablesDTO
{
    public long DeliverableID { get; set; }
    public string Filename { get; set; }
    public DateTime SubmissionTimestamp { get; set; }
    public long TaskID { get; set; }
    public UserLookupDTO SubmittedBy { get; set; }

    public List<FeedbackCriteria> FeedbackCriterias { get; set; }
}