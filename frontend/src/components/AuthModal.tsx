import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { api } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { X, Rocket, ShieldCheck } from 'lucide-react';

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
  const [, setLoading] = useState(false);

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

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="card-clean" style={{
        maxWidth: '380px',
        width: '100%',
        padding: '32px 24px',
        position: 'relative',
        backgroundColor: 'var(--bg-modal)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: '16px',
        border: '1px solid var(--border-card)',
        animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        textAlign: 'center',
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

        {/* Brand Icon */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '16px',
          backgroundColor: 'var(--accent-rocket-subtle)',
          color: 'var(--accent-rocket)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '14px',
        }}>
          <Rocket size={28} />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Mission Control Access
        </h2>
        <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          Sign in with your verified Google account to unlock live telemetry, orbital countdowns, and launch alert dispatches.
        </p>

        {/* Real Google Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="320"
          />
        </div>

        {/* Security badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: 'var(--bg-tag)',
          border: '1px solid var(--border-card)',
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>OAuth 2.0 Encrypted • Cryptographic JWT Verification</span>
        </div>
      </div>
    </div>
  );
};
