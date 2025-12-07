using Microsoft.AspNetCore.Mvc;

namespace PMS.Controllers;

[Route("")]
public class HomeController : Controller
{
    [Route("")]
    public IActionResult Index()
    {
        // Target Controller is ProjectsController and action is Index
        return RedirectToAction("Index", "Projects");
    }
}