namespace PMS.DTOs;

public class TokenDTO
{
    public required string Payload { get; set; }
    public DateTime Expiry { get; set; }
}