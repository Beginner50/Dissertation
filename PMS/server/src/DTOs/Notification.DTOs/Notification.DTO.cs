namespace PMS.DTOs;

public class NotificationDTO
{

    public long NotificationID { get; set; }
    public required string Type { get; set; }
    public string? Description { get; set; }
    public required DateTime Timestamp { get; set; }
    public long RecipientID { get; set; }
}