# 🚀 SpaceBot | Orbital Launch Intelligence & Alert Dispatcher

<div align="center">

![SpaceBot Banner](frontend/src/assets/hero.png)

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**Next-generation aerospace launch monitoring, live telemetry tracking, cryptographic Google authentication, and cross-platform push notifications.**

[Explore Launches](#-key-features) • [System Architecture](#-system-architecture) • [API Reference](#-api-endpoints) • [Quickstart](#-quickstart-guide) • [Deploy to Cloud](#-deployment-render--docker)

</div>

---

## 🌟 Overview

**SpaceBot** is a full-stack aerospace telemetry and launch intelligence dashboard built for space enthusiasts, engineers, and orbital watchers. It aggregates live rocket launches from global agencies, displays real-time T-minus countdowns, verifies user identity with **real Google OAuth 2.0**, and dispatches web push alerts directly to your mobile lock screen or desktop notification center.

Designed with a **"Solar Paper"** light mode and a deep **"Cosmic Glass"** dark mode, SpaceBot eliminates visual clutter and delivers critical mission data with zero latency.

---

## ✨ Key Features

### 🛰️ Live Orbital Launch Tracking
* **Global Agency Coverage:** Real-time data synchronization for SpaceX, NASA, ISRO, Rocket Lab, ESA, Roscosmos, CNSA, and commercial launch providers.
* **Precision Countdown Timers:** Sub-second T-minus countdown clocks that dynamically adapt as launch windows shift or hold.
* **Live Mission Telemetry:** Detailed orbits (LEO, GTO, SSO, Moon), launch pads, coordinates, rocket configurations, and webcast broadcast links.

### 🔐 Real Cryptographic Google Authentication
* **Zero Mock Deception:** Fully integrated with official `@react-oauth/google` and Google's official sign-in popup dialog.
* **Backend Signature Verification:** Backend validates signed JWT tokens using `GoogleJsonWebSignature.ValidateAsync()` from the `Google.Apis.Auth` library.
* **Tamper-Proof:** Any forged or expired token is cryptographically rejected with `HTTP 401 Unauthorized`.
* **Honest Guest Access:** Users can also test the platform anonymously via a dedicated `/api/auth/guest-login` route without false branding.

### 🔔 Agency Subscriptions & Web Push Notifications
* **Tailored Alerts:** Subscribe to your favorite space agencies (e.g., alert only on SpaceX & ISRO launches).
* **Native Lock Screen Delivery:** Powered by Progressive Web App (PWA) Service Workers (`sw.js`). Notifications trigger on mobile lock screens (iOS & Android) and OS notification centers (Windows & macOS).
* **Direct Alert Simulation:** Dispatch test notifications with live vibration, badges, and quick-action links.

### 🎨 Dual-Theme Design System
* **Solar Paper (Light Mode):** Hand-tuned warm parchment aesthetics, tactile subtle borders, and optimal contrast engineered for readability in bright environments.
* **Cosmic Glass (Dark Mode):** Deep interstellar obsidian palette with glowing neon accents and glassmorphic card surfaces.
* **Adaptive Mobile Layout:** 2×2 metric cards, collapsible filter trays, and icon-condensed header navigation.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (SPA)                                 │
│  React 18 + Vite + TypeScript + Lucide Icons + Google OAuth + ServiceWorker  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                    RESTful JSON Calls │ Same Origin (Production)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ASP.NET CORE 8 WEB API                            │
│                                                                             │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ LaunchesController    │  │ AuthController       │  │ Subscriptions    │  │
│  │ • Cached Launch Data  │  │ • Google JWT Verify  │  │ • User Agencies  │  │
│  │ • Real-time Metrics   │  │ • Guest Session DB   │  │ • Push Endpoints │  │
│  └───────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│                                       │                                     │
│  ┌────────────────────────────────────┴──────────────────────────────────┐  │
│  │                     Entity Framework Core 8 (SQLite)                  │  │
│  │             Tables: Launches • Alerts • Users • Subscriptions          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🐳 Single-Container Unified Host
SpaceBot uses a multi-stage `Dockerfile` that packages both the frontend and backend into one lightweight runtime image:
1. **Frontend Stage:** Compiles the React SPA using `npm run build`.
2. **Backend Stage:** Copies the generated SPA into ASP.NET's `wwwroot` and compiles the .NET 8 binary.
3. **Runtime Stage:** Runs ASP.NET Core on port `8080`, directly serving both the frontend SPA and all `/api/*` routes. **Zero CORS configuration required in production.**

---

## 🚀 Quickstart Guide

### Prerequisites
* [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js 20+ & npm](https://nodejs.org/)

### 1. Clone the Repository
```bash
git clone https://github.com/2004Shivam/SpaceBot.git
cd SpaceBot
```

### 2. Configure Google OAuth (Optional for local testing)
Copy or create `frontend/.env.local`:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```
*(If omitted, you can still sign in using the built-in **Continue as Guest** mode).*

### 3. Run the Backend (.NET 8)
```bash
cd backend
dotnet restore
dotnet run --urls "http://localhost:5247"
```
*API and Swagger documentation will be live at `http://localhost:5247/swagger`.*

### 4. Run the Frontend (React + Vite)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser to access the dashboard.*

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/launches` | Retrieve all tracked upcoming and past orbital launches |
| `GET` | `/api/launches/{id}` | Get detailed telemetry for a single launch |
| `GET` | `/api/launches/metrics` | Summary metrics (total tracked, active agencies, next window) |
| `POST` | `/api/launches/sync` | Manually trigger sync with global launch databases |
| `GET` | `/api/alerts` | Retrieve alert dispatch history |
| `POST` | `/api/alerts/dispatch` | Dispatch manual launch alert to subscribers |
| `POST` | `/api/auth/google` | Verify Google ID token and establish authenticated session |
| `POST` | `/api/auth/guest-login` | Create anonymous guest session with custom name & email |
| `GET` | `/api/subscriptions/{userId}` | Get user's agency subscriptions & push status |
| `POST` | `/api/subscriptions/update` | Update agency preferences & register push endpoint |

---

## 🌐 Deployment (Render / Docker)

SpaceBot is pre-configured for 1-click cloud deployment on [Render](https://render.com), [Koyeb](https://www.koyeb.com), or [Railway](https://railway.app).

### Deploying on Render:
1. Log in to your Render Dashboard.
2. Click **New +** → **Web Service**.
3. Connect your fork or repository: `2004Shivam/SpaceBot`.
4. Render will automatically detect the root `Dockerfile`.
5. Under **Environment Variables**, add:
   * `Google__ClientId`: `your_client_id.apps.googleusercontent.com`
6. Click **Create Web Service**.

> [!TIP]
> **Free Tier Keep-Warm Tip:**
> Free cloud containers sleep after 15 minutes of inactivity. To keep your SpaceBot instance active 24/7 at zero cost, create a free monitor at [UptimeRobot](https://uptimerobot.com) pinging `https://your-app.onrender.com/api/launches/metrics` every 10 minutes.

---

## 📱 PWA & Mobile Installation

SpaceBot is a fully certified Progressive Web App:
* **On Android (Chrome):** Tap the menu icon (⋮) → tap **Install App**.
* **On iOS (Safari):** Tap the Share button (⎋) → tap **Add to Home Screen**.
* **Push Notifications:** Launch alerts deliver directly to the lock screen and notification panel even when the browser is closed.

---

## 🛠️ Built With

* **Frontend:** React 18, TypeScript, Vite 5, Lucide React, Canvas Confetti
* **Backend:** C#, ASP.NET Core 8 Web API, Entity Framework Core 8, Google.Apis.Auth
* **Database:** SQLite (Embedded, zero external configuration required)
* **DevOps:** Multi-Stage Dockerfile, Alpine Linux

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with 🚀 for stargazers and space explorers worldwide.
</div>
