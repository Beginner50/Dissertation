using System.IdentityModel.Tokens.Jwt;
using System.Security.Authentication;
using Microsoft.EntityFrameworkCore;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Models;

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
                    .Where(u => u.Role != "admin")
                    .Select(u => new UserLookupDTO
                    {
                        UserID = u.UserID,
                        Name = u.Name,
                        Email = u.Email,
                        Role = u.Role,
                        IsDeleted = u.IsDeleted
                    }).ToListAsync();
    }

    public async Task CreateUser(string name, string email, string password, string role)
    {
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var existingUser = await dbContext.Users.Where(
            u => u.Email == email && !u.IsDeleted
        ).FirstOrDefaultAsync();
        if (existingUser != null)
            throw new UnauthorizedAccessException("Email Already In Use!");

        var newUser = new User
        {
            Name = name,
            Email = email,
            Password = hashedPassword,
            Role = role,
        };

        await dbContext.AddAsync(newUser);
        await dbContext.SaveChangesAsync();
    }

    public async Task EditUser(
        long userID, string? name, string? email, string? role
    )
    {
        var user = await dbContext.Users.Where(u => u.UserID == userID && !u.IsDeleted)
                                        .FirstOrDefaultAsync()
                                        ?? throw new UnauthorizedAccessException("User Not Found!");

        user.Name = name ?? user.Name;
        if (email != null && email != user.Email)
        {
            var existingUser = await dbContext.Users.Where(u => u.Email == email
                                    && !u.IsDeleted
                                ).FirstOrDefaultAsync();
            if (existingUser != null)
                throw new UnauthorizedAccessException("Email Already In Use!");
        }
        user.Email = email ?? user.Email;
        user.Role = role ?? user.Role;

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteUser(long userID)
    {
        var user = await dbContext.Users.Where(u => u.UserID == userID && !u.IsDeleted)
                                        .Include(u => u.SupervisedProjects)
                                        .Include(u => u.ConductedProjects)
                                        .FirstOrDefaultAsync()
                                        ?? throw new UnauthorizedAccessException("User Not Found!");

        user.IsDeleted = true;

        foreach (var project in user.SupervisedProjects)
            project.Status = "archived";
        foreach (var project in user.ConductedProjects)
            project.Status = "archived";

        await dbContext.SaveChangesAsync();
        await Logout(user.UserID);
    }

    public async Task<GetUserAuth> Login(string email, string password)
    {
        var user = await dbContext.Users
                         .Where(u => u.Email == email && !u.IsDeleted)
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
                            .Where(u => u.UserID == userId && !u.IsDeleted)
                            .FirstOrDefaultAsync()
                            ?? throw new UnauthorizedAccessException("User Not Found!");
            if (user.RefreshToken != refreshTokenPayload)
                throw new Exception("Invalid or Revoked Session!");

            var (accessToken, accessTokenExpiry) = tokenService.CreateAccessToken(user.UserID, user.Role);

            return new TokenDTO
            {
                Payload = accessToken,
                Expiry = accessTokenExpiry
            };
        }
        catch (Exception)
        {
            throw new AuthenticationException("Session Expired!");
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