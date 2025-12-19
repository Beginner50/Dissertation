namespace PMS.Models;

public class Meeting
{
    public long MeetingID { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public string? Description { get; set; }
    public required string Status { get; set; }

    public required long OrganizerID { get; set; }
    public User? Organizer;

    public required long AttendeeID { get; set; }
    public User? Attendee;

    public required long ProjectID { get; set; }
    public Project? Project;
}