import React from 'react';
import type { UserProfile } from '../types';
import { Rocket, RefreshCw, Sun, Moon, History, Radio, Bell, User as UserIcon, LogOut } from 'lucide-react';

interface HeaderProps {
  onSync: () => void;
  syncing: boolean;
  activeTab: 'missions' | 'history';
  setActiveTab: (tab: 'missions' | 'history') => void;
  alertCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenSubscriptions: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSync,
  syncing,
  activeTab,
  setActiveTab,
  alertCount,
  theme,
  onToggleTheme,
  user,
  onOpenAuth,
  onOpenSubscriptions,
  onLogout,
}) => {
  return (
    <header className="card-clean" style={{
      padding: '12px 18px',
      marginBottom: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '9px',
          backgroundColor: 'var(--accent-rocket)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(201, 79, 12, 0.35)',
          flexShrink: 0,
        }}>
          <Rocket size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              SpaceBot
            </h1>
            <span className="badge badge-go" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
              <Radio size={9} /> LIVE
            </span>
          </div>
          {/* Subtitle: hidden on very small screens */}
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }} className="header-subtitle">
            Orbital Mission Radar
          </p>
        </div>
      </div>

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>

        {/* Controls unlocked only after Google Sign-In */}
        {user && (
          <>
            {/* Tab Nav */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid var(--border-card)',
            }}>
              <button
                onClick={() => setActiveTab('missions')}
                title="Upcoming Missions"
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activeTab === 'missions' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'missions' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Rocket size={13} />
                <span className="tab-label">Missions</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                title="Alert History"
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activeTab === 'history' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'history' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <History size={13} />
                <span className="tab-label">Alerts {alertCount > 0 ? `(${alertCount})` : ''}</span>
              </button>
            </div>

            {/* Subscriptions Bell */}
            <button
              className="btn btn-secondary"
              onClick={onOpenSubscriptions}
              title="Manage Agency Notifications"
              style={{ padding: '6px 9px', fontSize: '0.78rem' }}
            >
              <Bell size={14} color="var(--accent-rocket)" />
              {user?.subscribedAgencies?.length ? (
                <span style={{
                  fontSize: '0.62rem',
                  backgroundColor: 'var(--accent-rocket)',
                  color: '#ffffff',
                  padding: '1px 5px',
                  borderRadius: '99px',
                  fontWeight: 700,
                }}>
                  {user.subscribedAgencies.length}
                </span>
              ) : null}
            </button>

            {/* Sync Button */}
            <button
              className="btn btn-rocket"
              onClick={onSync}
              disabled={syncing}
              title="Sync latest launches from space API"
              style={{ opacity: syncing ? 0.75 : 1, padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              <span className="tab-label">{syncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </>
        )}

        {/* Theme Toggle (Always Available) */}
        <button
          onClick={onToggleTheme}
          className="btn btn-secondary"
          title={`Switch to ${theme === 'dark' ? 'Light (Solar Paper)' : 'Dark'} Mode`}
          style={{ padding: '6px 9px' }}
        >
          {theme === 'dark'
            ? <Sun size={14} color="var(--accent-warning)" />
            : <Moon size={14} color="var(--accent-primary)" />
          }
        </button>

        {/* Auth */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div
              onClick={onOpenSubscriptions}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-card)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
              }}
              title="Manage subscription"
            >
              {user.picture ? (
                <img src={user.picture} alt={user.name} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
              ) : (
                <UserIcon size={14} color="var(--accent-primary)" />
              )}
              <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="tab-label">
                {user.name.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="btn btn-secondary"
              style={{ padding: '6px 8px' }}
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            className="btn btn-rocket"
            onClick={onOpenAuth}
            style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}
          >
            <UserIcon size={13} />
            <span>Sign in with Google</span>
          </button>
        )}
      </div>
    </header>
  );
};
