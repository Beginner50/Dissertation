using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace PMS.Services;

class TokenService
{
    private readonly SymmetricSecurityKey key;
    private readonly SigningCredentials creds;

    public TokenService()
    {
        key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YOUR_SUPER_SECRET_KEY_32_CHARS_LONG"));
        creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    public string CreateToken(int userId, string role)
    {
        /*
            The following defines the claims (contents of the JWT), which allows for
            1) Authenticating the user (userID) for each API request
            2) Authorization in the attribute [Authorize(Roles="Admin")] in controller methods
        */
        var claims = new List<Claim> {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        // Token is serialized
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}