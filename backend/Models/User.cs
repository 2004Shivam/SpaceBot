using System.ComponentModel.DataAnnotations;

namespace SpaceBot.Api.Models;

public class User
{
    [Key]
    public int Id { get; set; }
    
    public string GoogleId { get; set; } = string.Empty;
    
    [Required]
    public string Email { get; set; } = string.Empty;
    
    public string Name { get; set; } = "Space Explorer";
    
    public string? Picture { get; set; }
    
    // Comma-separated list of subscribed agencies, e.g. "SpaceX,ISRO,NASA"
    public string SubscribedAgencies { get; set; } = "SpaceX,NASA,ISRO";
    
    public bool WebPushEnabled { get; set; } = false;
    
    public string? PushEndpoint { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastActiveAt { get; set; } = DateTime.UtcNow;
}
