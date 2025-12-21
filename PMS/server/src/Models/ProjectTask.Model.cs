using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class ProjectTask
{
    public long TaskID { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }

    /*
        This data annotation ensures that the AssignedDate is automatically set to the
        current date and time when a new Task is created in the database.

        https://learn.microsoft.com/en-us/ef/core/modeling/generated-properties?tabs=data-annotations
    */
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime AssignedDate { get; set; }
    public required DateTime DueDate { get; set; }
    public required string Status { get; set; }

    public long? StagedDeliverableID { get; set; }
    [ForeignKey("StagingDeliverableID")]
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
    public List<ProgressLogEntry> ProgressLogEntries { get; }

    [InverseProperty("Task")]
    public List<Deliverable> AllDeliverables { get; }
}