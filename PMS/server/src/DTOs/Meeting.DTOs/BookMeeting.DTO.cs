namespace PMS.DTOs;

public class BookMeetingDTO
{
    public long AttendeeID { get; set; }
    public string? Description { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public long TaskID { get; set; }
}