import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ServicesProvider } from '@/services/ServicesContext';
import { initialiseMotion } from '@/motion/motionPreference';
import { initialiseLanguage } from '@/i18n/languagePreference';
import './styles/global.css';

// Before the first paint: a visitor who turned motion off should not get
// one frame of it on every load, and a visitor who chose Swedish should not
// get an English tab title and an en lang attribute until React mounts.
initialiseMotion();
initialiseLanguage();

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing from index.html.');

createRoot(container).render(
  <StrictMode>
    <ServicesProvider>
      <App />
    </ServicesProvider>
  </StrictMode>,
);
