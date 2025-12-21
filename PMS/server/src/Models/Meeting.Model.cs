using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class Meeting
{
    public long MeetingID { get; set; }
    public required DateTime Start { get; set; }
    public required DateTime End { get; set; }
    public string? Description { get; set; }
    public required string Status { get; set; }

    public required long OrganizerID { get; set; }
    [ForeignKey("OrganizerID")]
    public User Organizer { get; init; }

    public required long AttendeeID { get; set; }
    [ForeignKey("AttendeeID")]
    public User Attendee { get; init; }

    public required long ProjectID { get; set; }
    [ForeignKey("ProjectID")]
    public Project Project { get; init; }
}