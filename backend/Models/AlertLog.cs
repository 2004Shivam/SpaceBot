using System.ComponentModel.DataAnnotations;

namespace SpaceBot.Api.Models;

public class AlertLog
{
    [Key]
    public int Id { get; set; }
    
    public int LaunchId { get; set; }
    
    public string LaunchName { get; set; } = string.Empty;
    
    [Required]
    public string TweetText { get; set; } = string.Empty;
    
    public string Status { get; set; } = "Published"; // Published, SentToX, Draft
    
    public string Platform { get; set; } = "X";
    
    public string? TweetUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
