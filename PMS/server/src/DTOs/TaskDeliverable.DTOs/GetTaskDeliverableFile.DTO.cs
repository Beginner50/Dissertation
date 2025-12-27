namespace PMS.DTOs;

public class GetTaskDeliverableFileDTO
{
    public string Filename { get; set; }
    public byte[] File { get; set; }
    public string ContentType { get; set; }
}