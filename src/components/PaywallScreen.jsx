import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Zap, ArrowRight, Loader2, Shield, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: CheckCircle2, text: 'Professionelle ZNPCV Checkliste' },
  { icon: TrendingUp, text: 'Multi-Timeframe Analyse (W-D-4H)' },
  { icon: Target, text: 'Integrierter Lot-Size-Rechner' },
  { icon: Shield, text: 'No-Trade Skill & Golden Rule Check' },
  { icon: BarChart3, text: 'Trade-Dokumentation mit Screenshots' },
  { icon: Zap, text: 'Lebenslanger Zugang — einmalige Zahlung' },
];

export default function PaywallScreen({ darkMode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {});
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError('Checkout konnte nicht gestartet werden. Bitte versuche es erneut.');
      }
    } catch (err) {
      setError('Fehler beim Starten des Checkouts. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Lock Icon */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${darkMode ? 'bg-zinc-900 border-2 border-zinc-800' : 'bg-zinc-100 border-2 border-zinc-200'}`}>
            <Lock className={`w-8 h-8 ${theme.textSecondary}`} />
          </div>
          <h1 className="text-xl tracking-widest font-bold mb-1">ZUGANG GESPERRT</h1>
          <p className={`text-xs font-sans leading-relaxed ${theme.textSecondary}`}>
            Die ZNPCV Checkliste ist ein Premium-Tool.<br />
            Einmalige Zahlung — lebenslanger Zugang.
          </p>
        </div>

        {/* Feature List */}
        <div className={`border-2 ${theme.border} ${theme.bgCard} rounded-2xl p-4 mb-4`}>
          <div className="space-y-2.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-700/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3 h-3 text-emerald-600" />
                </div>
                <span className={`text-xs font-sans ${theme.text}`}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={cn(
            "w-full h-12 rounded-xl font-bold tracking-widest text-sm border-2 transition-all flex items-center justify-center gap-2",
            "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700",
            loading && "opacity-70 cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              WEITERLEITUNG...
            </>
          ) : (
            <>
              JETZT FREISCHALTEN
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {error && (
          <p className="text-rose-500 text-xs font-sans text-center mt-3">{error}</p>
        )}

        <p className={`text-[10px] font-sans text-center mt-3 ${theme.textMuted}`}>
          Sicher bezahlen via Stripe · SSL-verschlüsselt
        </p>
      </motion.div>
    </div>
  );
}