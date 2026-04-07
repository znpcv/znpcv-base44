import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntitlement } from '@/hooks/useEntitlement';
import { useLanguage } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { Lock, ArrowRight } from 'lucide-react';

export default function PremiumPageWrapper({ children }) {
  const { loading, entitled, isAdmin, status } = useEntitlement();
  const { darkMode } = useLanguage();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className={`w-10 h-10 border-2 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-white' : 'border-zinc-900'}`} />
      </div>
    );
  }

  if (entitled || isAdmin) {
    return <>{children}</>;
  }

  // Network/server error — do not show upgrade wall, show retry instead
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
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold tracking-widest text-sm transition-all mb-3 ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
          >
            NEU LADEN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
      <div className={`max-w-sm w-full text-center p-8 rounded-2xl border-2 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <Lock className={`w-7 h-7 ${darkMode ? 'text-zinc-300' : 'text-zinc-600'}`} />
        </div>
        <div className={`text-xs tracking-widest mb-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>ZNPCV FULL ACCESS</div>
        <h2 className="text-xl tracking-wider mb-3">Zugriff gesperrt</h2>
        <p className={`text-sm font-sans mb-7 leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Dieser Bereich erfordert ZNPCV Full Access.<br />
          Einmalige Zahlung — kein Ablaufdatum.
        </p>
        <button
          onClick={() => navigate(createPageUrl('Upgrade'))}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold tracking-widest text-sm transition-all group mb-3 ${darkMode ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
        >
          FREISCHALTEN
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => navigate(-1)}
          className={`text-xs font-sans ${darkMode ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-600'} transition-colors`}
        >
          Zurück
        </button>
      </div>
    </div>
  );
}