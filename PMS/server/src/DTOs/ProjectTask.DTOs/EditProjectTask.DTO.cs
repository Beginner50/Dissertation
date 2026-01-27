namespace PMS.DTOs;

public class EditProjectTaskDTO
{
    public long TaskID { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
}