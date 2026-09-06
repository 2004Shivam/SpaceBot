namespace SpaceBot.Api.Models;

/// <summary>
/// Sent by the frontend after Google sign-in popup completes.
/// The Credential field is the signed Google ID Token (JWT) —
/// verified on the backend using GoogleJsonWebSignature.ValidateAsync().
/// </summary>
public record GoogleAuthRequest(
    string Credential      // The signed JWT from Google's OAuth popup (required)
);

/// <summary>
/// Sent when a user wants to access the app as a guest without Google sign-in.
/// Clearly labelled in the UI as "Guest Access" — no pretense of OAuth.
/// </summary>
public record GuestLoginRequest(
    string Email,
    string Name
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
