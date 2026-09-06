using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SpaceBot.Api.Data;
using SpaceBot.Api.Models;

namespace SpaceBot.Api.Services;

public class SpaceApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SpaceApiService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public SpaceApiService(HttpClient httpClient, ILogger<SpaceApiService> logger, IServiceProvider serviceProvider)
    {
        _httpClient = httpClient;
        _logger = logger;
        _serviceProvider = serviceProvider;
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "SpaceBot-MissionTracker/1.0");
    }

    public async Task<int> SyncUpcomingLaunchesAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        int syncedCount = 0;

        try
        {
            _logger.LogInformation("Calling Launch Library 2 API for upcoming launches...");
            // Public endpoint: Launch Library 2 Dev endpoint (free, no auth required)
            var response = await _httpClient.GetAsync("https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&mode=normal");

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(content);
                var results = doc.RootElement.GetProperty("results");

                foreach (var item in results.EnumerateArray())
                {
                    var extId = item.GetProperty("id").GetString() ?? Guid.NewGuid().ToString();
                    var name = item.GetProperty("name").GetString() ?? "Classified Orbital Mission";
                    
                    // Provider
                    string provider = "SpaceX";
                    if (item.TryGetProperty("launch_service_provider", out var lsp) && lsp.ValueKind == JsonValueKind.Object)
                    {
                        provider = lsp.GetProperty("name").GetString() ?? "Commercial Space";
                    }

                    // Rocket
                    string rocket = "Orbital Rocket";
                    if (item.TryGetProperty("rocket", out var rkt) && rkt.ValueKind == JsonValueKind.Object)
                    {
                        if (rkt.TryGetProperty("configuration", out var cfg) && cfg.ValueKind == JsonValueKind.Object)
                        {
                            rocket = cfg.GetProperty("name").GetString() ?? "Rocket";
                        }
                    }

                    // Pad & Location
                    string pad = "Launch Complex";
                    string location = "Global Spaceport";
                    if (item.TryGetProperty("pad", out var padObj) && padObj.ValueKind == JsonValueKind.Object)
                    {
                        pad = padObj.GetProperty("name").GetString() ?? pad;
                        if (padObj.TryGetProperty("location", out var loc) && loc.ValueKind == JsonValueKind.Object)
                        {
                            location = loc.GetProperty("name").GetString() ?? location;
                        }
                    }

                    // Mission description
                    string desc = "Orbital payload deployment mission.";
                    string orbit = "Low Earth Orbit (LEO)";
                    if (item.TryGetProperty("mission", out var msn) && msn.ValueKind == JsonValueKind.Object)
                    {
                        desc = msn.TryGetProperty("description", out var d) ? d.GetString() ?? desc : desc;
                        if (msn.TryGetProperty("orbit", out var orb) && orb.ValueKind == JsonValueKind.Object)
                        {
                            orbit = orb.GetProperty("name").GetString() ?? orbit;
                        }
                    }

                    // Dates & Status
                    DateTime windowStart = DateTime.UtcNow.AddDays(1);
                    if (item.TryGetProperty("net", out var netProp) && netProp.GetString() is { } netStr)
                    {
                        if (DateTime.TryParse(netStr, out var parsed))
                            windowStart = parsed;
                    }

                    string status = "Go for Launch";
                    string statusDesc = "";
                    if (item.TryGetProperty("status", out var stat) && stat.ValueKind == JsonValueKind.Object)
                    {
                        status = stat.GetProperty("name").GetString() ?? status;
                        statusDesc = stat.TryGetProperty("description", out var sd) ? sd.GetString() ?? "" : "";
                    }

                    string? imageUrl = null;
                    if (item.TryGetProperty("image", out var img) && img.ValueKind == JsonValueKind.String)
                    {
                        imageUrl = img.GetString();
                    }

                    var existing = await db.Launches.FirstOrDefaultAsync(l => l.ExternalId == extId);
                    if (existing == null)
                    {
                        db.Launches.Add(new Launch
                        {
                            ExternalId = extId,
                            Name = name,
                            MissionDescription = desc,
                            LaunchProvider = provider,
                            RocketName = rocket,
                            Orbit = orbit,
                            PadName = pad,
                            Location = location,
                            LaunchWindowStart = windowStart,
                            Status = status,
                            StatusDescription = statusDesc,
                            ImageUrl = imageUrl,
                            HasAlertSent = false,
                            CreatedAt = DateTime.UtcNow
                        });
                        syncedCount++;
                    }
                    else
                    {
                        // update schedule
                        existing.LaunchWindowStart = windowStart;
                        existing.Status = status;
                        existing.StatusDescription = statusDesc;
                        if (!string.IsNullOrEmpty(imageUrl)) existing.ImageUrl = imageUrl;
                    }
                }

                await db.SaveChangesAsync();
                _logger.LogInformation("Successfully synced {Count} launches from Launch Library 2", syncedCount);
            }
            else
            {
                _logger.LogWarning("Space API returned status {Code}. Using local cached mission radar.", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to external Space API. Local database remains active.");
        }

        return syncedCount;
    }
}
