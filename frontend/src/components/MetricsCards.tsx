import React from 'react';
import type { SystemMetrics } from '../types';
import { Satellite, Clock, Globe2, Share2 } from 'lucide-react';

interface MetricsProps {
  metrics: SystemMetrics | null;
}

export const MetricsCards: React.FC<MetricsProps> = ({ metrics }) => {
  return (
    <div
      className="metrics-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '18px',
      }}
    >
      <div className="card-clean" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'var(--accent-primary-subtle)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Satellite size={19} />
        </div>
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, marginBottom: '2px' }}>
            Tracked
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>
            {metrics ? metrics.totalTracked : '—'}
          </div>
        </div>
      </div>

      <div className="card-clean" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'var(--accent-rocket-subtle)',
          color: 'var(--accent-rocket)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Clock size={19} />
        </div>
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, marginBottom: '2px' }}>
            Next Up
          </div>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--accent-rocket)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {metrics?.nextLaunchName || 'Scanning...'}
          </div>
        </div>
      </div>

      <div className="card-clean" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'var(--accent-success-subtle)',
          color: 'var(--accent-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Globe2 size={19} />
        </div>
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, marginBottom: '2px' }}>
            Agencies
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>
            {metrics ? metrics.activeAgencies : '—'}
          </div>
        </div>
      </div>

      <div className="card-clean" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'var(--accent-warning-subtle)',
          color: 'var(--accent-warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Share2 size={19} />
        </div>
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, marginBottom: '2px' }}>
            Alerts Logged
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>
            {metrics ? metrics.totalAlertsSent : '0'}
          </div>
        </div>
      </div>
    </div>
  );
};
