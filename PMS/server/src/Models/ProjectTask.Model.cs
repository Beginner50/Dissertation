using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PMS.Models;

public class ProjectTask
{
    public long ProjectTaskID { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    public required DateTime DueDate { get; set; }
    public required string Status { get; set; }

    public long? StagedDeliverableID { get; set; }
    [ForeignKey("StagedDeliverableID")]
    public Deliverable? StagedDeliverable { get; set; }

    public long? SubmittedDeliverableID { get; set; }
    [ForeignKey("SubmittedDeliverableID")]
    public Deliverable? SubmittedDeliverable { get; set; }

    public required long ProjectID { get; set; }
    [ForeignKey("ProjectID")]
    public Project Project { get; init; }

    /*
           The InverseProperty is explictly used to connect a Navigation property to its
           inverse in another entity referencing User.

           A Navigation Property does not actually exist in the database table
    */
    [InverseProperty("Task")]
    public List<Reminder> Reminders { get; }

    [InverseProperty("Task")]
    public List<Meeting> Meetings { get; }

    [InverseProperty("Task")]
    public List<Deliverable> AllDeliverables { get; }
}