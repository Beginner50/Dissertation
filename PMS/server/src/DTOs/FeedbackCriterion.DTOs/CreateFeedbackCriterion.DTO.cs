using PMS.Services;

namespace PMS.DTOs;

public class CreateFeedbackCriterionDTO
{
    public required string Description { get; set; }
    public string? Status { get; set; }
}