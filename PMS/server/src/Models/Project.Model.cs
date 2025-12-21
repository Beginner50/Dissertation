using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class Project
{
    public long ProjectID { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required string Status { get; set; }

    public long? StudentID { get; set; }
    [ForeignKey("StudentID")]
    public User? Student { get; set; }

    public long? SupervisorID { get; set; }
    [ForeignKey("SupervisorID")]
    public User? Supervisor { get; set; }

    /*
        The InverseProperty is explictly used to connect a Navigation property to its
        inverse in another entity referencing User.

        A Navigation Property does not actually exist in the database table
    */
    [InverseProperty("Project")]
    public List<ProjectTask> Tasks { get; set; }

    [InverseProperty("Project")]
    public List<Meeting> Meetings { get; set; }

    [InverseProperty("Project")]
    public List<ProgressLogEntry> ProgressLogEntries { get; }
}