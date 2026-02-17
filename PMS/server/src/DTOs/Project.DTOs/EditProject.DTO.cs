namespace PMS.DTOs;

public class EditProjectDTO
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public long? StudentID { get; set; }
    public long? SupervisorID { get; set; }
}
