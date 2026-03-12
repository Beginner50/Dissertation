using System.ComponentModel.DataAnnotations;

namespace PMS.DTOs;

public class EditUserDTO
{
    public string? Name { get; set; }

    [EmailAddress(ErrorMessage = "Invalid Email Address Format!")]
    public string? Email { get; set; }

    [RegularExpression("^(supervisor|student)$", ErrorMessage = "Role must be either 'supervisor' or 'student'")]
    public string? Role { get; set; }
    public bool? IsDeleted { get; set; }
}