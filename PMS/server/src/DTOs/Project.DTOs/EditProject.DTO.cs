using System.ComponentModel.DataAnnotations;

namespace PMS.DTOs;

public class EditProjectDTO
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public bool? IsArchived { get; set; }

    [EmailAddress]
    public string? StudentEmail { get; set; }
    [EmailAddress]
    public string? SupervisorEmail { get; set; }
}
