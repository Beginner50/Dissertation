using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.DatabaseContext;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class ReminderController : ControllerBase
{
    protected readonly ReminderService reminderService;
    public ReminderController(ReminderService reminderService)
    {
        this.reminderService = reminderService;
    }

    [Route("api/users/{userID}/reminders")]
    [Authorize(Policy = "OwnershipRBAC")]
    public async Task<IActionResult> GetReminders(
        [FromRoute] long userID
    )
    {
        try
        {
            var reminders = await reminderService.GetAllReminders(userID);
            return Ok(reminders);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }
}