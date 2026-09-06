import React, { useState } from 'react';
import type { Launch, AlertLog } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { X, Send, Copy, ExternalLink, Check, Sparkles, Wand2 } from 'lucide-react';

interface AlertModalProps {
  launch: Launch;
  onClose: () => void;
  onAlertPublished: (alert: AlertLog) => void;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  launch,
  onClose,
  onAlertPublished,
  onToast,
}) => {
  const templates = {
    hype: `🚀 LIFTOFF ALERT! The ${launch.rocketName} is GO for launch with mission "${launch.name}"!\n\n🏢 Operator: ${launch.launchProvider}\n📍 Pad: ${launch.padName || launch.location}\n🕒 Liftoff: ${new Date(launch.launchWindowStart).toUTCString()}\n\nWatch the sky! #SpaceX #RocketLaunch #SpaceBot`,
    technical: `📊 MISSION TELEMETRY:\n• Mission: ${launch.name}\n• Vehicle: ${launch.rocketName}\n• Operator: ${launch.launchProvider}\n• Target Orbit: ${launch.orbit || 'LEO'}\n• Pad: ${launch.padName || launch.location}\n\nTracked via #SpaceBot #OrbitalScience`,
    countdown: `⏰ T-MINUS COUNTDOWN UNDERWAY!\n\n${launch.launchProvider}'s ${launch.rocketName} is rolling out for "${launch.name}".\nScheduled liftoff: ${new Date(launch.launchWindowStart).toLocaleDateString()} (Local).\n\n#SpaceNews #${launch.launchProvider.replace(/\s+/g, '')} #SpaceBot`,
  };

  const [activePreset, setActivePreset] = useState<'hype' | 'technical' | 'countdown'>('hype');
  const [tweetText, setTweetText] = useState(templates.hype);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const charCount = tweetText.length;
  const isOverLimit = charCount > 280;

  const handleSelectPreset = (preset: 'hype' | 'technical' | 'countdown') => {
    setActivePreset(preset);
    setTweetText(templates[preset]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tweetText);
    setCopied(true);
    onToast('Copied alert to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenX = () => {
    const encoded = encodeURIComponent(tweetText);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
    onToast('Opened X compose window!', 'info');
  };

  const handleSaveToDatabase = async () => {
    try {
      setSubmitting(true);
      const result = await api.publishAlert(launch.id, tweetText, true);
      
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#ea580c', '#10b981']
      });

      onToast('✓ Launch alert broadcasted & saved in SQL!', 'success');
      onAlertPublished(result);
    } catch (err) {
      console.error(err);
      onToast('Failed to record alert in database.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="card-clean" style={{
        maxWidth: '540px',
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
          <Sparkles size={18} color="var(--accent-rocket)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Compose Launch Alert for X
          </h2>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Target: <strong>{launch.name}</strong> ({launch.rocketName})
        </p>

        {/* 1-Click Tone Presets */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Wand2 size={12} color="var(--accent-primary)" /> Choose a 1-click tone:
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleSelectPreset('hype')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activePreset === 'hype' ? 'var(--accent-rocket)' : 'var(--border-card)',
                backgroundColor: activePreset === 'hype' ? 'var(--accent-rocket-subtle)' : 'var(--bg-surface)',
                color: activePreset === 'hype' ? 'var(--accent-rocket)' : 'var(--text-secondary)',
              }}
            >
              🚀 Hype
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('technical')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activePreset === 'technical' ? 'var(--accent-primary)' : 'var(--border-card)',
                backgroundColor: activePreset === 'technical' ? 'var(--accent-primary-subtle)' : 'var(--bg-surface)',
                color: activePreset === 'technical' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              📊 Technical
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('countdown')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activePreset === 'countdown' ? 'var(--accent-success)' : 'var(--border-card)',
                backgroundColor: activePreset === 'countdown' ? 'var(--accent-success-subtle)' : 'var(--bg-surface)',
                color: activePreset === 'countdown' ? 'var(--accent-success)' : 'var(--text-secondary)',
              }}
            >
              ⏰ Countdown
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <textarea
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-input)',
              border: `1px solid ${isOverLimit ? 'var(--accent-danger)' : 'var(--border-card)'}`,
              borderRadius: '8px',
              padding: '12px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-primary)',
              fontSize: '0.86rem',
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
            }}
          />
          {/* Character counter */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: isOverLimit ? 'var(--accent-danger)' : charCount > 240 ? 'var(--accent-warning)' : 'var(--text-muted)',
          }}>
            {charCount} / 280
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button className="btn btn-secondary" onClick={handleCopy} style={{ flex: '1 1 auto' }}>
            {copied ? <Check size={14} color="var(--accent-success)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button className="btn btn-x" onClick={handleOpenX} style={{ flex: '1 1 auto' }}>
            <ExternalLink size={14} />
            <span>Open in X</span>
          </button>

          <button
            className="btn btn-rocket"
            onClick={handleSaveToDatabase}
            disabled={submitting || isOverLimit}
            style={{ opacity: isOverLimit ? 0.5 : 1, flex: '1 1 100%' }}
          >
            <Send size={14} />
            <span>{submitting ? 'Broadcasting...' : 'Broadcast & Save to DB'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
