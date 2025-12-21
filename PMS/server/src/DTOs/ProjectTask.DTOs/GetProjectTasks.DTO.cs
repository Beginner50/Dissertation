namespace PMS.DTOs;

public class GetProjectTasksDTO
{
    public long TaskID { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public DateTime AssignedDate { get; set; }
    public DateTime DueDate { get; set; }
    public required string Status { get; set; }

    public long? StagedDeliverableID { get; set; }
    public long? SubmittedDeliverableID { get; set; }
}