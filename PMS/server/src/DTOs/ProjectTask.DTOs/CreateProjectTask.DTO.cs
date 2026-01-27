namespace PMS.DTOs;

public class CreateProjectTaskDTO
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required DateTime DueDate { get; set; }
}