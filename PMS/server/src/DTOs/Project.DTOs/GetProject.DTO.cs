using PMS.Models;

namespace PMS.DTOs;

public class GetProjectDTO
{
    public long ProjectID { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Status { get; set; }
    public UserLookupDTO? Supervisor { get; set; }
    public UserLookupDTO? Student { get; set; }
    public List<ProjectTaskLookupDTO> Tasks { get; set; } = [];
}