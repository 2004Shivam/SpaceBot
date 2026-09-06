import React, { useState } from 'react';
import type { Launch } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { MapPin, Navigation, Share2, CheckCircle2, ShieldAlert, Calendar, Tv, ChevronDown, ChevronUp } from 'lucide-react';

interface MissionCardProps {
  launch: Launch;
  onOpenAlertModal: (launch: Launch) => void;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  launch,
  onOpenAlertModal,
  onToast,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const isGo = launch.status.toLowerCase().includes('go') || launch.status.toLowerCase().includes('success');

  // Human-friendly local time format
  const formatLocalDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const isTomorrow = date.toDateString() === tomorrow.toDateString();

      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isToday) return `Today at ${timeStr}`;
      if (isTomorrow) return `Tomorrow at ${timeStr}`;

      const dateStr = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      return `${dateStr} • ${timeStr}`;
    } catch {
      return isoString;
    }
  };

  // Plain-English Mission Purpose
  const getMissionSummary = () => {
    const text = (launch.name + ' ' + launch.missionDescription).toLowerCase();
    if (text.includes('starlink')) return 'Deploying broadband communication satellites into low orbit.';
    if (text.includes('test flight') || text.includes('integrated flight')) return 'Heavy rocket flight test evaluating booster recovery and orbital maneuvers.';
    if (text.includes('observation') || text.includes('earth') || text.includes('imaging')) return 'Deploying Earth observation imaging satellites for commercial analysis.';
    if (text.includes('proba') || text.includes('solar') || text.includes('science')) return 'Solar research satellites studying coronagraph and astrophysics.';
    if (text.includes('cert')) return 'Orbital certification flight validating next-gen engine thrust.';
    return launch.missionDescription || 'Commercial satellite deployment to orbital station.';
  };

  const getMissionTag = () => {
    const text = (launch.name + ' ' + launch.missionDescription).toLowerCase();
    if (text.includes('starlink')) return '📡 Broadband';
    if (text.includes('test flight') || text.includes('integrated flight') || text.includes('cert')) return '🚀 Flight Test';
    if (text.includes('observation') || text.includes('earth')) return '🌍 Earth Imaging';
    if (text.includes('proba') || text.includes('science')) return '🔬 Science';
    return '🛰️ Payload';
  };

  const handleAddToCalendar = () => {
    try {
      const start = new Date(launch.launchWindowStart);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
      const details = encodeURIComponent(`${launch.missionDescription}\n\nOperator: ${launch.launchProvider}\nRocket: ${launch.rocketName}\nPad: ${launch.padName}`);
      const loc = encodeURIComponent(launch.padName || launch.location);
      const title = encodeURIComponent(`Space Launch: ${launch.rocketName} | ${launch.name}`);

      const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${loc}`;
      window.open(calUrl, '_blank');
      onToast('Opening Google Calendar event', 'info');
    } catch {
      onToast('Could not open calendar.', 'error');
    }
  };

  const handleWatchStream = () => {
    if (launch.webcastUrl) {
      window.open(launch.webcastUrl, '_blank');
    } else {
      const query = encodeURIComponent(`${launch.launchProvider} ${launch.name} launch live stream`);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }
  };

  return (
    <div className="card-clean" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Visual Top: Banner Image if available or clean brand strip */}
      <div style={{
        height: '110px',
        width: '100%',
        position: 'relative',
        backgroundColor: 'var(--bg-surface)',
        backgroundImage: launch.imageUrl ? `url(${launch.imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--border-card)',
      }}>
        {/* Subtle overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)',
        }} />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span className="badge badge-agency" style={{ background: 'rgba(0,0,0,0.75)', color: '#ffffff' }}>
            {launch.launchProvider}
          </span>

          <span className={`badge ${isGo ? 'badge-go' : 'badge-tbd'}`} style={{ background: 'rgba(0,0,0,0.8)' }}>
            {isGo ? <CheckCircle2 size={11} /> : <ShieldAlert size={11} />}
            {launch.status}
          </span>
        </div>

        {/* Rocket Name & Category Tag */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.86rem',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}>
          <span>🚀 {launch.rocketName}</span>
          <span style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.6)', padding: '2px 7px', borderRadius: '4px' }}>
            {getMissionTag()}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Mission Title */}
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          marginBottom: '6px',
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}>
          {launch.name}
        </h3>

        {/* Human-Readable Date & Countdown Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '10px',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-rocket)' }}>
            📅 {formatLocalDate(launch.launchWindowStart)}
          </div>
          <CountdownTimer targetDate={launch.launchWindowStart} />
        </div>

        {/* 1-Sentence Auto-Understanding Summary */}
        <p style={{
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          marginBottom: '10px',
        }}>
          {getMissionSummary()}
        </p>

        {/* Collapsible Telemetry / Tech Details */}
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0',
            }}
          >
            <span>{showDetails ? 'Hide technical specs' : 'View pad & orbit specs'}</span>
            {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showDetails && (
            <div style={{
              marginTop: '8px',
              padding: '8px 10px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              fontSize: '0.76rem',
              border: '1px solid var(--border-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Navigation size={12} color="var(--accent-primary)" />
                <span style={{ color: 'var(--text-muted)' }}>Orbit:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{launch.orbit || 'LEO'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={12} color="var(--accent-rocket)" />
                <span style={{ color: 'var(--text-muted)' }}>Launch Pad:</span>
                <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                  {launch.padName || launch.location}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-divider)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {/* Quick Livestream search */}
          <button
            onClick={handleWatchStream}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            title="Watch live stream broadcast"
          >
            <Tv size={13} color="var(--accent-danger)" />
            <span>Watch</span>
          </button>

          {/* Add to Google Calendar */}
          <button
            onClick={handleAddToCalendar}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            title="Add reminder to Google Calendar"
          >
            <Calendar size={13} color="var(--accent-success)" />
            <span>Calendar</span>
          </button>

          {/* Social Alert Button */}
          {launch.hasAlertSent ? (
            <span className="badge badge-alert-sent" style={{ marginLeft: 'auto' }}>
              <CheckCircle2 size={12} /> Logged
            </span>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => onOpenAlertModal(launch)}
              style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <Share2 size={13} />
              <span>Alert to X</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
