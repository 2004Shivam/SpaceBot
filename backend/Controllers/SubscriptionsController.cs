using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceBot.Api.Data;
using SpaceBot.Api.Models;

namespace SpaceBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<SubscriptionsController> _logger;

    public SubscriptionsController(AppDbContext db, ILogger<SubscriptionsController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet("{userId:int}")]
    public async Task<ActionResult<List<string>>> GetUserSubscriptions(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        var list = (user.SubscribedAgencies ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(a => a.Trim())
            .ToList();

        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<UserProfileDto>> UpdateSubscription([FromBody] UpdateSubscriptionRequest request)
    {
        var user = await _db.Users.FindAsync(request.UserId);
        if (user == null) return NotFound(new { message = "User not found." });

        user.SubscribedAgencies = string.Join(",", request.Agencies);
        user.WebPushEnabled = request.WebPushEnabled;
        if (!string.IsNullOrEmpty(request.PushEndpoint))
        {
            user.PushEndpoint = request.PushEndpoint;
        }

        user.LastActiveAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Updated agency subscriptions for user {Id}: {Agencies}", user.Id, user.SubscribedAgencies);

        return Ok(new UserProfileDto(
            user.Id,
            user.Email,
            user.Name,
            user.Picture,
            request.Agencies,
            user.WebPushEnabled
        ));
    }
}
