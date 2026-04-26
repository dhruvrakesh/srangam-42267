import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/i18n'
import { getPublicConfig } from './lib/publicConfig'

// Warm the public-config cache (Mapbox token, etc.) before the first map renders.
// Non-blocking — the call resolves into sessionStorage so subsequent renders see it.
void getPublicConfig();

createRoot(document.getElementById("root")!).render(<App />);
