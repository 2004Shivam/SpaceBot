namespace SpaceBot.Api.Models;

/// <summary>
/// Sent by the frontend after Google sign-in popup completes.
/// The Credential field is the signed Google ID Token (JWT) —
/// verified on the backend using GoogleJsonWebSignature.ValidateAsync().
/// </summary>
public record GoogleAuthRequest(
    string Credential      // The signed JWT from Google's OAuth popup (required)
);


public record UserProfileDto(
    int Id,
    string Email,
    string Name,
    string? Picture,
    List<string> SubscribedAgencies,
    bool WebPushEnabled
);

public record UpdateSubscriptionRequest(
    int UserId,
    List<string> Agencies,
    bool WebPushEnabled,
    string? PushEndpoint = null
);
