import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import './App.css'
import App from './App.tsx'

// VITE_GOOGLE_CLIENT_ID is set in .env.local (local) or as an environment variable on Render (production)
// See: https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '669470643085-u1otmvk8h1v885ln8ig71p12fd2p6ld0.apps.googleusercontent.com';

if (!googleClientId) {
  console.warn(
    '[SpaceBot] ⚠️ VITE_GOOGLE_CLIENT_ID not configured.'
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
