namespace PMS.DTOs;

public class GetUserAuth
{
    public UserLookupDTO User { get; set; }
    public TokenDTO AccessToken { get; set; }
    public TokenDTO RefreshToken { get; set; }
}