using System.ComponentModel.DataAnnotations.Schema;
using PMS.Models;

public class ProjectAssignment
{
    [ForeignKey("SupervisorID")]
    public long SupervisorID { get; set; }
    public User? Supervisor { get; set; }

    [ForeignKey("StudentID")]
    public long StudentID { get; set; }
    public User? Student { get; set; }

    [ForeignKey("ProjectID")]
    public long ProjectID { get; set; }
    public Project? Project { get; set; }

}