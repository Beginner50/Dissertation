namespace PMS.DTOs;

public class EditUserDTO
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public bool? IsDeleted { get; set; }
}