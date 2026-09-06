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
    <header className="card-clean header-container">
      {/* 1. Brand Identity */}
      <div className="header-brand">
        <div className="header-logo-badge">
          <Rocket size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-primary)', margin: 0 }}>
              SpaceBot
            </h1>
            <span className="badge badge-go" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
              <Radio size={9} /> LIVE
            </span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }} className="header-subtitle">
            Orbital Mission Radar
          </p>
        </div>
      </div>

      {/* 2. Navigation & Mission Actions (Rendered when authenticated) */}
      {user && (
        <div className="header-nav-row">
          {/* Segmented Tab Nav */}
          <div className="header-tabs">
            <button
              onClick={() => setActiveTab('missions')}
              title="Upcoming Missions"
              className={`header-tab-btn ${activeTab === 'missions' ? 'active' : ''}`}
            >
              <Rocket size={13} />
              <span>Missions</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              title="Alert History"
              className={`header-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            >
              <History size={13} />
              <span>Alerts</span>
              {alertCount > 0 && (
                <span className="header-tab-badge">{alertCount}</span>
              )}
            </button>
          </div>

          {/* Actions: Subscriptions & Sync */}
          <div className="header-nav-actions">
            <button
              className="btn btn-secondary header-action-btn"
              onClick={onOpenSubscriptions}
              title="Manage Agency Notifications"
            >
              <Bell size={14} color="var(--accent-rocket)" />
              {user?.subscribedAgencies?.length ? (
                <span className="header-bell-badge">
                  {user.subscribedAgencies.length}
                </span>
              ) : null}
            </button>

            <button
              className="btn btn-rocket header-action-btn"
              onClick={onSync}
              disabled={syncing}
              title="Sync latest launches from space API"
              style={{ opacity: syncing ? 0.75 : 1 }}
            >
              <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              <span className="tab-label">{syncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Global User & Utility Controls */}
      <div className="header-user-controls">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="btn btn-secondary header-icon-btn"
          title={`Switch to ${theme === 'dark' ? 'Light (Solar Paper)' : 'Dark'} Mode`}
        >
          {theme === 'dark'
            ? <Sun size={14} color="var(--accent-warning)" />
            : <Moon size={14} color="var(--accent-primary)" />
          }
        </button>

        {/* User Profile or Sign-In */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div
              onClick={onOpenSubscriptions}
              className="header-user-pill"
              title="Manage subscription & notifications"
            >
              {user.picture ? (
                <img src={user.picture} alt={user.name} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
              ) : (
                <UserIcon size={14} color="var(--accent-primary)" />
              )}
              <span className="header-user-name">
                {user.name.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="btn btn-secondary header-icon-btn"
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
