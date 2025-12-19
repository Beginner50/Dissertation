using PMS.Models;

namespace PMS.DTOs;

public class GetMeetingsDTO
{
    public required long MeetingID { get; set; }
    public required DateTime Start { get; set; }
    public required DateTime End { get; set; }
    public string? Description { get; set; }
    public UserLookupDTO? Organizer { get; set; }
    public UserLookupDTO? Attendee { get; set; }
    public ProjectLookupDTO? Project { get; set; }
    public required string Status { get; set; }
}

