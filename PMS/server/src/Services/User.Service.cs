using System.IdentityModel.Tokens.Jwt;
using System.Security.Authentication;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;

namespace PMS.Services;

public class UserService
{
    protected readonly PMSDbContext dbContext;
    protected readonly TokenService tokenService;
    protected readonly ILogger<UserService> logger;
    public UserService(PMSDbContext dbContext, TokenService tokenService, ILogger<UserService> logger)
    {
        this.dbContext = dbContext;
        this.tokenService = tokenService;
        this.logger = logger;
    }

    public async Task<IEnumerable<UserLookupDTO>> GetAllUsers()
    {
        return await dbContext.Users
                    .Where(u => u.Role != "admin" && u.IsDeleted == false)
                    .Select(u => new UserLookupDTO
                    {
                        UserID = u.UserID,
                        Name = u.Name,
                        Email = u.Email,
                        Role = u.Role
                    }).ToListAsync();
    }

    public async Task<IEnumerable<UserLookupDTO>> GetAllUnsupervisedStudents()
    {
        return await dbContext.Users.Where(
          u => u.ConductedProjects.All(p => p.Supervisor == null) &&
                u.Role == "student"
        )
        .Select(u => new UserLookupDTO
        {
            UserID = u.UserID,
            Name = u.Name,
            Email = u.Email,
            Role = u.Role
        })
        .ToListAsync();
    }

    public async Task<GetUserAuth> Login(string email, string password)
    {
        var user = await dbContext.Users
                         .Where(u => u.Email == email)
                         .FirstOrDefaultAsync()
                         ?? throw new AuthenticationException("Invalid Credentials");

        if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
            throw new AuthenticationException("Invalid Credentials!");

        var (accessToken, accessTokenExpiry) = tokenService.CreateAccessToken(user.UserID, user.Role);
        var (refreshToken, refreshTokenExpiry) = tokenService.CreateRefreshToken(user.UserID, user.Role);

        user.RefreshToken = refreshToken;
        await dbContext.SaveChangesAsync();

        return new GetUserAuth
        {
            User = new UserLookupDTO
            {
                UserID = user.UserID,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            },
            AccessToken = new TokenDTO
            {
                Payload = accessToken,
                Expiry = accessTokenExpiry
            },
            RefreshToken = new TokenDTO
            {
                Payload = refreshToken,
                Expiry = refreshTokenExpiry
            }
        };
    }

    public async Task<TokenDTO> RefreshAccessToken(JwtSecurityToken refreshToken, string refreshTokenPayload)
    {
        try
        {
            var userId = long.Parse(refreshToken.Subject);
            var user = await dbContext.Users
                            .Where(u => u.UserID == userId)
                            .FirstOrDefaultAsync()
                            ?? throw new UnauthorizedAccessException("User Not Found!");
            if (user.RefreshToken != refreshTokenPayload)
                throw new Exception("Invalid or revoked session");

            var (accessToken, accessTokenExpiry) = tokenService.CreateAccessToken(user.UserID, user.Role);

            return new TokenDTO
            {
                Payload = accessToken,
                Expiry = accessTokenExpiry
            };
        }
        catch (Exception)
        {
            throw new AuthenticationException("Unauthorized: Session expired.");
        }
    }

    public async Task Logout(long userId)
    {
        var user = await dbContext.Users.FindAsync(userId);
        if (user != null)
        {
            user.RefreshToken = null;
            await dbContext.SaveChangesAsync();

            logger.LogDebug("User {userID} logged out successfully!", user.UserID);
        }
    }
}