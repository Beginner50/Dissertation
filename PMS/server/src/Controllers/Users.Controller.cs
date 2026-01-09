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
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await userService.GetAllUsers();
            return Ok(users);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/unsupervised")]
    [HttpGet]
    [Authorize(Roles = "supervisor")]
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

    /*
        When the server sends a Set-Cookie header in the response, the browser will then
        read that header and save the refresh token.
    */
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

    [Route("api/token/refresh")]
    [HttpPost]
    public async Task<IActionResult> RefreshAccessToken()
    {
        try
        {
            if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
                return BadRequest("Refresh token missing.");

            var newAccessToken = await userService.RefreshAccessToken(refreshToken);

            return Ok(new
            {
                Token = newAccessToken,
                TokenExpiry = DateTime.UtcNow.AddMinutes(1)
            });
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}/logout")]
    [HttpPost]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> Logout(
        [FromRoute] long userID
    )
    {
        try
        {
            await userService.Logout(userID);
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                Path = "/api/token/refresh"
            });
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}