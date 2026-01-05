using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using PMS.DatabaseContext;
using PMS.Services;
using Google.GenAI;
using PMS.Lib;
using Microsoft.AspNetCore.Authorization;

/*
    The web application lifecycle is divived into 3 distinct phases:
    1) Builder Phase
       The web application has not yet been built/instantiated yet.

       In this phase, services are registered.

    2) Instantiated Phase

    3) Running Phase
       The web application now listens and serves HTTP requests.

       The request pipeline is configured in this phase.
*/

/*------------------------------------ Builder Phase --------------------------------------*/
var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsole();

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});
builder.Services.AddHttpContextAccessor();
builder.Services.Configure<RouteOptions>(options =>
    options.LowercaseUrls = true);

var symmetricKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(builder.Configuration["JWT_SECRET_KEY"]
    ?? "SECRET_KEY_HERE_32_CHARACTERS"
    )
);
TokenUtils.Initialize(symmetricKey);

/*
Instructs the web application to extract the JWT from the bearer header of the
HTTP request and then based on the configurations given, it performs the following:

    1) It will first re-calculate the signature of the JWT using the symmetric key and compare
       it with the signature in the JWT to ensure authenticity and data integrity.

    2) It will then verify the expiry time with the current time and determine whether the
       token is expired or not


Note: 
    Clock Skew
        Clock skew simply gives a grace period to the expiry time.

        For example, if a JWT expires at 09 00 and the current time is 09 01 but the
        clock skew is 2 minutes, then the token will not be considered as expired yet

    MapInboundClaims = false
        MapInboundClaims = false is to prevent .NET from mapping/renaming JWT claims
        (sub, role) into deprecated SOAP XML standards.
    
    ValidateIssuer + ValidateAudience
        .NET automatically sets these to true even though these claims are not being used
        in the application. 

        However, when deploying the web application, it is important to set the issuer claim
        in the JWT and set ValidateIssuer to true, since issuer claim identifies the website
        from which the token originates from.
*/
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            NameClaimType = "sub",
            RoleClaimType = "role",
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = symmetricKey,
            ValidateLifetime = true,
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

/*
Based on the official documentation page:
    https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-10.0

    In .NET, authorization is handled by authorization policies; a policy contains one or
    more requirements that must be met in order for a request to be authorized.

    Authorization is normally configured with default policies such as standard role based
    access control (RBAC). However, in the context of developing REST APIs, we also need to
    account for resource ownership, where if a resource belongs to a user, they are allowed to
    act on it.

    This necessitates a custom policy which implements Ownership Authorization alongside RBAC,
    ensuring that users (except admins) cannot make requests on behalf of other users while
    having maximum clearance on their owned resource.
    
    To denote resource ownership for a user, the REST API for accessing the resource follows a
    hierarchical path: /api/users/{userID}/resource.

    In order to prevent a user from accessing resources of other users without sufficient
    permissions (being an admin), a policy with a custom authorization requirement is defined
    to ensure that the userID parameter in the API url matches the subject (userID) of the
    token in the authorization header of ther request for the request to be authorized.

    Example:
        User with userID = 1 cannot successfully invoke POST /api/users/2/resource since the
        userIDs do not match.
*/
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OwnershipRBAC", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.AddRequirements(new OwnershipRBACRequirement());
    });
});

/*
AddScoped:
    AddScoped method is used to register a Service with a scoped lifetime in the
    dependency injection container (a single instance is created for each client
    request/scope and is re-used throughout the specific request's lifetime)

    To ensure efficient resource utilization, the service instance is created only
    when required by a controller that handles the HTTP request.

AddSingleton:
    AddSingleton creates the instance for every client requests.
    The reason why services utilizing the database context cannot use AddSingleton is
    because they are not thread safe.

    For example, if database context were to be a singleton, then all users might try to use
    the same database connection at the same time, leading to race conditions and crashes.
*/
builder.Services.AddSingleton<IAuthorizationHandler, OwnershipRBACHandler>();
builder.Services.AddSingleton<Client>(); // Gemini client
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<ProjectTaskService>();
builder.Services.AddScoped<TaskDeliverableService>();
builder.Services.AddScoped<FeedbackService>();
builder.Services.AddScoped<MeetingService>();
builder.Services.AddScoped<ReminderService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<ProgressLogService>();

builder.Services.AddDbContext<PMSDbContext>(); // Database Context Registration
builder.Services.AddControllers();

var app = builder.Build();

// --- 2. DATABASE INITIALIZATION ---

// Apply migrations automatically on startup
// Using MigrateAsync ensures the DB is created and seeded before the app starts
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<PMSDbContext>();
    await context.Database.MigrateAsync();
}

// --- 3. MIDDLEWARE PIPELINE (ORDER MATTERS) ---

app.UseRouting();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// API endpoint Testing
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
else
{
    app.UseHttpsRedirection();
}

app.MapControllers();

app.Run();