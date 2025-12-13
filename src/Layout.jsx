import React from 'react';
import { LanguageProvider } from './components/LanguageContext';
import ScrollToTop from './components/ScrollToTop';

export default function Layout({ children, currentPageName }) {


  return (
    <LanguageProvider>
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
        `}
      </style>
      <div className="min-h-screen bg-black">
        {children}
      </div>
    </LanguageProvider>
  );
}