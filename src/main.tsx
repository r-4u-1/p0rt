import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ServicesProvider } from '@/services/ServicesContext';
import { initialiseMotion } from '@/motion/motionPreference';
import './styles/global.css';

// Before the first paint: a visitor who turned motion off should not get
// one frame of it on every load.
initialiseMotion();

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing from index.html.');

createRoot(container).render(
  <StrictMode>
    <ServicesProvider>
      <App />
    </ServicesProvider>
  </StrictMode>,
);
