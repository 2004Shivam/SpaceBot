import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { api } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { Rocket, ShieldCheck, Lock, Bell, Radio, Clock, Orbit, CheckCircle2 } from 'lucide-react';

interface GatekeeperLandingProps {
  onSuccess: (user: UserProfile) => void;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const GatekeeperLanding: React.FC<GatekeeperLandingProps> = ({
  onSuccess,
  onToast,
}) => {
  const [, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      onToast('Google sign-in failed — no credential received.', 'error');
      return;
    }
    try {
      setLoading(true);
      const user = await api.googleAuth(credentialResponse.credential);
      onToast(`Welcome, ${user.name}! Telemetry Unlocked 🚀`, 'success');
      onSuccess(user);
    } catch (err: any) {
      console.error('Google auth error:', err);
      onToast(err.message || 'Sign-in failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    onToast('Google sign-in was cancelled or blocked. Check your browser settings.', 'error');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '30px 16px 60px',
      maxWidth: '920px',
      margin: '0 auto',
      textAlign: 'center',
    }}>
      {/* Pilot Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        borderRadius: '999px',
        backgroundColor: 'var(--accent-rocket-subtle)',
        border: '1px solid var(--accent-rocket)',
        color: 'var(--accent-rocket)',
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(201, 79, 12, 0.15)',
      }}>
        <Radio size={14} style={{ animation: 'pulse 2s infinite' }} />
        <span>Restricted Mission Control • Authentication Required</span>
      </div>

      {/* Hero Headline */}
      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3.2rem)',
        fontWeight: 900,
        lineHeight: 1.15,
        letterSpacing: '-1px',
        color: 'var(--text-primary)',
        marginBottom: '16px',
        maxWidth: '780px',
      }}>
        Orbital Launch Telemetry & Mission Dispatcher
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        maxWidth: '640px',
        marginBottom: '36px',
      }}>
        Live rocket countdown windows, orbital telemetry, webcast streams, and mobile push notifications require authenticated Google credentials.
      </p>

      {/* Central Login Card */}
      <div className="card-clean" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px 28px',
        borderRadius: '20px',
        border: '1px solid var(--border-card)',
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow-lg)',
        marginBottom: '44px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--accent-rocket-subtle)',
          color: 'var(--accent-rocket)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Rocket size={30} />
        </div>

        <h2 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}>
          Sign in to Enter SpaceBot
        </h2>
        <p style={{
          fontSize: '0.84rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '22px',
        }}>
          One-click Google authentication unlocks live telemetry and saves your personalized agency alert subscriptions.
        </p>

        {/* Real Google Login Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="340"
          />
        </div>

        {/* Perks Checklist */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          textAlign: 'left',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-surface)',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid var(--border-divider)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Sub-second live T-0 countdown clocks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Mobile lock screen push alerts for SpaceX, NASA, ISRO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Live launch pad telemetry & webcast streams</span>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>OAuth 2.0 Verified • Cryptographic Signature Validation</span>
        </div>
      </div>

      {/* Section Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        maxWidth: '700px',
        marginBottom: '28px',
      }}>
        <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-divider)' }} />
        <span style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          Locked Mission Features Preview
        </span>
        <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-divider)' }} />
      </div>

      {/* 4 Teaser Locked Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        width: '100%',
        maxWidth: '860px',
      }}>
        {/* Card 1 */}
        <div className="card-clean" style={{
          padding: '20px 16px',
          textAlign: 'left',
          position: 'relative',
          opacity: 0.85,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: 'var(--bg-tag)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}>
              <Orbit size={18} />
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-warning)',
              backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '2px 8px', borderRadius: '99px',
            }}>
              <Lock size={10} /> Locked
            </span>
          </div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Live Orbital Radar
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Active mission telemetry tracking across LEO, GTO, SSO, and Lunar trajectories.
          </p>
        </div>

        {/* Card 2 */}
        <div className="card-clean" style={{
          padding: '20px 16px',
          textAlign: 'left',
          position: 'relative',
          opacity: 0.85,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: 'var(--bg-tag)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-rocket)',
            }}>
              <Clock size={18} />
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-warning)',
              backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '2px 8px', borderRadius: '99px',
            }}>
              <Lock size={10} /> Locked
            </span>
          </div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Microsecond Telemetry
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Sub-second countdown clocks, launch window shifts, and hold detection.
          </p>
        </div>

        {/* Card 3 */}
        <div className="card-clean" style={{
          padding: '20px 16px',
          textAlign: 'left',
          position: 'relative',
          opacity: 0.85,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: 'var(--bg-tag)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#10b981',
            }}>
              <Bell size={18} />
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-warning)',
              backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '2px 8px', borderRadius: '99px',
            }}>
              <Lock size={10} /> Locked
            </span>
          </div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Mobile Lock Screen Push
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Receive push notifications on iOS and Android before main engine ignition.
          </p>
        </div>

        {/* Card 4 */}
        <div className="card-clean" style={{
          padding: '20px 16px',
          textAlign: 'left',
          position: 'relative',
          opacity: 0.85,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: 'var(--bg-tag)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8b5cf6',
            }}>
              <Rocket size={18} />
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-warning)',
              backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '2px 8px', borderRadius: '99px',
            }}>
              <Lock size={10} /> Locked
            </span>
          </div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Multi-Agency Hub
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Tailor telemetry to SpaceX, NASA, ISRO, Rocket Lab, ESA, and commercial flights.
          </p>
        </div>
      </div>
    </div>
  );
};
