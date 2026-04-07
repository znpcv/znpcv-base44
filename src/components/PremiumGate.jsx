/**
 * PremiumGate — Wraps any content that requires full_app_access entitlement.
 * Shows upgrade prompt if not entitled, spinner while loading.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { useEntitlement } from '@/hooks/useEntitlement';
import { useLanguage } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';

export default function PremiumGate({ children, featureName = 'Premium Feature' }) {
  const { loading, entitled, isAdmin } = useEntitlement();
  const { darkMode } = useLanguage();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-white' : 'border-zinc-900'}`} />
      </div>
    );
  }

  if (entitled || isAdmin) {
    return <>{children}</>;
  }

  // Not entitled — show upgrade prompt
  return (
    <div className={`flex flex-col items-center justify-center min-h-[300px] p-8 rounded-2xl border-2 text-center
      ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
        <Lock className={`w-7 h-7 ${darkMode ? 'text-zinc-300' : 'text-zinc-600'}`} />
      </div>
      <div className={`text-xs tracking-widest mb-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>PREMIUM</div>
      <h3 className={`text-xl tracking-wider mb-2 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{featureName}</h3>
      <p className={`text-sm font-sans mb-6 max-w-sm leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
        Dieses Feature erfordert ZNPCV Full Access. Einmalige Zahlung — dauerhafter Zugriff.
      </p>
      <button
        onClick={() => navigate(createPageUrl('Upgrade'))}
        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold tracking-widest text-sm hover:bg-zinc-100 transition-all group"
      >
        <Zap className="w-4 h-4" />
        JETZT UPGRADEN
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}