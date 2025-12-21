using PMS.Models;

namespace PMS.DTOs;

public class GetProjectsDTO
{
    public long ProjectID { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public UserLookupDTO? Supervisor { get; set; }
    public UserLookupDTO? Student { get; set; }
}