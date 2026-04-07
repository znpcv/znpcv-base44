/**
 * PremiumPageWrapper — Full-page entitlement guard.
 * Wraps an entire page: shows spinner while checking,
 * redirects to /Upgrade if not entitled.
 *
 * Security boundary note:
 * This is a CLIENT-SIDE guard. It protects the UI and prevents
 * casual access. Real enforcement is server-side via:
 *   - checkEntitlement backend function (cryptographic, DB-backed)
 *   - Entity RLS (TradeChecklist, NoTradeLog) enforced by Base44 platform
 * A determined user who manipulates localStorage cannot bypass the
 * backend function or RLS rules — only the UI would be visible,
 * all API calls would still be rejected by the server.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntitlement } from '@/hooks/useEntitlement';
import { useLanguage } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { Lock, Zap, ArrowRight } from 'lucide-react';

export default function PremiumPageWrapper({ children }) {
  const { loading, entitled, isAdmin } = useEntitlement();
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

  // Not entitled — full-page upgrade wall
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
      <div className={`max-w-sm w-full text-center p-8 rounded-3xl border-2 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <Lock className={`w-8 h-8 ${darkMode ? 'text-zinc-300' : 'text-zinc-600'}`} />
        </div>
        <div className={`text-xs tracking-widest mb-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>PREMIUM ACCESS</div>
        <h2 className="text-2xl tracking-wider mb-3">ZNPCV Full Access</h2>
        <p className={`text-sm font-sans mb-7 leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Diese Funktion erfordert ZNPCV Full Access.<br />
          Einmalige Zahlung — dauerhafter Zugriff.
        </p>
        <button
          onClick={() => navigate(createPageUrl('Upgrade'))}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl font-bold tracking-widest text-sm hover:bg-zinc-100 transition-all group mb-3"
        >
          <Zap className="w-4 h-4" />
          JETZT UPGRADEN
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