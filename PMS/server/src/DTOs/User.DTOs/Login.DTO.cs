using System.ComponentModel.DataAnnotations;

namespace PMS.DTOs;

public class LoginDTO
{
    [EmailAddress(ErrorMessage = "Invalid Email Address Format!")]
    public string Email { get; set; }
    public string Password { get; set; }
}