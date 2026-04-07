/**
 * PremiumPageWrapper — schützt App-Seiten.
 * Nutzer ohne Zugang werden auf /Access weitergeleitet, nicht inline geblockt.
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntitlement } from '@/hooks/useEntitlement';
import { useLanguage } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';

export default function PremiumPageWrapper({ children }) {
  const { loading, entitled, isAdmin, status } = useEntitlement();
  const { darkMode } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !entitled && !isAdmin) {
      // Network/server errors get a reload screen instead of redirect
      if (status !== 'network_error' && status !== 'error') {
        navigate(createPageUrl('Access'), { replace: true });
      }
    }
  }, [loading, entitled, isAdmin, status, navigate]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className={`w-10 h-10 border-2 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-white' : 'border-zinc-900'}`} />
      </div>
    );
  }

  // Network/server error — show retry, not redirect
  if (status === 'network_error' || status === 'error') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
        <div className={`max-w-sm w-full text-center p-8 rounded-2xl border-2 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
          <h2 className="text-xl tracking-wider mb-3">Verbindungsfehler</h2>
          <p className={`text-sm font-sans mb-7 leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Die Zugriffsprüfung konnte nicht abgeschlossen werden. Bitte Seite neu laden.
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`w-full py-3.5 rounded-xl font-bold tracking-widest text-sm transition-all ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
          >
            NEU LADEN
          </button>
        </div>
      </div>
    );
  }

  // Prevent content flash while redirect is in progress
  if (!entitled && !isAdmin) return null;

  return <>{children}</>;
}