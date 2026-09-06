import React from 'react';
import { ShieldCheck, Rocket, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px 80px',
      color: 'var(--text-primary)',
      lineHeight: 1.7,
    }}>
      <a
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--accent-rocket)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} /> Back to SpaceBot
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: 'var(--accent-rocket-subtle)',
          color: 'var(--accent-rocket)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Rocket size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>
            SpaceBot Privacy Policy
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Effective Date: September 2026
          </p>
        </div>
      </div>

      <div className="card-clean" style={{
        padding: '28px 24px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        marginTop: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShieldCheck size={20} color="#10b981" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Our Commitment to Your Privacy</h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          SpaceBot is an orbital launch tracking and telemetry dashboard. We respect your privacy and are committed to protecting the limited personal information you share with us.
        </p>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '20px', marginBottom: '8px' }}>
          1. Information We Collect
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          When you authenticate using Google Sign-In, we receive basic profile details authorized by you through Google Identity Services:
        </p>
        <ul style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', paddingLeft: '20px', marginBottom: '20px' }}>
          <li><strong>Full Name & Email Address:</strong> Used to identify your user profile and link your agency notification preferences.</li>
          <li><strong>Profile Picture URL:</strong> Used solely to display your avatar in the Mission Control navigation bar.</li>
          <li><strong>Agency Subscriptions:</strong> Space agencies (e.g. SpaceX, NASA, ISRO) you choose to follow for launch alerts.</li>
        </ul>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '20px', marginBottom: '8px' }}>
          2. How We Use Information
        </h3>
        <ul style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', paddingLeft: '20px', marginBottom: '20px' }}>
          <li>To authenticate and maintain your active session across devices.</li>
          <li>To dispatch real-time web push notifications when launches from your subscribed agencies approach liftoff.</li>
          <li>We do <strong>not</strong> sell, rent, monetize, or share your personal data with third-party advertisers.</li>
        </ul>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '20px', marginBottom: '8px' }}>
          3. Data Security & Storage
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Authentication tokens are verified using Google's cryptographic RSA signatures (Google OAuth 2.0). User preferences are stored in our secure database. You may sign out at any time to terminate your local session.
        </p>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '20px', marginBottom: '8px' }}>
          4. Contact Us
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          If you have any questions or requests regarding your data, please contact the developer at: <strong>shivamyadav69998@gmail.com</strong>.
        </p>
      </div>
    </div>
  );
};
