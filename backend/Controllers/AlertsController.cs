using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceBot.Api.Data;
using SpaceBot.Api.Models;

namespace SpaceBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<AlertsController> _logger;

    public AlertsController(AppDbContext db, ILogger<AlertsController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AlertLog>>> GetAlerts()
    {
        var logs = await _db.Alerts
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(logs);
    }

    [HttpPost("publish")]
    public async Task<ActionResult<AlertLog>> PublishAlert([FromBody] PublishAlertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TweetText))
        {
            return BadRequest(new { message = "Tweet text cannot be empty." });
        }

        if (request.TweetText.Length > 280)
        {
            return BadRequest(new { message = $"Tweet exceeds X 280 character limit (current: {request.TweetText.Length})." });
        }

        var launch = await _db.Launches.FindAsync(request.LaunchId);
        if (launch == null)
        {
            return NotFound(new { message = $"Launch with ID {request.LaunchId} not found." });
        }

        // Create audit record in SQL DB
        var alertLog = new AlertLog
        {
            LaunchId = launch.Id,
            LaunchName = launch.Name,
            TweetText = request.TweetText,
            Status = "Published",
            Platform = "X",
            CreatedAt = DateTime.UtcNow
        };

        _db.Alerts.Add(alertLog);

        if (request.MarkAsSent)
        {
            launch.HasAlertSent = true;
            launch.LastAlertSentAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        _logger.LogInformation("Launch alert published and logged for mission {Name} (ID {Id})", launch.Name, launch.Id);

        return CreatedAtAction(nameof(GetAlerts), new { id = alertLog.Id }, alertLog);
    }
}
