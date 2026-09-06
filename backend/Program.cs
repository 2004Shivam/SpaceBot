using Microsoft.EntityFrameworkCore;
using SpaceBot.Api.Data;
using SpaceBot.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQLite Database
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                           ?? "Data Source=spacebot.db";
    options.UseSqlite(connectionString);
});

// Configure HTTP client & Space API sync service
builder.Services.AddHttpClient<SpaceApiService>();

// Configure CORS — strict in local dev, permissive in production (Render / Koyeb unified host)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Dev: only allow Vite dev server origins
            policy.WithOrigins(
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:3000"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            // Production: same domain (ASP.NET serves the frontend SPA),
            // but allow any origin so Render health checks & CDN proxies work
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

var app = builder.Build();

// Auto-create database & apply seed data on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
