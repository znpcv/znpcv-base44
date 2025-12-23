import React, { useEffect } from 'react';
import { LanguageProvider } from './components/LanguageContext';
import ScrollToTop from './components/ScrollToTop';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.log('Service Worker registration failed', err));
    }
  }, []);

  return (
    <LanguageProvider>
      <ScrollToTop />
      <PWAInstallPrompt />
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
        `}
      </style>
      <div className="min-h-screen bg-black">
        {children}
      </div>
    </LanguageProvider>
  );
}