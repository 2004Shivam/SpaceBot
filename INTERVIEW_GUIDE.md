# 🛰️ SpaceBot — Master Technical Interview & Architecture Guide

> **Quick Reference Document for Technical, Architectural, and System Design Interviews**  
> *Author:* Shivam  
> *Repository:* [github.com/2004Shivam/SpaceBot](https://github.com/2004Shivam/SpaceBot)  
> *Live Deployment:* [spacebot-jetj.onrender.com](https://spacebot-jetj.onrender.com)

---

## 📌 Table of Contents
1. [The 30-Second & 2-Minute Elevator Pitch](#1-the-elevator-pitch)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Key Architectural Decisions & Trade-Offs](#3-key-architectural-decisions--trade-offs)
4. [Core Features & Technical Implementation](#4-core-features--technical-implementation)
5. [End-to-End Authentication Deep Dive (OAuth 2.0 & JWT)](#5-end-to-end-authentication-deep-dive)
6. [Codebase Anatomy & Component Walkthrough](#6-codebase-anatomy--component-walkthrough)
7. [Database Design & Data Access (EF Core + SQLite)](#7-database-design--data-access)
8. [DevOps, Docker & Cloud Deployment](#8-devops-docker--cloud-deployment)
9. [25 Common Interview Questions & Model Answers](#9-25-common-interview-questions--model-answers)
10. [Future Roadmap & Scaling Strategies](#10-future-roadmap--scaling-strategies)

---

## 1. The Elevator Pitch

### ⚡ 30-Second Version:
> *"SpaceBot is a full-stack aerospace telemetry and orbital launch intelligence dashboard built with ASP.NET Core 8, React 18, and TypeScript. It monitors upcoming global rocket launches from agencies like SpaceX, NASA, and ISRO, features microsecond countdown clocks and pad coordinates, enforces cryptographic Google OAuth 2.0 authentication, and delivers web push notifications directly to device lock screens via a Progressive Web App (PWA). The entire system is containerized in a unified multi-stage Docker build hosted on Render with zero-latency SPA routing."*

### 🎙️ 2-Minute Deep-Dive Version:
> *"I built SpaceBot to solve the problem of fragmented and overly complex space telemetry data. Most launch trackers either overwhelm casual stargazers or fail to provide real-time alerts. SpaceBot aggregates live missions from global launch providers and normalizes telemetry into human-readable data with sub-second countdown timers.*
>
> *On the frontend, I used React with Vite and TypeScript, featuring a handcrafted 'Solar Paper' light mode and a deep 'Cosmic Glass' dark mode. Before authentication, a Gatekeeper Landing screen prevents unauthorized access while providing teaser cards. Once authenticated via Google OAuth 2.0, the full dashboard unlocks.*
>
> *On the backend, I chose ASP.NET Core 8 Web API with Entity Framework Core and SQLite. For authentication, instead of using mock logins, I integrated Google's official Identity Services on the frontend and cryptographically verify the RS256 JWT ID token on the backend using `GoogleJsonWebSignature.ValidateAsync()`. Tampered tokens are rejected with a 401.*
>
> *For deployment, I engineered a single-container multi-stage Dockerfile that compiles the React SPA into static assets and embeds them into the ASP.NET Core `wwwroot`. This eliminates CORS issues in production, reduces cloud costs, and ensures single-click deployments on platforms like Render."*

---

## 2. High-Level System Architecture

```
                                  CLIENT TIER
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BROWSER / MOBILE PWA                              │
│                                                                             │
│   [Unauthenticated]                      [Authenticated]                    │
│   GatekeeperLanding.tsx                  Main Dashboard                     │
│   • Mission Teasers (Locked)             • 4x Metrics Cards                 │
│   • GoogleLogin Popup Button             • Mission Cards & Countdown Clocks │
│                                          • Agency Filters & Search          │
│                                          • Alert Dispatcher & Modals        │
│                                                                             │
│   Service Worker (sw.js)                                                    │
│   • Web Push Listener -> Mobile Lock Screen Notifications                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / JSON (REST)
                                       │ Port 8080 (Prod) / 5247 (Dev)
                                       ▼
                                 SERVER TIER
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ASP.NET CORE 8 WEB API                            │
│                                                                             │
│   Middleware Pipeline:                                                      │
│   • CORS (Strict in Dev, Same-Origin in Prod)                               │
│   • Static Files (Serves React dist from wwwroot)                           │
│   • Routing & Controllers                                                   │
│   • Fallback -> index.html (SPA Client-Side Routing)                        │
│                                                                             │
│   Controllers:                                                              │
│   ├── AuthController        ──► Google RS256 JWT Verification               │
│   ├── LaunchesController    ──► Launch queries, filtering & metrics         │
│   ├── SubscriptionsController──► Agency preferences & push endpoints       │
│   └── AlertsController      ──► Alert broadcast & audit logs                │
│                                                                             │
│   Background / Services:                                                    │
│   └── SpaceApiService       ──► External Launch Library 2 Sync + Fallbacks  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│        DATA STORAGE TIER         │   │       EXTERNAL INTEGRATIONS      │
│   Entity Framework Core 8        │   │   • Google OAuth 2.0 (Identity)  │
│   SQLite (spacebot.db)           │   │   • Launch Library 2 (TheSpaceDevs)
│   • Users                        │   │   • Twitter / X Intent API       │
│   • Launches                     │   │   • Google Calendar Intent API   │
│   • Alerts                       │   │   • Web Push Notifications API   │
└──────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 3. Key Architectural Decisions & Trade-Offs

| Decision | Alternative Considered | Why This Choice Won |
|---|---|---|
| **Single Unified Container** | Separate Vercel (FE) + Render (BE) | **Zero CORS issues**, atomic releases, no domain mismatches, free hosting without managing multiple cloud providers. |
| **Real Google OAuth 2.0** | Email/Password or Mock Login | No plain-text passwords stored, cryptographic token validation, zero user password fatigue, enterprise security posture. |
| **SQLite + EF Core** | PostgreSQL / SQL Server | Zero external database infrastructure needed, instant seed on container startup, portable file-based database ideal for free cloud tiers. |
| **Mandatory Auth Gatekeeper** | Open Guest Access | Clear separation between public teaser and protected mission data; incentives user authentication while protecting API feeds. |
| **Vanilla CSS with Custom Tokens** | Tailwind CSS | Extreme control over dual-theme colors ('Solar Paper' & 'Cosmic Glass'), zero CSS purge issues, clean semantic classes, zero build overhead. |
| **PWA Service Worker** | Native App (React Native/Flutter)| Single codebase works across Web, iOS, Android, and Desktop without App Store review cycles or fees. |

---

## 4. Core Features & Technical Implementation

### 1. Mandatory Gatekeeper & Teaser Previews
* **Problem:** How to incentivize sign-in without leaving unauthenticated users with an ugly, broken, or empty screen.
* **Solution:** `GatekeeperLanding.tsx` renders a sleek "Restricted Mission Control" hero. It displays 4 locked feature previews (*Live Orbital Radar, Microsecond Telemetry, Lock Screen Push, Multi-Agency Hub*) with padlock indicators, and places the official Google Login button prominently in the center.

### 2. Real-Time Orbital Telemetry & Countdown Clocks
* **Precision Countdown Timer (`CountdownTimer.tsx`):** Computes difference between `launchWindowStart` and `Date.now()`. Updates every 1000ms. Formats dynamically into `T- Xd : Yh : Zm : Ws`, switching to `"Liftoff Complete"` after T-0.
* **Auto-Understanding Mission Summaries:** Generates concise 1-sentence explanations for beginners (e.g. *"Commercial satellite deployment into Low Earth Orbit (LEO) using reusable Falcon 9 first stage"*).

### 3. Dual-Theme Palette System
* **Cosmic Glass (Dark Mode):** Obsidian background (`#090d16`), aerospace orange (`#f97316`), electric sky blue (`#38bdf8`), and glassmorphism.
* **Solar Paper (Light Mode):** Inspired by Apollo-era NASA flight manuals. Parchment canvas (`#f5ede0`), mission document orange (`#c94f0c`), architectural borders (`#e8d5c0`), and high-legibility ink tones.

### 4. Cross-Platform Web Push Notifications
* **Service Worker (`sw.js`):** Intercepts push events and displays notifications with custom icons, badge assets, vibration patterns (`[200, 100, 200]`), and deep links directly to the mission webcast.

---

## 5. End-to-End Authentication Deep Dive

### The OAuth 2.0 Flow Step-by-Step:
1. **User Action:** User clicks **Sign in with Google** on `GatekeeperLanding.tsx` or `Header.tsx`.
2. **Google Identity Services:** `@react-oauth/google` invokes Google's popup flow. Google handles user authentication and 2FA on their own secure domain.
3. **Signed Credential:** Google returns an OpenID Connect ID Token (RS256 JWT) to the frontend callback.
4. **Backend Transmission:** Frontend issues `POST /api/auth/google` with `{ credential: "<JWT_STRING>" }`.
5. **Cryptographic Signature Verification:**
   ```csharp
   var settings = new GoogleJsonWebSignature.ValidationSettings();
   if (!string.IsNullOrEmpty(configuredClientId))
   {
       settings.Audience = new[] { configuredClientId };
   }
   GoogleJsonWebSignature.Payload payload = 
       await GoogleJsonWebSignature.ValidateAsync(request.Credential, settings);
   ```
   * What this does under the hood:
     - Fetches Google's public JSON Web Key Set (JWKS) from `https://www.googleapis.com/oauth2/v3/certs`.
     - Validates the RSA signature.
     - Verifies token expiration (`exp`) and issuer (`iss = accounts.google.com`).
     - Verifies audience (`aud = Google Client ID`).
6. **User Provisioning (Upsert):** Backend retrieves claims (`payload.Subject`, `payload.Email`, `payload.Name`, `payload.Picture`). If the user exists in SQLite, updates `LastActiveAt`; if new, provisions account with default subscriptions (`SpaceX, NASA, ISRO`).
7. **Session Persistence:** Returns `UserProfileDto` to frontend, persisted in `localStorage`.

### Security Attack Prevention:
* **Token Forgery:** If an attacker sends a fabricated JWT with fake claims, `GoogleJsonWebSignature.ValidateAsync()` throws an exception and the API returns `HTTP 401 Unauthorized`.
* **Audience Mismatch:** Prevents tokens generated for other Google applications from being reused against SpaceBot.

---

## 6. Codebase Anatomy & Component Walkthrough

### 📁 Backend (`d:\SpaceBot\backend`)
* `Program.cs`:
  - Configures SQLite via `builder.Services.AddDbContext<AppDbContext>()`.
  - Configures environment-aware CORS (`AllowFrontend` policy).
  - Calls `app.UseDefaultFiles()`, `app.UseStaticFiles()`, and `app.MapFallbackToFile("index.html")` to serve the SPA.
  - Automatically executes `db.Database.EnsureCreated()` on startup.
* `Controllers/AuthController.cs`:
  - `POST /api/auth/google`: Cryptographic JWT validation & user upsert.
  - `GET /api/auth/profile/{id}`: Session rehydration on page reload.
* `Controllers/LaunchesController.cs`:
  - `GET /api/launches`: Retrieves launch list with status and provider filters.
  - `GET /api/launches/metrics`: Summary stats (`totalTracked`, `activeAgencies`, `nextLaunchWindow`).
  - `POST /api/launches/sync`: Triggers manual synchronization with external space API.
* `Controllers/SubscriptionsController.cs`:
  - Manages agency subscriptions and push notification endpoint tokens.
* `Services/SpaceApiService.cs`:
  - Resilient HTTP service calling Launch Library 2 API with fallbacks and seed data.

### 📁 Frontend (`d:\SpaceBot\frontend\src`)
* `main.tsx`:
  - Bootstraps React into `#root`.
  - Wraps tree in `<GoogleOAuthProvider clientId={googleClientId}>`.
* `App.tsx`:
  - Central orchestrator: loads launches, metrics, and alerts on mount.
  - Manages theme (`dark` vs `light`) and active user state.
  - Enforces mandatory auth: renders `<GatekeeperLanding />` if `!user`, or full dashboard if `user` is present.
  - Handles `/privacy` route rendering.
* `components/GatekeeperLanding.tsx`:
  - Unauthenticated landing hero with locked teaser previews and central `<GoogleLogin />`.
* `components/Header.tsx`:
  - Responsive header: brand logo, theme switcher, responsive tabs, and user profile avatar.
* `components/MissionCard.tsx`:
  - Launch card displaying vehicle, pad coordinates, countdown timer, webcast links, and calendar sync.
* `components/CountdownTimer.tsx`:
  - Sub-second countdown timer hook and component.
* `components/SubscriptionModal.tsx`:
  - Checklist allowing users to subscribe/unsubscribe from specific space agencies.
* `components/AlertModal.tsx`:
  - Pre-formatted social templates (Hype, Technical, Countdown) with 1-click X sharing & confetti.
* `components/PrivacyPolicy.tsx`:
  - Dedicated compliance and privacy policy page required for OAuth compliance.

---

## 7. Database Design & Data Access

SpaceBot uses **Entity Framework Core 8** with an embedded **SQLite** database (`spacebot.db`).

### Schema Overview:

```sql
-- Users Table
CREATE TABLE "Users" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "GoogleId" TEXT NULL,
    "Email" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Picture" TEXT NULL,
    "SubscribedAgencies" TEXT NOT NULL, -- Stored as comma-separated string e.g. "SpaceX,NASA,ISRO"
    "WebPushEnabled" INTEGER NOT NULL,
    "PushEndpoint" TEXT NULL,
    "CreatedAt" TEXT NOT NULL,
    "LastActiveAt" TEXT NOT NULL
);

-- Launches Table
CREATE TABLE "Launches" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ExternalId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "LaunchProvider" TEXT NOT NULL,
    "RocketName" TEXT NOT NULL,
    "PadName" TEXT NOT NULL,
    "Location" TEXT NOT NULL,
    "LaunchWindowStart" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "StatusDescription" TEXT NOT NULL,
    "MissionDescription" TEXT NOT NULL,
    "Orbit" TEXT NOT NULL,
    "ImageUrl" TEXT NULL,
    "WebcastUrl" TEXT NULL,
    "HasAlertSent" INTEGER NOT NULL,
    "LastAlertSentAt" TEXT NULL,
    "CreatedAt" TEXT NOT NULL
);

-- Alerts Table (Audit Log)
CREATE TABLE "Alerts" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "LaunchId" INTEGER NOT NULL,
    "LaunchName" TEXT NOT NULL,
    "TweetText" TEXT NOT NULL,
    "TweetUrl" TEXT NULL,
    "Platform" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    CONSTRAINT "FK_Alerts_Launches_LaunchId" FOREIGN KEY ("LaunchId") REFERENCES "Launches" ("Id")
);
```

---

## 8. DevOps, Docker & Cloud Deployment

### The Multi-Stage Dockerfile Strategy:
SpaceBot uses a 3-stage Docker build to minimize image size and ensure security:

```dockerfile
# Stage 1: Compile React Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build  # Produces /app/frontend/dist

# Stage 2: Compile ASP.NET Core 8 Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app/backend
COPY backend/*.csproj ./
RUN dotnet restore
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./wwwroot # Embeds SPA into backend wwwroot
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Minimal Production Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=backend-build /app/publish ./
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "SpaceBot.Api.dll"]
```

### Production Hosting on Render:
* **URL:** `https://spacebot-jetj.onrender.com`
* **Free Tier Keep-Alive Solution:** Free cloud instances idle after 15 minutes. To eliminate cold-starts, an external health check monitor (e.g. UptimeRobot or cron-job.org) pings `/api/launches/metrics` every 10 minutes, keeping the container warm 24/7 at $0 cost.

---

## 9. 25 Common Interview Questions & Model Answers

### Architecture & System Design
#### Q1: "Why did you package frontend and backend in a single Docker container instead of deploying them separately?"
> *"I chose a single-container architecture for three reasons: first, it completely eliminates CORS issues because the SPA and API share the exact same origin. Second, it simplifies deployment and versioning—every deployment is atomic, guaranteeing the frontend and backend are always on matching versions. Third, on free cloud tiers like Render, hosting two separate services would double the cold-start delay and complexity, whereas one unified container runs efficiently on a single instance."*

#### Q2: "How does the backend serve React client-side routing without 404 errors on page refresh?"
> *"In `Program.cs`, we register `app.UseDefaultFiles()`, `app.UseStaticFiles()`, and finally `app.MapFallbackToFile("index.html")`. If a requested path doesn't match an active API controller or a static file in `wwwroot`, ASP.NET Core automatically falls back to `index.html`. This allows client-side routes like `/privacy` or future sub-routes to be handled cleanly by React without 404s."*

#### Q3: "What happens if the external space telemetry API goes down or rate-limits your server?"
> *"The `SpaceApiService` is designed with resilient fallback strategies. First, launch data is cached in SQLite so the app can serve existing tracked missions immediately without making external network calls on every request. Second, if the external API returns an error or rate-limit status, the service catches the exception, logs it, and falls back to our pre-seeded orbital database. The user experience remains uninterrupted."*

---

### Security & Authentication
#### Q4: "Explain how you verify Google tokens on the backend."
> *"When a user signs in, the frontend receives a signed RS256 JWT ID token from Google Identity Services. The frontend passes this token to `POST /api/auth/google`. The backend uses `GoogleJsonWebSignature.ValidateAsync()` from the `Google.Apis.Auth` library. The library fetches Google's public RSA signing keys from their JWKS endpoint, validates the signature, and verifies that the audience matches our configured Client ID, the issuer is `accounts.google.com`, and the token has not expired. If any check fails, an exception is thrown and we return HTTP 401 Unauthorized."*

#### Q5: "Why did you eliminate mock/guest authentication?"
> *"Mock authentication creates a false sense of security and leads to dirty, unverified database records. By enforcing real Google OAuth 2.0 with cryptographic verification, we ensure that every user record corresponds to a verified email address, preventing spam, unauthorized subscription spamming, and account takeover."*

#### Q6: "Why is the Google Client ID present in frontend code? Is that a security risk?"
> *"No, a Google OAuth Client ID is by definition a public identifier. Google requires it to be exposed to the browser so Google Identity Services can determine which registered application is requesting consent. Security is maintained because the Client ID alone cannot authorize actions—authorization requires the user to authenticate on Google's domain, generating a signed JWT that our backend cryptographically verifies."*

---

### Backend & .NET 8 / C#
#### Q7: "Why did you choose C# and ASP.NET Core 8 over Node.js or Python?"
> *"ASP.NET Core 8 offers industry-leading throughput, low memory footprint, and strong compile-time type safety. With C# 12 records, pattern matching, and minimal boilerplate, we get clean, maintainable DTOs and models. Furthermore, libraries like `Google.Apis.Auth` and `Microsoft.EntityFrameworkCore` provide enterprise-grade cryptographic validation and ORM capabilities out of the box."*

#### Q8: "How do you handle dependency injection in this project?"
> *"In `Program.cs`, we register our services with appropriate lifetimes: `AppDbContext` is registered via `AddDbContext` with a Scoped lifetime per HTTP request. `HttpClient` for `SpaceApiService` is registered as a Typed Client using `builder.Services.AddHttpClient<SpaceApiService>()`, which leverages `IHttpClientFactory` to prevent socket exhaustion and manage DNS refreshes."*

#### Q9: "Why use C# records for DTOs instead of traditional classes?"
> *"C# records provide immutability, concise primary constructor syntax, value-based equality, and built-in non-destructive mutation (`with` expressions). For example, `public record GoogleAuthRequest(string Credential);` defines an immutable request object in one line with zero boilerplate."*

---

### Frontend & React / TypeScript
#### Q10: "How do you prevent memory leaks in your CountdownTimer component?"
> *"In `CountdownTimer.tsx`, the timer calculation runs inside a `useEffect` hook with `setInterval`. Crucially, the effect returns a cleanup function `() => clearInterval(interval)`. When the component unmounts or the `targetDate` changes, the previous interval is cleared, preventing memory leaks and orphaned background execution."*

#### Q11: "Explain how the Gatekeeper Landing pattern works."
> *"In `App.tsx`, we inspect the `user` state. If `!user`, instead of mounting the telemetry dashboard, we render `<GatekeeperLanding />`. This component displays an intriguing mission control preview with locked feature cards and the official `<GoogleLogin />` button. The moment authentication succeeds, `user` state updates, triggering an instantaneous transition to the full telemetry dashboard without a full page reload."*

#### Q12: "How did you ensure mobile responsiveness without UI breakage down to 320px?"
> *"I implemented a multi-layer responsive strategy:
> 1. Globally constrained `html, body` with `max-width: 100vw` and `overflow-x: hidden`.
> 2. Sized the Google button to a responsive 280px width, preventing card overflow on small viewports.
> 3. Used CSS media queries (`@media (max-width: 520px)`) to collapse verbose header labels to compact icons.
> 4. Structured metric cards into an auto-wrapping 2×2 grid with fluid font scaling.
> 5. Enabled `flex-wrap: wrap` on mission card action rows so buttons never clip."*

---

### Database & Persistence
#### Q13: "Why choose SQLite over PostgreSQL for SpaceBot?"
> *"For SpaceBot's current scale, SQLite is embedded directly within the process, requiring zero external database servers, network latency, or maintenance overhead. It allows the Docker container to be completely self-contained and run on free-tier cloud platforms. Should we scale to millions of concurrent writes in the future, EF Core allows us to switch to PostgreSQL simply by swapping `UseSqlite()` for `UseNpgsql()` without changing our business logic."*

#### Q14: "How are agency subscriptions stored and queried in SQLite?"
> *"In the `User` entity, agency subscriptions are stored as a delimited string (e.g. `'SpaceX,NASA,ISRO'`). When queried by the API, `AuthController` and `SubscriptionsController` split the string into a `List<string>` for clean JSON serialization. This avoids maintaining a separate many-to-many join table for a fixed set of 7 space agencies."*

---

### DevOps & Cloud
#### Q15: "What are the advantages of using a multi-stage Docker build?"
> *"A multi-stage build separates build-time dependencies from the runtime environment. Node.js, npm, and the .NET SDK are only present in intermediate build stages. The final runtime container is based on the minimal `aspnet:8.0` image, which contains only the compiled binaries and the ASP.NET runtime. This reduces image size from ~1.5 GB to ~200 MB, speeds up deployments, and significantly reduces the attack surface."*

#### Q16: "How does the keep-alive mechanism work on Render's free tier?"
> *"Render spins down free web services after 15 minutes of inactivity. To keep SpaceBot permanently responsive, we configure an external uptime monitor (like UptimeRobot) to send an HTTP GET request to `/api/launches/metrics` every 10 minutes. Because the endpoint returns lightweight JSON in under 50ms, it keeps the container active with minimal resource usage."*

---

## 10. Future Roadmap & Scaling Strategies

If asked: *"How would you take this project to the next level?"*, share these concrete architectural enhancements:

1. **SignalR Real-Time WebSockets:** Replace polling with ASP.NET Core SignalR hubs to push live launch scrub, hold, and liftoff updates to thousands of connected browser clients simultaneously.
2. **PostgreSQL + Redis Distributed Caching:** Migrate SQLite to PostgreSQL and place a Redis cache in front of `/api/launches` to serve high-traffic launch moments (e.g., Starship orbital tests) with sub-5ms response times.
3. **Automated SMS & WhatsApp Webhooks:** Integrate Twilio / WhatsApp Business API to dispatch instant SMS notifications 10 minutes prior to liftoff for users without active push subscriptions.
4. **Interactive 3D Orbital Trajectory Map:** Use Three.js / CesiumJS to render a real-time 3D Earth globe showing active rocket flight paths, telemetry coordinates, and ground tracks.
