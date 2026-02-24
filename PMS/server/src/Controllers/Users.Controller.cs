using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.DTOs;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class UsersController : ControllerBase
{
    private readonly TokenService tokenService;
    private readonly UserService userService;
    private readonly ReportService reportService;
    private readonly IWebHostEnvironment environment;
    public UsersController(UserService userService, TokenService tokenService, ReportService reportService, IWebHostEnvironment environment)
    {
        this.tokenService = tokenService;
        this.userService = userService;
        this.reportService = reportService;
        this.environment = environment;
    }

    [Route("api/users")]
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] long limit = 5,
        [FromQuery] long offset = 0
    )
    {
        try
        {
            var (users, count) = await userService.GetAllUsersWithCount(
                selector: u => new UserLookupDTO
                {
                    UserID = u.UserID,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role,
                    IsDeleted = u.IsDeleted
                },
                limit: limit,
                offset: offset
            );
            return Ok(new
            {
                Items = users,
                TotalCount = count
            });
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }


    [Route("api/users")]
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> CreateUser(CreateUserDTO dto)
    {
        try
        {
            await userService.CreateUser(
                name: dto.Name,
                email: dto.Email,
                password: dto.Password,
                role: dto.Role
            );
            return NoContent();
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}")]
    [HttpPut]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> EditUser(long userID, EditUserDTO dto)
    {
        try
        {
            await userService.EditUser(userID,
                name: dto.Name,
                email: dto.Email,
                role: dto.Role
            );
            return NoContent();
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/{userID}")]
    [HttpDelete]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteUser(long userID)
    {
        try
        {
            await userService.DeleteUser(userID);
            return NoContent();
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    [Route("api/users/ingest-list")]
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> IngestUserList([FromBody] FileDTO dto)
    {
        try
        {
            await reportService.IngestUserList(dto.Filename, dto.File, dto.ContentType);
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
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
                Secure = !environment.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(14),
                Path = "/api/users/token"
            };

            Response.Cookies.Append("refreshToken", userAuth.RefreshToken.Payload, cookieOptions);
            return Ok(new
            {
                User = userAuth.User,
                Token = userAuth.AccessToken.Payload,
                TokenExpiry = userAuth.AccessToken.Expiry
            });
        }
        catch (Exception e)
        {
            return Unauthorized(e.Message);
        }
    }

    [Route("api/users/token/refresh")]
    [HttpPost]
    public async Task<IActionResult> RefreshAccessToken()
    {
        try
        {
            if (!Request.Cookies.TryGetValue("refreshToken", out var refreshTokenPayload))
                return BadRequest("Refresh token missing.");

            var refreshToken = tokenService.DecodeAndValidateToken(refreshTokenPayload);
            var accessToken = await userService.RefreshAccessToken(refreshToken, refreshTokenPayload);

            return Ok(new
            {
                Token = accessToken.Payload,
                TokenExpiry = accessToken.Expiry
            });
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }

    /*
        When logging out, the server will delete the refresh token cookie 
        and invalidate the refresh token on the server side.
    */
    [Route("api/users/token/logout")]
    [HttpPost]
    public async Task<IActionResult> Logout()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshTokenPayload))
            return NoContent();

        var refreshToken = tokenService.DecodeAndValidateToken(refreshTokenPayload);
        try
        {
            await userService.Logout(long.Parse(refreshToken.Subject));
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                Path = "/api/users/token"
            });
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}