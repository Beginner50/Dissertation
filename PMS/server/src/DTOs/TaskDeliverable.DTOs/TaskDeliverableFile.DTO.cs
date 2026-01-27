namespace PMS.DTOs;

public class TaskDeliverableFileDTO
{
    public required string Filename { get; set; }
    public required byte[] File { get; set; }
    public required string ContentType { get; set; }
}