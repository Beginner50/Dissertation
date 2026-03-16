using System.ComponentModel.DataAnnotations;

namespace PMS.DTOs;

public class CreateProjectDTO
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    [EmailAddress]
    public required string StudentEmail { get; set; }
    [EmailAddress]
    public required string SupervisorEmail { get; set; }
}