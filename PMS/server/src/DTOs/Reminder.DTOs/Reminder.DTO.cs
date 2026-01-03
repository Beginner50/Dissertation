namespace PMS.DTOs;

public class ReminderDTO
{
    public long ReminderID { get; set; }
    public DateTime? RemindAt { get; set; }
    public string Type { get; set; }
    public string Message { get; set; }
    public long RecipientID { get; set; }
}