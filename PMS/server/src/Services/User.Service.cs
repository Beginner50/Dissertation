using System.IdentityModel.Tokens.Jwt;
using System.Linq.Expressions;
using System.Security.Authentication;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using PMS.DatabaseContext;
using PMS.DTOs;
using PMS.Lib;
using PMS.Models;

namespace PMS.Services;

public static class UserQueryExtensions
{
    public static IQueryable<User> NotDeleted(this IQueryable<User> query)
    {
        return query.Where(u => !u.IsDeleted);
    }
}

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

    public async Task<T> GetUser<T>(
        long userID,
        Expression<Func<User, T>> selector,
        Func<IQueryable<User>, IQueryable<User>>? queryExtension = null
    )
    {
        IQueryable<User> query = dbContext.Users
                                    .NotDeleted();
        query = queryExtension?.Invoke(query) ?? query;

        return await query.Where(u => u.UserID == userID)
                          .Select(selector)
                          .FirstOrDefaultAsync()
                          ?? throw new UnauthorizedAccessException("User Not Found!");
    }

    public async Task<T?> GetUserByEmail<T>(
        string email,
        Expression<Func<User, T>> selector,
        Func<IQueryable<User>, IQueryable<User>>? queryExtension = null
    )
    {
        IQueryable<User> query = dbContext.Users
                                    .NotDeleted();
        query = queryExtension?.Invoke(query) ?? query;

        return await query.Where(u => u.Email == email)
                          .Select(selector)
                          .FirstOrDefaultAsync();
    }

    public async Task<(IEnumerable<T> users, long count)>
         GetAllUsersWithCount<T>(
            Expression<Func<User, T>> selector,
            Func<IQueryable<User>, IQueryable<User>>? queryExtension = null,
            long limit = 5,
            long offset = 0
         )
    {
        IQueryable<User> usersQuery = dbContext.Users
                    .Where(u => u.Role != "admin");
        usersQuery = queryExtension?.Invoke(usersQuery) ?? usersQuery;

        var count = await usersQuery.LongCountAsync();

        var users = await usersQuery
                        .Select(selector)
                        .Skip((int)offset)
                        .Take((int)limit)
                        .ToListAsync();

        return (users, count);
    }

    public async Task<IEnumerable<User>> GetUsersByIds(List<long> userIDs)
    {
        return await dbContext.Users.Where(u => userIDs.Contains(u.UserID))
                    .ToListAsync();
    }

    public async Task CreateUser(string name, string email, string password, string role)
    {
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var existingUser = await GetUserByEmail(email, selector: u => u);
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
        var user = await dbContext.Users.Where(u => u.UserID == userID)
                                        .NotDeleted()
                                        .FirstOrDefaultAsync()
                                        ?? throw new UnauthorizedAccessException("User Not Found!");

        user.Name = name ?? user.Name;

        if (email != null && email != user.Email)
        {
            var existingUser = await GetUserByEmail(email, selector: u => u);
            if (existingUser != null)
                throw new UnauthorizedAccessException("Email Already In Use!");
            user.Email = email ?? user.Email;
        }

        if (role != null && role != user.Role)
        {
            var existingProjectAssignment = await dbContext.ProjectAssignment.ContainsMember(userID).AnyAsync();
            if (existingProjectAssignment)
                throw new Exception("Cannot Change Role: User Already Assigned To A Project!");
            user.Role = role ?? user.Role;
        }

        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteUser(long userID)
    {
        using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {

                var user = await GetUser(
                    userID,
                    selector: u => u
                );
                var userProjects = await dbContext.ProjectAssignment
                                        .ContainsMember(user.UserID)
                                        .Select(ps => ps.Project!)
                                        .Distinct()
                                        .ToListAsync();
                var userMeetings = await dbContext.Meetings
                                        .IsParticipant(user.UserID)
                                        .ToListAsync();

                user.IsDeleted = true;
                foreach (var project in userProjects)
                    project.IsArchived = true;
                dbContext.Meetings.RemoveRange(userMeetings);

                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                await Logout(user.UserID);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public async Task<GetUserAuth> Login(string email, string password)
    {
        var user = await GetUserByEmail(email, selector: u => u)
                    ?? throw new AuthenticationException("Invalid User Details!");

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
            var userID = long.Parse(refreshToken.Subject);
            var user = await GetUser(userID, selector: u => u);

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

    public async Task Logout(long userID)
    {
        var user = await dbContext.Users.FindAsync(userID);
        if (user != null)
        {
            user.RefreshToken = null;
            await dbContext.SaveChangesAsync();

            logger.LogDebug("User {userID} logged out successfully!", user.UserID);
        }
    }
}