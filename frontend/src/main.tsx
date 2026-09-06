import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import './App.css'
import App from './App.tsx'

// VITE_GOOGLE_CLIENT_ID is set in .env.local (local) or as an environment variable on Render (production)
// See: https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

if (!googleClientId || googleClientId === 'PASTE_YOUR_GOOGLE_CLIENT_ID_HERE') {
  console.warn(
    '[SpaceBot] ⚠️ VITE_GOOGLE_CLIENT_ID not set in .env.local. ' +
    'Google Sign-In will not work until you add a valid Client ID. ' +
    'See frontend/.env.local for instructions.'
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
