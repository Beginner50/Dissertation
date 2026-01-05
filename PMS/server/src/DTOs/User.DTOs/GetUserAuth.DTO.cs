namespace PMS.DTOs;

public class GetUserAuth
{
    public UserLookupDTO User { get; set; }
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
}