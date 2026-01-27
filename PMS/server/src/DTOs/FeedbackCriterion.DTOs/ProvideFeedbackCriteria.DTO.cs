namespace PMS.DTOs;

public class ProvideFeedbackCriteriaDTO
{
    public List<CreateFeedbackCriterionDTO> FeedbackCriteriaToCreate { get; set; } = [];
    public List<UpdateFeedbackCriterionDTO> FeedbackCriteriaToUpdate { get; set; } = [];
    public List<DeleteFeedbackCriterionDTO> FeedbackCriteriaToDelete { get; set; } = [];
}