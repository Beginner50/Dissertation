using System.ComponentModel.DataAnnotations.Schema;

namespace PMS.Models;

public class Project
{
    public long ProjectID { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required bool IsArchived { get; set; }
    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;


    /*
        The InverseProperty is explictly used to connect a Navigation property to its
        inverse in another entity referencing User.

        A Navigation Property does not actually exist in the database table
    */
    [InverseProperty("Project")]
    public List<ProjectSupervision> Supervisions = [];

    [InverseProperty("Project")]
    public List<ProjectTask> Tasks { get; set; } = [];
}