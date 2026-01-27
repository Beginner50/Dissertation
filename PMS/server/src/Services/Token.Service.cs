using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace PMS.Services;

public class TokenService
{
    private SigningCredentials creds { get; set; }

    /*
        More information on: https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.hmacsha256?view=net-10.0

        HMAC SHA256 is a keyed hash algorithm that is constructed from the SHA256 hash function
        and a secret cryptographic key. 

        The HMAC process mixes the secret key with the message data, hashes the result using
        SHA256, and then combines it with the key again before hashing it a second time.
        This double hashing process enhances security by making it more resistant to
        certain types of cryptographic attacks
        
        The resulting hash value is unique to both the input data and the secret key,
        ensuring data integrity and authenticity.
    */
    public TokenService(SymmetricSecurityKey key)
    {
        creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }
    private string GenerateToken(long userID, string role, DateTime expirationDate)
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

    public string CreateAccessToken(long userId, string role)
    {
        return GenerateToken(userId, role, DateTime.UtcNow.AddMinutes(5));
    }

    public string CreateRefreshToken(long userId, string role)
    {
        return GenerateToken(userId, role, DateTime.UtcNow.AddDays(14));
    }

    public JwtSecurityToken ExtractClaims(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        return jwtToken;
    }
}