using System.ComponentModel.DataAnnotations;

namespace PMS.DTOs;

public class EditUserDTO
{
    public string? Name { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [RegularExpression("^(supervisor|student)$", ErrorMessage = "Role Not Valid: Role must be either 'supervisor' or 'student'")]
    public string? Role { get; set; }
    public bool? IsDeleted { get; set; }
}