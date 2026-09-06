// Service worker registration and Web Push notification utilities

export const notificationService = {
  // Register the PWA service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported in this browser.');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered:', registration.scope);
      return registration;
    } catch (err) {
      console.error('ServiceWorker registration failed:', err);
      return null;
    }
  },

  // Check current permission state
  getPermission(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  },

  // Request user permission for notifications
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop/mobile notifications.');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  },

  // Trigger a native system notification (shows in Notification Panel & Lock Screen)
  async showLaunchNotification(title: string, body: string, url: string = '/') {
    const permission = this.getPermission();
    if (permission !== 'granted') {
      const newPerm = await this.requestPermission();
      if (newPerm !== 'granted') return false;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          data: { url },
        } as any);
        return true;
      } else {
        // Fallback for desktop window notification
        new Notification(title, { body, icon: '/favicon.ico' });
        return true;
      }
    } catch (err) {
      console.error('Failed to trigger notification:', err);
      return false;
    }
  },
};
