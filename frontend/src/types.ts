export interface Launch {
  id: number;
  externalId: string;
  name: string;
  missionDescription: string;
  launchProvider: string;
  rocketName: string;
  orbit: string;
  padName: string;
  location: string;
  launchWindowStart: string;
  status: string;
  statusDescription: string;
  imageUrl?: string;
  webcastUrl?: string;
  hasAlertSent: boolean;
  lastAlertSentAt?: string;
}

export interface AlertLog {
  id: number;
  launchId: number;
  launchName: string;
  tweetText: string;
  status: 'Published' | 'Draft' | 'SentToX';
  createdAt: string;
  platform: string;
}

export interface SystemMetrics {
  totalTracked: number;
  nextLaunchWindow: string | null;
  nextLaunchName: string | null;
  totalAlertsSent: number;
  activeAgencies: number;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  picture?: string;
  subscribedAgencies: string[];
  webPushEnabled: boolean;
}

