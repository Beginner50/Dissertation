using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.DTOs;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class UsersController : ControllerBase
{
    protected readonly UserService userService;
    private readonly IWebHostEnvironment environment;
    public UsersController(UserService userService, IWebHostEnvironment environment)
    {
        this.userService = userService;
        this.environment = environment;
    }

    [Route("api/users")]
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

    [Route("api/users/login")]
    [HttpPost]
    public async Task<IActionResult> Login(
        [FromBody] LoginDTO loginDTO
    )
    {
        try
        {
            var userAuth = await userService.Login(loginDTO.Email, loginDTO.Password);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = environment.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(14),
                Path = "/api/token/refresh"
            };

            Response.Cookies.Append("refreshToken", userAuth.RefreshToken, cookieOptions);
            return Ok(new
            {
                User = userAuth.User,
                Token = userAuth.AccessToken,
                TokenExpiry = DateTime.UtcNow.AddMinutes(5)
            });
        }
        catch (Exception e)
        {
            return Unauthorized(e.Message);
        }
    }

    [Route("api/users/{userID}/token/refresh")]
    [HttpPost]
    public async Task<IActionResult> RefreshAccessToken()
    {
        try
        {
            if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
                return Unauthorized("Refresh token missing.");

            var newAccessToken = await userService.RefreshAccessToken(refreshToken);

            return Ok(new
            {
                Token = newAccessToken,
                TokenExpiry = DateTime.UtcNow.AddMinutes(5)
            });
        }
        catch (Exception e)
        {
            return Unauthorized(e.Message);
        }
    }

    [Route("api/users/{userID}/logout")]
    [HttpPost]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> Logout()
    {
        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            Path = "/api/token/refresh"
        });
        return NoContent();
    }
}