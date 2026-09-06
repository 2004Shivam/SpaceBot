import React from 'react';
import type { AlertLog } from '../types';
import { History, CheckCircle2, ExternalLink } from 'lucide-react';

interface AlertHistoryProps {
  alerts: AlertLog[];
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="card-clean" style={{ padding: '50px 20px', textAlign: 'center' }}>
        <History size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>No Broadcasts Sent Yet</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '380px', margin: '0 auto' }}>
          Select an upcoming mission from the radar and dispatch an automated launch alert to log it here.
        </p>
      </div>
    );
  }

  return (
    <div className="card-clean" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <History size={20} color="var(--accent-rocket)" />
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Dispatched Alerts & Social Log (SQL Persisted)
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-go">
                  <CheckCircle2 size={11} /> {alert.status}
                </span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {alert.launchName}
                </strong>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {new Date(alert.createdAt).toLocaleString()}
              </span>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              borderLeft: '3px solid var(--accent-rocket)',
            }}>
              {alert.tweetText}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                className="btn btn-x"
                style={{ padding: '4px 9px', fontSize: '0.72rem' }}
                onClick={() => {
                  const encoded = encodeURIComponent(alert.tweetText);
                  window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
                }}
              >
                <ExternalLink size={11} /> Re-open on X
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
