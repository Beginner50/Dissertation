namespace PMS.DTOs;

public class CreateProjectDTO
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public long? StudentID { get; set; }
    public long? SupervisorID { get; set; }
}