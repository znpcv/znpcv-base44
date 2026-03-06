import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './components/LanguageContext';
import ScrollToTop from './components/ScrollToTop';
import QueryClientProvider from './components/QueryClientProvider';
import OfflineManager from './components/offline/OfflineManager';
import ServiceWorkerRegistration from './components/offline/ServiceWorkerRegistration';
import PWAInstallBanner from './components/pwa/PWAInstallBanner';
import PushOptInModal from './components/pwa/PushOptInModal';
import { base44 } from './api/base44Client';

const PUSH_PROMPT_DELAY_MS = 90000; // 90s after login, value-first
const LS_KEY_PUSH_DISMISSED = 'znpcv_push_pre_dismissed_at';
const PUSH_COOLDOWN_DAYS = 14;

function PushOptInTrigger({ darkMode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed recently
    const dismissedAt = localStorage.getItem(LS_KEY_PUSH_DISMISSED);
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < PUSH_COOLDOWN_DAYS) return;
    }

    // Only show if permission not yet decided
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;

    const timer = setTimeout(async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const user = await base44.auth.me();
        if (!user.push_opted_in_at && !user.browser_notifications_enabled) {
          setShow(true);
        }
      } catch {}
    }, PUSH_PROMPT_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;
  return <PushOptInModal darkMode={darkMode} onClose={() => setShow(false)} />;
}

export default function Layout({ children, currentPageName }) {
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('znpcv_dark_mode') !== 'false'; } catch { return true; }
  });

  useEffect(() => {
    const handler = () => {
      try { setDarkMode(localStorage.getItem('znpcv_dark_mode') !== 'false'); } catch {}
    };
    window.addEventListener('storage', handler);
    // Poll for dark mode changes from LanguageContext
    const interval = setInterval(() => {
      try {
        const dm = localStorage.getItem('znpcv_dark_mode');
        setDarkMode(dm !== 'false');
      } catch {}
    }, 1000);
    return () => { window.removeEventListener('storage', handler); clearInterval(interval); };
  }, []);

  return (
    <LanguageProvider>
      <QueryClientProvider>
        <OfflineManager>
          <ServiceWorkerRegistration />
          <ScrollToTop />
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');

          * {
            font-family: 'Bebas Neue', sans-serif;
          }

          input, textarea, select {
            font-family: 'Inter', sans-serif;
          }

          .font-sans {
            font-family: 'Inter', sans-serif;
          }

          /* Mobile Touch Optimizations */
          .touch-manipulation {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          /* Safe Area for iOS */
          .safe-area-inset-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }

          /* Smooth Scrolling */
          html {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }
        `}
      </style>
      <div className="min-h-screen bg-black">
        {children}
      </div>
      </OfflineManager>
      </QueryClientProvider>
      </LanguageProvider>
      );
      }