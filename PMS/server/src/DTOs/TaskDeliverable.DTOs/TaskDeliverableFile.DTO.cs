namespace PMS.DTOs;

public class TaskDeliverableFileDTO
{
    public string Filename { get; set; }
    public byte[] File { get; set; }
    public string ContentType { get; set; }
}