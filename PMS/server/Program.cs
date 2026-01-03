using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using PMS.DatabaseContext;
using PMS.Services;
using Google.GenAI;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsole();

// --- 1. SERVICE REGISTRATION ---

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

builder.Services.Configure<RouteOptions>(options =>
    options.LowercaseUrls = true);



/*
Instructs the web application to extract the JWT from the bearer header of the
HTTP request and then based on the configurations given, it performs the following:

    1) It will first re-calculate the signature of the JWT using the symmetric key and compare
       it with the signature in the JWT to ensure authenticity and data integrity.


    2) It will then verify the expiry time with the current time and determine whether the
       token is expired or not


Note: Clock skew simply gives a grace period to the expiry time.

    For example, if a JWT expires at 09 00 and the current time is 09 01 but the
    clock skew is 2 minutes, then the token will not be considered as expired yet
*/
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            // Ensure this key matches your environment/secret settings
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YOUR_VERY_SECRET_KEY_32_CHARS_LONG")),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();


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
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<ProjectTaskService>();
builder.Services.AddScoped<TaskDeliverableService>();
builder.Services.AddScoped<FeedbackService>();
builder.Services.AddScoped<MeetingService>();
builder.Services.AddScoped<ReminderService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<ProgressLogService>();
builder.Services.AddSingleton<TokenService>();

// Add the Google AI Sdk Gemini Client 
builder.Services.AddSingleton<Client>();

// Database Context Registration
builder.Services.AddDbContext<PMSDbContext>();

builder.Services.AddControllers();

var app = builder.Build();

// --- 2. DATABASE INITIALIZATION ---

// Apply migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<PMSDbContext>();
        // Using MigrateAsync ensures the DB is created and seeded before the app starts
        await context.Database.MigrateAsync();
        Console.WriteLine("Database migration and seeding completed successfully.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

// --- 3. MIDDLEWARE PIPELINE (ORDER MATTERS) ---

app.UseRouting();
app.UseCors();

// Authentication before Authorization
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