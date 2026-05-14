import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAnalytics } from './lib/analytics';

// Initialize analytics (no-op on web, native-only)
initAnalytics();

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('[SnapDex] Could not find #root element — cannot mount React app.');
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
