using System.IdentityModel.Tokens.Jwt;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace PMS.Lib;

/*
    Authorization in .NET is determined primarily by the IAuthorizationService. Instead of
    harcoding authorization rules, .NET defines policies, which are expressions that are
    evaluated dynamically instead.

    A policy can be thought to consist of 2 components:
    1) Requirement
       This is a blueprint that represents a security criteria. It mainly serves as a
       mechanism for tracking whether the authorization is successful.

       Example: MinimumAgeRequirement(21) from the .NET documentation page below
    
    2) Requirement Handler
       Based on a given policy requirement(s), the authorization service invokes the handler
       to run the authorization logic, checking if the requirement(s) is/are met.

       To mark the outcome of the authorization on the requirement, the AuthorizationHandlerContext
       class is used, and calls `context.Succeed(requirement)` upon success.

       Note that in the custom requirement validation logic, we don't check the validity of the
       token since authorization occurs after authentication.

    More information on custom policies:
    https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-10.0
*/
public class OwnershipRBACRequirement : IAuthorizationRequirement;

public class OwnershipRBACHandler : AuthorizationHandler<OwnershipRBACRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly ILogger<OwnershipRBACHandler> logger;
    public OwnershipRBACHandler(IHttpContextAccessor httpContextAccessor, ILogger<OwnershipRBACHandler> logger)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.logger = logger;
    }
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OwnershipRBACRequirement requirement)
    {
        var httpContext = httpContextAccessor.HttpContext;

        var routeUserID = httpContext.GetRouteValue("userID")?.ToString();
        var tokenUserID = context.User.FindFirst("sub")?.Value;
        var role = context.User.FindFirst("role")?.Value;


        if ((!string.IsNullOrEmpty(routeUserID) && tokenUserID == routeUserID) || role == "admin")
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}