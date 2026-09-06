import type { Launch, AlertLog, SystemMetrics, UserProfile } from '../types';

// In local dev (Vite port 5173) call backend port 5247. In production (unified host) use relative /api
const API_BASE = window.location.port === '5173' 
  ? 'http://localhost:5247/api' 
  : '/api';

export const api = {
  async getLaunches(provider?: string, status?: string): Promise<Launch[]> {
    const params = new URLSearchParams();
    if (provider && provider !== 'ALL') params.append('provider', provider);
    if (status && status !== 'ALL') params.append('status', status);

    const res = await fetch(`${API_BASE}/launches?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch launches: ${res.statusText}`);
    return res.json();
  },

  async syncLaunches(): Promise<{ message: string; count: number }> {
    const res = await fetch(`${API_BASE}/launches/sync`, { method: 'POST' });
    if (!res.ok) throw new Error(`Sync failed: ${res.statusText}`);
    return res.json();
  },

  async getAlerts(): Promise<AlertLog[]> {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.statusText}`);
    return res.json();
  },

  async publishAlert(launchId: number, tweetText: string, markAsSent: boolean = true): Promise<AlertLog> {
    const res = await fetch(`${API_BASE}/alerts/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ launchId, tweetText, markAsSent }),
    });
    if (!res.ok) throw new Error(`Failed to publish alert: ${res.statusText}`);
    return res.json();
  },

  async getMetrics(): Promise<SystemMetrics> {
    const res = await fetch(`${API_BASE}/launches/metrics`);
    if (!res.ok) throw new Error(`Failed to fetch metrics: ${res.statusText}`);
    return res.json();
  },

  async googleAuth(credential: string): Promise<import('../types').UserProfile> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) throw new Error(`Google auth failed: ${res.statusText}`);
    return res.json();
  },


  async updateSubscriptions(userId: number, agencies: string[], webPushEnabled: boolean): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, agencies, webPushEnabled }),
    });
    if (!res.ok) throw new Error(`Subscription update failed: ${res.statusText}`);
    return res.json();
  },

  async getProfile(userId: number): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/profile/${userId}`);
    if (!res.ok) throw new Error(`Profile fetch failed: ${res.statusText}`);
    return res.json();
  },
};

