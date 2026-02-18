namespace PMS.DTOs;

public class FileDTO
{
    public required string Filename { get; set; }
    public required byte[] File { get; set; }
    public required string ContentType { get; set; }
}