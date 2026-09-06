namespace SpaceBot.Api.Models;

public record PublishAlertRequest(
    int LaunchId,
    string TweetText,
    bool MarkAsSent = true
);

public record SystemMetricsDto(
    int TotalTracked,
    DateTime? NextLaunchWindow,
    string? NextLaunchName,
    int TotalAlertsSent,
    int ActiveAgencies
);
