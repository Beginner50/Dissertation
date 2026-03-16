namespace PMS.DTOs;

public class GetUserAuth
{
    public required UserLookupDTO User { get; set; }
    public required TokenDTO AccessToken { get; set; }
    public required TokenDTO RefreshToken { get; set; }
}