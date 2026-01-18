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
    The .NET Core web application (generic host) lifecycle can be broadly divided into 
    three phases:

        1) Configuration Phase
           The application host being constructed has not yet been instantiated.

           In this phase, services are registered with the dependency injection container,
           which defines how these services (such as database contexts, authentication handlers,
           and custom services) are created and managed throughout the application's lifetime.

        2) Build Phase
           The application host has been instantiated but not yet started.

           In this phase, the middleware pipeline is configured. Middleware components are added
           to the pipeline to handle HTTP requests and responses. This includes setting up routing,
           authentication, authorization, and other middleware necessary for the application's 
           functionality.

        3) Execution Phase
           The application host is running and listens for incoming HTTP requests.
*/

/*------------------------------------ Configuration Phase --------------------------------------*/
var builder = WebApplication.CreateBuilder(args);

// Allow access to the HTTP context in services (request, response, headers, etc.)
builder.Services.AddHttpContextAccessor();

// Configure logging to output logs to the console
builder.Logging.AddConsole();

// Allow API endpoint testing via OpenAPI in development environment
builder.Services.AddOpenApi();

/*
CORS
    An origin is the combination of the protocol (http/https), domain (localhost, www.website.com)
    and port (3000, 5081)

    Browsers come with the SOP (Same-Origin Policy), which only allows a website to access
    resource from the server if they are from the same origin. This is to prevent websites
    from accessing resources from servers of other origins and thus maintain security.

    The way it works is that for unknown origins, the server responds without an
    `Access-Control-Allow-Origin` header. The browser blocks the unknown origin from reading
    the response.

    CORS (Cross Origin Resource Sharing) occurs when the browser allows a website to access a
    resource from another origin, provided that the origin (server) has given permission to
    the website's origin. The server can essentially instruct the browser to make an exception
    to its SOP rule for some origins.

Note:
    AllowCredentials
        AllowCredentials ensures the website can read and save cookies such as refreshTokens for 
        authentication. This ensures that when other unallowed origins call the refresh token
        endpoint, they will not be able to read and save the refresh token.

    CORS is not enough to prevent CSRF attacks. They only instruct the browser to block the
    website from reading the response of a request but not making the actual request itself.

    For example:
        A malicious origin may cause damage by sending a DELETE request on a resource without
        needing to read the response of the request.

        Curl can bypass CORS entirely since it does not enforce SOP.
*/
var allowedOrigins = new List<string> {
     "http://localhost:3000",
     "https://localhost:80",
     "https://website.com"
};
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

builder.Services.Configure<RouteOptions>(options =>
    options.LowercaseUrls = true);


// Create and initialize the symmetric security key for signing the JSON web token
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

builder.Services.AddDbContext<PMSDbContext>(); // Database Context Registration
builder.Services.AddControllers();


/*------------------------------------ Build Phase --------------------------------------*/

var app = builder.Build();

/*
Migrations:
    Broadly speaking, migrations act as a version control system for the database schema, 
    allowing the database schema over time without (potentially) losing existing data.

    The way it works is that it syncs the database schema with the current model definition 
    generated from running the `dotnet ef migrations add <MigrationName>` command, from the
    DbContext and entity classes in the Models directory.

Scope:
    Since services registered within the Dependency Injection container has a lifetime and is
    normally used within the scope of an HTTP request, and since the application has not yet
    started handling requests, a scope needs to be created manually to obtain the required
    services from the service provider (DbContext).

    The following code then applies any pending migrations for the context to the database/
    syncs the database schema with the current model definition automatically.
*/
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<PMSDbContext>();
    await context.Database.MigrateAsync();
}

/*
    The HTTP request pipeline is as follows:

          HTTP Request
               |
            Routing
               |
              CORS
               |
         Authentication
               |
          Authorization
               |
        ----------------
        |              |
     OpenAPI     HTTPS Redirection 
  (API Reference)      |
        |              |
        ----------------
               |
          Controllers
               |
          HTTP Response
*/
app.UseRouting();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
else
{
    // HTTPs disabled for now
    // app.UseHttpsRedirection();
}

app.MapControllers();


/*------------------------------------ Execution Phase --------------------------------------*/

app.Run();