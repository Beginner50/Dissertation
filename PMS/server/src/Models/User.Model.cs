namespace PMS.Models;

public class User
{
    public long UserID { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string Role { get; set; }
    public bool IsDeleted { get; set; }

    public List<Project> Projects { get; set; } = [];
}