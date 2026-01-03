namespace PMS.DTOs;

public class NotificationDTO
{

    public long NotificationID { get; set; }
    public string Type { get; set; }
    public string Description { get; set; }
    public DateTime Timestamp { get; set; }
    public long RecipientID { get; set; }
}