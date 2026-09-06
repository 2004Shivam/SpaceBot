import React, { useState, useEffect, useMemo } from 'react';
import type { Launch, AlertLog, SystemMetrics, UserProfile } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { MissionCard } from './components/MissionCard';
import { AlertModal } from './components/AlertModal';
import { AlertHistory } from './components/AlertHistory';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { notificationService } from './services/notificationService';
import {
  Search, Rocket, Download, AlertCircle, X, ArrowUpDown,
  SlidersHorizontal, ChevronDown, ChevronUp, Sparkles, RefreshCw,
} from 'lucide-react';

export const App: React.FC = () => {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('spacebot-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // ── Auth ───────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('spacebot-user');
    return saved ? JSON.parse(saved) : null;
  });

  // ── Data ───────────────────────────────────────────────────────────────────
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Filters & Search ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'missions' | 'history'>('missions');
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'soonest' | 'name' | 'provider'>('soonest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ── Welcome Banner (one-time, dismissible) ─────────────────────────────────
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return !localStorage.getItem('spacebot-welcome-dismissed');
  });

  const dismissWelcome = () => {
    localStorage.setItem('spacebot-welcome-dismissed', '1');
    setShowWelcome(false);
  };

  // ── Modals & Toast ─────────────────────────────────────────────────────────
  const [activeLaunchForAlert, setActiveLaunchForAlert] = useState<Launch | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ── PWA Install ────────────────────────────────────────────────────────────
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('spacebot-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('spacebot-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('spacebot-user');
    }
  }, [user]);

  useEffect(() => {
    notificationService.registerServiceWorker();
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    loadData();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [launchData, alertData, metricsData] = await Promise.all([
        api.getLaunches(),
        api.getAlerts(),
        api.getMetrics(),
      ]);
      setLaunches(launchData);
      setAlerts(alertData);
      setMetrics(metricsData);

      // Refresh user session from backend if signed in
      if (user?.id) {
        api.getProfile(user.id)
          .then(fresh => setUser(fresh))
          .catch(() => {
            console.warn('Session stale — clearing local auth.');
            setUser(null);
          });
      }
    } catch (err: any) {
      console.warn('API fetch warning:', err.message);
      setError('Could not connect to backend. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await api.syncLaunches();
      await loadData();
      addToast(`✓ Radar synced! ${res.count || ''} launches updated.`, 'success');

      // Push notification to subscribed users on sync
      if (user && user.webPushEnabled && user.subscribedAgencies.length > 0) {
        const matching = launches.find(l =>
          user.subscribedAgencies.some(a => l.launchProvider.toLowerCase().includes(a.toLowerCase()))
        );
        if (matching) {
          notificationService.showLaunchNotification(
            `🚀 ${matching.launchProvider} Launch Alert`,
            `${matching.name} — ${new Date(matching.launchWindowStart).toLocaleDateString()}`
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      addToast('Error synchronizing. Check backend connection.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleAlertPublished = (newAlert: AlertLog) => {
    setActiveLaunchForAlert(null);
    setAlerts(prev => [newAlert, ...prev]);
    setLaunches(prev => prev.map(l => l.id === newAlert.launchId ? { ...l, hasAlertSent: true } : l));
    api.getMetrics().then(setMetrics).catch(() => {});
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      addToast('SpaceBot installed to your home screen!', 'success');
    }
  };

  const handleLogout = () => {
    setUser(null);
    addToast('Signed out.', 'info');
  };

  // ── Computed values ────────────────────────────────────────────────────────
  const agencyCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: launches.length };
    for (const l of launches) {
      const p = l.launchProvider;
      counts[p] = (counts[p] || 0) + 1;
    }
    return counts;
  }, [launches]);

  const filteredAndSortedLaunches = useMemo(() => {
    let result = launches.filter(launch => {
      const matchesSearch =
        launch.name.toLowerCase().includes(search.toLowerCase()) ||
        launch.rocketName.toLowerCase().includes(search.toLowerCase()) ||
        launch.launchProvider.toLowerCase().includes(search.toLowerCase());

      const matchesProvider =
        selectedProvider === 'ALL' ||
        launch.launchProvider.toLowerCase().includes(selectedProvider.toLowerCase());

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'GO' && launch.status.toLowerCase().includes('go')) ||
        (selectedStatus === 'TBD' && launch.status.toLowerCase().includes('tbd'));

      return matchesSearch && matchesProvider && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'provider') return a.launchProvider.localeCompare(b.launchProvider);
      return new Date(a.launchWindowStart).getTime() - new Date(b.launchWindowStart).getTime();
    });

    return result;
  }, [launches, search, selectedProvider, selectedStatus, sortBy]);

  const providers = ['ALL', 'SpaceX', 'Rocket Lab', 'NASA', 'ISRO', 'ULA', 'Arianespace'];
  const hasActiveFilters = search || selectedProvider !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '16px 16px 60px' }}>

      {/* Header */}
      <Header
        onSync={handleSync}
        syncing={syncing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={alerts.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSubscriptions={() => setIsSubscriptionModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* PWA Install Banner */}
      {deferredPrompt && (
        <div className="card-clean welcome-banner" style={{
          padding: '10px 16px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--accent-rocket-subtle)',
          borderColor: 'var(--accent-rocket)',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={15} color="var(--accent-rocket)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Install SpaceBot as an app for mobile push alerts & lock screen notifications
            </span>
          </div>
          <button className="btn btn-rocket" onClick={handleInstallPWA} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            Install App
          </button>
        </div>
      )}

      {/* One-Time Welcome Banner (replaces accordion, auto-dismisses) */}
      {showWelcome && (
        <div className="card-clean welcome-banner" style={{
          padding: '12px 16px',
          marginBottom: '14px',
          borderLeft: '3px solid var(--accent-rocket)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Sparkles size={16} color="var(--accent-rocket)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Welcome to SpaceBot 🚀
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Hit <strong>Sync</strong> to load the latest orbital launches. Click any mission card to explore it.{' '}
                <strong>T-0</strong> = exact liftoff moment.{' '}
                <strong>LEO</strong> = Low Earth Orbit (~200–2000 km). Green badge = confirmed launch.
              </p>
            </div>
          </div>
          <button
            onClick={dismissWelcome}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metrics Bar */}
      <MetricsCards metrics={metrics} />

      {/* Error Banner */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid var(--accent-danger)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.82rem',
          color: 'var(--accent-danger)',
        }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Main content */}
      {activeTab === 'history' ? (
        <AlertHistory alerts={alerts} />
      ) : (
        <>
          {/* ── Control Bar ─────────────────────────────────────────────── */}
          <div className="card-clean" style={{ padding: '12px 14px', marginBottom: '18px' }}>

            {/* Row 1: Search + Advanced Filters toggle */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ position: 'relative', flex: '1' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search missions, rockets, agencies..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 34px 8px 32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                    }}
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(v => !v)}
                className="btn btn-secondary"
                style={{
                  padding: '7px 12px',
                  fontSize: '0.78rem',
                  borderColor: showAdvancedFilters || hasActiveFilters ? 'var(--accent-primary)' : undefined,
                  color: showAdvancedFilters || hasActiveFilters ? 'var(--accent-primary)' : undefined,
                  flexShrink: 0,
                }}
                title="Advanced filters & sort"
              >
                <SlidersHorizontal size={13} />
                <span style={{ display: window.innerWidth > 480 ? 'inline' : 'none' }}>Filters</span>
                {hasActiveFilters && (
                  <span style={{
                    fontSize: '0.6rem', backgroundColor: 'var(--accent-primary)', color: '#fff',
                    padding: '1px 5px', borderRadius: '99px', fontWeight: 700,
                  }}>●</span>
                )}
                {showAdvancedFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Row 2: Agency pills (always visible) */}
            <div className="pill-scroll-container">
              {providers.map(p => {
                const count = p === 'ALL' ? launches.length : agencyCounts[p] || 0;
                const isSelected = selectedProvider === p;
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedProvider(p)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-rocket)' : 'var(--border-card)',
                      backgroundColor: isSelected ? 'var(--accent-rocket-subtle)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--accent-rocket)' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{p}</span>
                    <span style={{
                      fontSize: '0.62rem',
                      backgroundColor: isSelected ? 'var(--accent-rocket)' : 'var(--border-card)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      padding: '0 4px',
                      borderRadius: '99px',
                      fontWeight: 700,
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Row 3: Advanced Filters (collapsible) */}
            {showAdvancedFilters && (
              <div style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-divider)',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                flexWrap: 'wrap',
                animation: 'slideIn 0.2s ease',
              }}>
                {/* Status filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Status:
                  </span>
                  {['ALL', 'GO', 'TBD'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedStatus(s)}
                      style={{
                        padding: '3px 9px',
                        borderRadius: '5px',
                        fontSize: '0.71rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selectedStatus === s ? 'var(--accent-success)' : 'var(--border-card)',
                        backgroundColor: selectedStatus === s ? 'var(--accent-success-subtle)' : 'transparent',
                        color: selectedStatus === s ? 'var(--accent-success)' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {s === 'ALL' ? 'Any' : s}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUpDown size={12} color="var(--text-muted)" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      padding: '5px 9px',
                      fontSize: '0.77rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="soonest">Soonest liftoff</option>
                    <option value="name">Mission name A–Z</option>
                    <option value="provider">Agency name</option>
                  </select>
                </div>

                {/* Reset all filters */}
                {hasActiveFilters && (
                  <button
                    onClick={() => { setSearch(''); setSelectedProvider('ALL'); setSelectedStatus('ALL'); }}
                    className="btn btn-secondary"
                    style={{ padding: '4px 9px', fontSize: '0.72rem', marginLeft: 'auto' }}
                  >
                    <X size={11} /> Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Mission Grid ─────────────────────────────────────────────── */}
          {loading ? (
            <div className="card-clean" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Rocket
                size={38}
                color="var(--accent-rocket)"
                style={{ marginBottom: '14px', animation: 'pulse 1.6s infinite ease-in-out' }}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600 }}>
                Scanning orbital launch radar...
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '4px' }}>
                Fetching upcoming missions from the database
              </p>
            </div>
          ) : filteredAndSortedLaunches.length === 0 ? (
            <div className="card-clean" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Rocket size={38} color="var(--text-muted)" style={{ marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)', fontWeight: 700 }}>
                No missions found
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '16px', maxWidth: '340px', margin: '0 auto 16px' }}>
                {search
                  ? `No results for "${search}". Try a different search or clear the agency filter.`
                  : 'Click Sync to fetch the latest orbital launches from the external space API.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {search && (
                  <button className="btn btn-secondary" onClick={() => { setSearch(''); setSelectedProvider('ALL'); }}>
                    <X size={13} /> Clear filters
                  </button>
                )}
                <button className="btn btn-rocket" onClick={handleSync} disabled={syncing}>
                  <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                  {syncing ? 'Syncing...' : 'Sync Radar Now'}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="missions-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredAndSortedLaunches.map(launch => (
                <MissionCard
                  key={launch.id}
                  launch={launch}
                  onOpenAlertModal={l => setActiveLaunchForAlert(l)}
                  onToast={addToast}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {activeLaunchForAlert && (
        <AlertModal
          launch={activeLaunchForAlert}
          onClose={() => setActiveLaunchForAlert(null)}
          onAlertPublished={handleAlertPublished}
          onToast={addToast}
        />
      )}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={u => setUser(u)}
          onToast={addToast}
        />
      )}
      {isSubscriptionModalOpen && (
        <SubscriptionModal
          user={user}
          onClose={() => setIsSubscriptionModalOpen(false)}
          onUpdateUser={u => setUser(u)}
          onToast={addToast}
          onOpenAuth={() => {
            setIsSubscriptionModalOpen(false);
            setIsAuthModalOpen(true);
          }}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
