using PMS.Models;

namespace PMS.DTOs;

public class GetProjectDTO
{
    public long ProjectID { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required bool IsArchived { get; set; }
    public IEnumerable<UserLookupDTO> Supervisors { get; set; } = [];
    public IEnumerable<UserLookupDTO> Students { get; set; } = [];
    public IEnumerable<ProjectTaskLookupDTO> Tasks { get; set; } = [];
}