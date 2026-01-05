using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace PMS.Lib;

public class TokenUtils
{
    private static SigningCredentials creds { get; set; }

    public static void Initialize(SymmetricSecurityKey key)
    {
        creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    public static string CreateAccessToken(long userId, string role)
    {
        return GenerateToken(userId, role, DateTime.UtcNow.AddMinutes(5));
    }

    public static string CreateRefreshToken(long userId, string role)
    {
        return GenerateToken(userId, role, DateTime.UtcNow.AddDays(14));
    }

    private static string GenerateToken(long userID, string role, DateTime expirationDate)
    {
        var claims = new List<Claim> {
            new Claim("sub", userID.ToString()),
            new Claim("role", role),
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: expirationDate,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static JwtSecurityToken? DecodeToken(string authHeader)
    {
        if (authHeader == "") return null;

        // Strips out "Bearer " prefix
        var token = authHeader.Substring(7).Trim();
        try
        {
            var handler = new JwtSecurityTokenHandler();

            if (handler.CanReadToken(token))
            {
                return handler.ReadJwtToken(token);
            }
        }
        catch { }
        return null;
    }
}