using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceBot.Api.Data;
using SpaceBot.Api.Models;
using SpaceBot.Api.Services;

namespace SpaceBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LaunchesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SpaceApiService _spaceService;
    private readonly ILogger<LaunchesController> _logger;

    public LaunchesController(AppDbContext db, SpaceApiService spaceService, ILogger<LaunchesController> logger)
    {
        _db = db;
        _spaceService = spaceService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Launch>>> GetLaunches(
        [FromQuery] string? provider = null,
        [FromQuery] string? status = null)
    {
        var query = _db.Launches.AsQueryable();

        if (!string.IsNullOrWhiteSpace(provider) && provider != "ALL")
        {
            query = query.Where(l => EF.Functions.Like(l.LaunchProvider, $"%{provider}%"));
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "ALL")
        {
            query = query.Where(l => EF.Functions.Like(l.Status, $"%{status}%"));
        }

        var results = await query
            .OrderBy(l => l.LaunchWindowStart)
            .ToListAsync();

        return Ok(results);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Launch>> GetLaunchById(int id)
    {
        var launch = await _db.Launches.FindAsync(id);
        if (launch == null) return NotFound(new { message = $"Launch with ID {id} not found." });
        return Ok(launch);
    }

    [HttpPost("sync")]
    public async Task<ActionResult> SyncLaunches()
    {
        _logger.LogInformation("Triggering manual Space API sync...");
        var synced = await _spaceService.SyncUpcomingLaunchesAsync();
        return Ok(new { message = "Sync completed successfully.", count = synced });
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<SystemMetricsDto>> GetMetrics()
    {
        var total = await _db.Launches.CountAsync();
        var nextLaunch = await _db.Launches
            .Where(l => l.LaunchWindowStart >= DateTime.UtcNow)
            .OrderBy(l => l.LaunchWindowStart)
            .FirstOrDefaultAsync();

        var alertsCount = await _db.Alerts.CountAsync();
        var distinctAgencies = await _db.Launches.Select(l => l.LaunchProvider).Distinct().CountAsync();

        var metrics = new SystemMetricsDto(
            TotalTracked: total,
            NextLaunchWindow: nextLaunch?.LaunchWindowStart,
            NextLaunchName: nextLaunch != null ? $"{nextLaunch.RocketName} | {nextLaunch.Name}" : null,
            TotalAlertsSent: alertsCount,
            ActiveAgencies: distinctAgencies
        );

        return Ok(metrics);
    }
}
