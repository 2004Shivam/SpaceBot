import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { api } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { X, Rocket, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  onToast,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Real Google OAuth handler ─────────────────────────────────────────────
  // GoogleLogin calls this with a verified credential (signed JWT) from Google's popup.
  // We forward it to our backend which uses GoogleJsonWebSignature.ValidateAsync() to verify.
  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      onToast('Google sign-in failed — no credential received.', 'error');
      return;
    }
    try {
      setLoading(true);
      const user = await api.googleAuth(credentialResponse.credential);
      onToast(`Welcome, ${user.name}! 🚀`, 'success');
      onSuccess(user);
      onClose();
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

  // ── Guest access handler (clearly labelled, no OAuth) ─────────────────────
  const handleGuestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      onToast('Please enter an email address.', 'error');
      return;
    }
    try {
      setLoading(true);
      const user = await api.guestLogin(email, name || 'Space Explorer');
      onToast(`Welcome aboard, ${user.name}!`, 'success');
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.error('Guest login error:', err);
      onToast('Could not create guest session. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="card-clean" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '28px 24px',
        position: 'relative',
        backgroundColor: 'var(--bg-modal)',
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            backgroundColor: 'var(--accent-rocket-subtle)',
            color: 'var(--accent-rocket)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <Rocket size={26} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Sign in to SpaceBot
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Save your agency subscriptions and receive launch alerts across all your devices.
          </p>
        </div>

        {/* ── Real Google Sign-In Button ─────────────────────────────────────── */}
        {/* GoogleLogin renders Google's official button and handles the OAuth popup. */}
        {/* On success, Google calls handleGoogleSuccess with a signed JWT credential. */}
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'center' }}>
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

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-divider)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            or continue as guest
          </span>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-divider)' }} />
        </div>

        {/* ── Guest Access Form ───────────────────────────────────────────────── */}
        {/* No Google OAuth — just a name+email session stored in our DB. */}
        {/* Clearly labelled so there's no confusion about what this is. */}
        <form onSubmit={handleGuestSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Shepard"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '7px',
                backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)',
                color: 'var(--text-primary)', fontSize: '0.84rem', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              Email Address <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <input
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '7px',
                backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-card)',
                color: 'var(--text-primary)', fontSize: '0.84rem', outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={loading}
            style={{ marginTop: '4px', padding: '9px 14px', justifyContent: 'center' }}
          >
            <UserIcon size={14} />
            <span>{loading ? 'Signing in...' : 'Continue as Guest'}</span>
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Guest sessions save preferences to our database but are not verified by Google.
          </p>
        </form>
      </div>
    </div>
  );
};
