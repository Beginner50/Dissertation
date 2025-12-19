namespace PMS.Models;

public class Project
{
    public long ProjectID { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Status { get; set; }

    public long? StudentID { get; set; }
    public User? Student;

    public long? SupervisorID { get; set; }
    public User? Supervisor;
}