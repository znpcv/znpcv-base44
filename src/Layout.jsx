import React from 'react';
import { LanguageProvider } from './components/LanguageContext';

export default function Layout({ children }) {
  React.useEffect(() => {
    // Load Trustpilot widget script
    const script = document.createElement('script');
    script.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <LanguageProvider>
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