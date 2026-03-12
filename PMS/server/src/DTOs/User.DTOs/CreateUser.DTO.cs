using System.ComponentModel.DataAnnotations;

namespace PMS.DTOs;

public class CreateUserDTO
{
    public required string Name { get; set; }

    [EmailAddress(ErrorMessage = "Invalid Email Address Format!")]
    public required string Email { get; set; }

    [RegularExpression("^(supervisor|student)$", ErrorMessage = "Role must be either 'supervisor' or 'student'")]
    public required string Role { get; set; }
    public required string Password { get; set; }
}