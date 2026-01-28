using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PMS.Services;

namespace PMS.Controllers;

[ApiController]
public class NotificationsController : ControllerBase
{
    protected readonly NotificationService notificationService;
    public NotificationsController(NotificationService notificationService)
    {
        this.notificationService = notificationService;
    }

    [Route("api/users/{userID}/notifications")]
    [HttpGet]
    [Authorize(Policy = "Ownership")]
    public async Task<IActionResult> GetAllNotifications(
        [FromRoute] long userID
    )
    {
        try
        {
            var notifications = await notificationService.GetAllNotifications(userID);
            return Ok(notifications);
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }
}