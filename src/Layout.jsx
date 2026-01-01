import React, { useEffect } from 'react';
import { LanguageProvider } from './components/LanguageContext';
import ScrollToTop from './components/ScrollToTop';
import QueryClientProvider from './components/QueryClientProvider';
import OfflineManager from './components/offline/OfflineManager';
import ServiceWorkerRegistration from './components/offline/ServiceWorkerRegistration';

export default function Layout({ children, currentPageName }) {

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