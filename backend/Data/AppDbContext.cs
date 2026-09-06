using Microsoft.EntityFrameworkCore;
using SpaceBot.Api.Models;

namespace SpaceBot.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Launch> Launches => Set<Launch>();
    public DbSet<AlertLog> Alerts => Set<AlertLog>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed realistic upcoming missions
        var now = DateTime.UtcNow;

        modelBuilder.Entity<Launch>().HasData(
            new Launch
            {
                Id = 1,
                ExternalId = "seed-spx-starlink-1",
                Name = "Starlink Group 10-18",
                MissionDescription = "Deployment of 23 Starlink v2 Mini satellites to Low Earth Orbit to enhance global broadband coverage.",
                LaunchProvider = "SpaceX",
                RocketName = "Falcon 9 Block 5",
                Orbit = "Low Earth Orbit (LEO)",
                PadName = "Space Launch Complex 40 (SLC-40)",
                Location = "Cape Canaveral Space Force Station, Florida",
                LaunchWindowStart = now.AddHours(4).AddMinutes(25),
                Status = "Go for Launch",
                StatusDescription = "Weather is 90% favorable. Pre-launch propellant loading nominal.",
                ImageUrl = "https://images.unsplash.com/photo-1517976487508-3e4a2c1d38eb?auto=format&fit=crop&w=800&q=80",
                HasAlertSent = false,
                CreatedAt = now
            },
            new Launch
            {
                Id = 2,
                ExternalId = "seed-spx-starship-6",
                Name = "Starship Integrated Flight Test 6",
                MissionDescription = "Next generation heavy-lift orbital test flight demonstrating upper-stage re-entry maneuvers and booster catch mechanism.",
                LaunchProvider = "SpaceX",
                RocketName = "Starship & Super Heavy",
                Orbit = "Transatmospheric Earth Orbit",
                PadName = "Orbital Launch Pad A",
                Location = "Starbase, Boca Chica, Texas",
                LaunchWindowStart = now.AddDays(1).AddHours(8),
                Status = "Go for Launch",
                StatusDescription = "Static fire completed successfully. FAA license clearance active.",
                ImageUrl = "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80",
                HasAlertSent = false,
                CreatedAt = now
            },
            new Launch
            {
                Id = 3,
                ExternalId = "seed-rl-electron-55",
                Name = "Changes In Latitudes, Changes In Attitudes",
                MissionDescription = "Commercial Earth observation satellite constellation deployment into high-inclination retrograde orbit.",
                LaunchProvider = "Rocket Lab",
                RocketName = "Electron",
                Orbit = "Sun-Synchronous Orbit (SSO)",
                PadName = "Launch Complex 1B",
                Location = "Mahia Peninsula, New Zealand",
                LaunchWindowStart = now.AddDays(2).AddHours(14),
                Status = "Go for Launch",
                StatusDescription = "Final payload encapsulation and fairing mate complete.",
                ImageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
                HasAlertSent = false,
                CreatedAt = now
            },
            new Launch
            {
                Id = 4,
                ExternalId = "seed-isro-pslv-c60",
                Name = "PSLV-C60 / Proba-3 Mission",
                MissionDescription = "Precision formation flying solar coronagraph demonstration satellites for ESA deployed by ISRO.",
                LaunchProvider = "ISRO",
                RocketName = "PSLV-XL",
                Orbit = "Highly Elliptical Orbit (HEO)",
                PadName = "First Launch Pad (FLP)",
                Location = "Satish Dhawan Space Centre, Sriharikota",
                LaunchWindowStart = now.AddDays(4).AddHours(6),
                Status = "TBD",
                StatusDescription = "Integration of secondary scientific payloads in progress.",
                ImageUrl = "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=800&q=80",
                HasAlertSent = false,
                CreatedAt = now
            },
            new Launch
            {
                Id = 5,
                ExternalId = "seed-ula-vulcan-cert2",
                Name = "Vulcan Centaur Certification Flight",
                MissionDescription = "Second orbital certification launch demonstrating solid rocket booster separation and BE-4 engine performance.",
                LaunchProvider = "ULA",
                RocketName = "Vulcan Centaur",
                Orbit = "Geostationary Transfer Orbit (GTO)",
                PadName = "Space Launch Complex 41 (SLC-41)",
                Location = "Cape Canaveral SFS, Florida",
                LaunchWindowStart = now.AddDays(6).AddHours(19),
                Status = "Go for Launch",
                StatusDescription = "Stage testing verified. Rollout to launch pad scheduled.",
                ImageUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
                HasAlertSent = false,
                CreatedAt = now
            }
        );
    }
}
