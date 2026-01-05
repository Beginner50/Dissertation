using System.IdentityModel.Tokens.Jwt;
using System.Security.Authentication;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Lib;

namespace PMS.Services;

public class UserService
{
    protected readonly PMSDbContext dbContext;
    protected readonly ILogger<UserService> logger;
    public UserService(PMSDbContext dbContext, ILogger<UserService> logger)
    {
        this.dbContext = dbContext;
        this.logger = logger;
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

        var accessToken = TokenUtils.CreateAccessToken(user.UserID, user.Role);
        var refreshToken = TokenUtils.CreateRefreshToken(user.UserID, user.Role);

        user.RefreshToken = refreshToken;
        await dbContext.SaveChangesAsync();

        logger.LogDebug("User {userID} logged in successfully!", user.UserID);

        return new GetUserAuth
        {
            User = new UserLookupDTO
            {
                UserID = user.UserID,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            },
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }

    public async Task<string> RefreshAccessToken(string refreshToken)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(refreshToken);
            if (jwt.ValidTo < DateTime.UtcNow)
                throw new Exception("Token expired");


            var userId = long.Parse(jwt.Subject);
            var user = await dbContext.Users
                            .Where(u => u.UserID == userId)
                            .FirstOrDefaultAsync()
                            ?? throw new UnauthorizedAccessException("User Not Found!");
            if (user.RefreshToken != refreshToken)
                throw new Exception("Invalid or revoked session");

            return TokenUtils.CreateAccessToken(user.UserID, user.Role);
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

            logger.LogDebug("User {userID} logged in successfully!", user.UserID);
        }
    }
}