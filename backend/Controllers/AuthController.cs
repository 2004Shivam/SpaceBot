using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceBot.Api.Data;
using SpaceBot.Api.Models;

namespace SpaceBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext db, IConfiguration config, ILogger<AuthController> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Real Google OAuth: verifies the ID token cryptographically using Google's public keys.
    /// The frontend (@react-oauth/google) sends the credential (signed JWT) from Google after
    /// the user completes the Google sign-in popup. We validate it server-side — unforgeable.
    /// </summary>
    [HttpPost("google")]
    public async Task<ActionResult<UserProfileDto>> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Credential))
        {
            return BadRequest(new { message = "Google credential token is required." });
        }

        // ── Real Google token verification ─────────────────────────────────────
        // GoogleJsonWebSignature.ValidateAsync calls Google's public key endpoint,
        // verifies the JWT signature, checks expiry, and validates the audience (our Client ID).
        // This is cryptographically secure — a forged token will throw an exception.
        GoogleJsonWebSignature.Payload payload;
        try
        {
            var clientId = _config["Google:ClientId"];

            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                // Audience must match our Client ID so tokens issued for other apps are rejected
                Audience = string.IsNullOrEmpty(clientId)
                    ? null                          // dev fallback: skip audience check if not configured
                    : new[] { clientId }
            };

            payload = await GoogleJsonWebSignature.ValidateAsync(request.Credential, settings);
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning("Invalid Google JWT token: {Message}", ex.Message);
            return Unauthorized(new { message = "Google token verification failed. Please sign in again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during Google token validation.");
            return StatusCode(500, new { message = "Authentication service error. Please try again." });
        }

        // ── Extract verified claims from Google's validated payload ────────────
        var email   = payload.Email;
        var name    = payload.Name ?? payload.Email;
        var picture = payload.Picture;
        var googleId = payload.Subject; // Google's stable unique user ID ("sub" claim)

        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "No email address found in Google account." });
        }

        // ── Upsert user in database ────────────────────────────────────────────
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        if (user == null)
        {
            // New user — create with defaults
            user = new User
            {
                Email = email,
                Name = name,
                GoogleId = googleId,
                Picture = picture,
                SubscribedAgencies = "SpaceX,NASA,ISRO",
                WebPushEnabled = true,
                CreatedAt = DateTime.UtcNow,
                LastActiveAt = DateTime.UtcNow
            };
            _db.Users.Add(user);
            _logger.LogInformation("New user registered via Google OAuth: {Email}", email);
        }
        else
        {
            // Returning user — refresh their profile data from Google
            user.Name = name;
            user.GoogleId = googleId;
            if (!string.IsNullOrEmpty(picture)) user.Picture = picture;
            user.LastActiveAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        var agencyList = (user.SubscribedAgencies ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(a => a.Trim())
            .ToList();

        return Ok(new UserProfileDto(
            user.Id,
            user.Email,
            user.Name,
            user.Picture,
            agencyList,
            user.WebPushEnabled
        ));
    }
    /// <summary>
    /// Fetch a user's current profile (for session restore on page refresh).
    /// </summary>
    [HttpGet("profile/{id:int}")]
    public async Task<ActionResult<UserProfileDto>> GetProfile(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        var agencyList = (user.SubscribedAgencies ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(a => a.Trim())
            .ToList();

        return Ok(new UserProfileDto(
            user.Id,
            user.Email,
            user.Name,
            user.Picture,
            agencyList,
            user.WebPushEnabled
        ));
    }
}
