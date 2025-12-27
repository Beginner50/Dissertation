using PMS.Models;

namespace PMS.DTOs;

public class GetProjectDTO
{
    public long ProjectID { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Status { get; set; }
    public UserLookupDTO? Supervisor { get; set; }
    public UserLookupDTO? Student { get; set; }

}