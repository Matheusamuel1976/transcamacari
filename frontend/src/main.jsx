import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TransitionProvider } from './motion/TransitionContext';

gsap.registerPlugin(ScrollTrigger);
import App from './App';
import 'leaflet/dist/leaflet.css';
import './styles/global.css';
import './styles/design-system.css';
import './styles/editorial.css';
import './motion/motion.css';

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    try {
      ScrollTrigger.refresh();
    } catch {}
    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          try {
            ScrollTrigger.refresh();
          } catch {}
        })
        .catch(() => {});
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <TransitionProvider>
        <App />
      </TransitionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
