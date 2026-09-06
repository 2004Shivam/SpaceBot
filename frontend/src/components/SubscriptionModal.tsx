import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { api } from '../services/api';
import { notificationService } from '../services/notificationService';
import { X, Bell, Check, Smartphone, Send, ShieldCheck } from 'lucide-react';

interface SubscriptionModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAuth?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  user,
  onClose,
  onUpdateUser,
  onToast,
  onOpenAuth,
}) => {
  const availableAgencies = ['SpaceX', 'NASA', 'ISRO', 'Rocket Lab', 'ULA', 'Arianespace', 'Roscosmos'];

  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(
    user?.subscribedAgencies || ['SpaceX', 'NASA', 'ISRO']
  );
  const [webPushEnabled, setWebPushEnabled] = useState(user?.webPushEnabled ?? true);
  const [saving, setSaving] = useState(false);

  const toggleAgency = (agency: string) => {
    setSelectedAgencies((prev) =>
      prev.includes(agency) ? prev.filter((a) => a !== agency) : [...prev, agency]
    );
  };

  const handleToggleWebPush = async () => {
    if (!webPushEnabled) {
      const perm = await notificationService.requestPermission();
      if (perm === 'granted') {
        setWebPushEnabled(true);
        onToast('Push notifications enabled for desktop & phone!', 'success');
      } else {
        onToast('Notification permission was blocked in browser settings.', 'error');
      }
    } else {
      setWebPushEnabled(false);
      onToast('Push notifications paused.', 'info');
    }
  };

  const handleTestPushNotification = async () => {
    const success = await notificationService.showLaunchNotification(
      '🚀 SpaceBot: Starship Flight 6 Alert',
      'Liftoff in 30 minutes from Starbase! Your subscribed agency (SpaceX) is Go for launch.'
    );

    if (success) {
      onToast('Sent test push notification to your device panel!', 'success');
    } else {
      onToast('Please grant notification permission when prompted.', 'error');
    }
  };

  const handleSave = async () => {
    if (!user) {
      onToast('Please sign in first to save your notification preferences.', 'info');
      return;
    }

    try {
      setSaving(true);
      const updated = await api.updateSubscriptions(user.id, selectedAgencies, webPushEnabled);
      onUpdateUser(updated);
      onToast('✓ Agency subscriptions updated!', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      onToast('Could not save subscriptions.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="card-clean" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '22px',
        position: 'relative',
        backgroundColor: 'var(--bg-modal)',
        boxShadow: 'var(--shadow-lg)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Bell size={20} color="var(--accent-rocket)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Agency Launch Alerts
          </h2>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Select which space agencies you want to track. SpaceBot will deliver notifications directly to your phone notification bar or desktop.
        </p>

        {!user && (
          <div style={{
            backgroundColor: 'var(--accent-primary-subtle)',
            border: '1px solid var(--accent-primary)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
              👤 Browsing as Guest. Sign in to sync your subscriptions across devices.
            </span>
            {onOpenAuth && (
              <button
                onClick={() => { onClose(); onOpenAuth(); }}
                className="btn btn-primary"
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              >
                Sign In (1-Click)
              </button>
            )}
          </div>
        )}

        {/* Agency Selection Checklist */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Subscribed Agencies:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
            {availableAgencies.map((agency) => {
              const isChecked = selectedAgencies.includes(agency);
              return (
                <div
                  key={agency}
                  onClick={() => toggleAgency(agency)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isChecked ? 'var(--accent-rocket)' : 'var(--border-card)',
                    backgroundColor: isChecked ? 'var(--accent-rocket-subtle)' : 'var(--bg-surface)',
                    color: isChecked ? 'var(--accent-rocket)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: isChecked ? 'var(--accent-rocket)' : 'var(--border-card)',
                    backgroundColor: isChecked ? 'var(--accent-rocket)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}>
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span>{agency}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Web Push Notification Toggle */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-card)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={16} color="var(--accent-success)" />
              <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                Mobile & Desktop Push Alerts
              </strong>
            </div>
            <button
              onClick={handleToggleWebPush}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: webPushEnabled ? 'var(--accent-success)' : 'var(--border-card)',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {webPushEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Appears directly on your Android / PWA lock screen and notification panel.
          </p>
        </div>

        {/* Test Push Button */}
        <div style={{ marginBottom: '18px' }}>
          <button
            onClick={handleTestPushNotification}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '7px 12px', fontSize: '0.8rem' }}
          >
            <Send size={13} color="var(--accent-primary)" />
            <span>Send Test Push Notification to My Screen</span>
          </button>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-rocket"
            onClick={handleSave}
            disabled={saving}
          >
            <ShieldCheck size={14} />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
