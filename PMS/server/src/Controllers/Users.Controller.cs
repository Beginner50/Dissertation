using Microsoft.AspNetCore.Mvc;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class UsersController : ControllerBase
{
    protected readonly UserService userService;
    public UsersController(UserService userService)
    {
        this.userService = userService;
    }

    [Route("/api/users")]
    [HttpGet]
    public async Task<IActionResult> GetUnsupervisedStudents()
    {
        try
        {
            var unsupervisedStudents = await userService.GetAllUnsupervisedStudents();
            return Ok(unsupervisedStudents);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }
}