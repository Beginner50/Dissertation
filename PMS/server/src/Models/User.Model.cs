using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class User
{
    public long UserID { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string Role { get; set; }
    public bool IsDeleted { get; set; }

    /*
        The InverseProperty is explictly used to connect a Navigation property to its
        inverse in another entity referencing User.

        A Navigation Property does not actually exist in the database table
    */
    [InverseProperty("Supervisor")]
    public List<Project> SupervisedProjects { get; }

    [InverseProperty("Student")]
    public List<Project> ConductedProjects { get; }

    [InverseProperty("Organizer")]
    public List<Meeting> OrganizedMeetings { get; }

    [InverseProperty("Attendee")]
    public List<Meeting> AttendedMeetings { get; }

    [InverseProperty("Recipient")]
    public List<Reminder> Reminders { get; }

    [InverseProperty("SubmittedBy")]
    public List<Deliverable> SubmittedDeliverables { get; }

    [InverseProperty("ProvidedBy")]
    public List<FeedbackCriteria> ProvidedFeedbackCriterias { get; }
}