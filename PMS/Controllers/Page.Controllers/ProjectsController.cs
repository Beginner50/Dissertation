using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using PMS.Models;

namespace PMS.Controllers;

// This route attribute removes the 'page' prefix in the url to access the pages
[Route("")]
public class ProjectsController : Controller
{
    // The index view in the directory `Views/Projects/` maps to /projects
    [Route("/projects")]
    public IActionResult Index()
    {
        return View();
    }

    [Route("/privacy")]
    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    [Route("/error")]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
