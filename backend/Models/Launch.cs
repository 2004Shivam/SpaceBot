using System.ComponentModel.DataAnnotations;

namespace SpaceBot.Api.Models;

public class Launch
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string ExternalId { get; set; } = string.Empty;
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string MissionDescription { get; set; } = string.Empty;
    
    public string LaunchProvider { get; set; } = "SpaceX";
    
    public string RocketName { get; set; } = "Falcon 9";
    
    public string Orbit { get; set; } = "Low Earth Orbit (LEO)";
    
    public string PadName { get; set; } = "SLC-40, Cape Canaveral";
    
    public string Location { get; set; } = "Florida, USA";
    
    public DateTime LaunchWindowStart { get; set; }
    
    public string Status { get; set; } = "Go for Launch";
    
    public string StatusDescription { get; set; } = string.Empty;
    
    public string? ImageUrl { get; set; }
    
    public string? WebcastUrl { get; set; }
    
    public bool HasAlertSent { get; set; } = false;
    
    public DateTime? LastAlertSentAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
