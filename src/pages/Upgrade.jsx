/**
 * Upgrade Page — ZNPCV Full Access purchase.
 * Professional, minimal design aligned with ZNPCV brand.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Zap, Shield, BarChart3, ClipboardCheck, History, Lock, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { useEntitlement } from '@/hooks/useEntitlement';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: ClipboardCheck, text: 'Multi-Timeframe Analyse (W-D-4H)' },
  { icon: BarChart3, text: 'Trading Dashboard & Performance Tracking' },
  { icon: History, text: 'Trade Journal & History' },
  { icon: Shield, text: 'Lot Size & Risiko Kalkulator' },
  { icon: Zap, text: 'No-Trade Skill & Scoring System' },
  { icon: Star, text: 'Alle zukünftigen Updates inklusive' },
];

export default function UpgradePage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const { entitled, isAdmin, loading: entitlementLoading } = useEntitlement();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Detect iframe (preview mode)
    setIsInIframe(window.self !== window.top);
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // If already entitled, redirect to home
  useEffect(() => {
    if (!entitlementLoading && (entitled || isAdmin)) {
      navigate(createPageUrl('Home'));
    }
  }, [entitled, isAdmin, entitlementLoading]);

  const handleCheckout = async () => {
    if (isInIframe) {
      alert('Checkout ist nur in der veröffentlichten App verfügbar. Bitte öffne die App in einem neuen Tab.');
      return;
    }

    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        origin: window.location.origin,
        success_url: `${window.location.origin}/PaymentSuccess`,
        cancel_url: `${window.location.origin}/Upgrade`
      });

      if (res.data?.already_entitled) {
        navigate(createPageUrl('Home'));
        return;
      }

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError('Checkout konnte nicht gestartet werden.');
      }
    } catch (err) {
      console.error('[Upgrade] checkout error:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  if (entitlementLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-white' : 'border-zinc-900'}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={() => navigate(createPageUrl('Home'))}
              className={cn('p-2 rounded-xl border-2 transition-all', darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400')}
            >
              <ArrowLeft className={`w-4 h-4 ${theme.text}`} />
            </button>
          </div>
          <button onClick={() => navigate(createPageUrl('Home'))}>
            <img
              src={darkMode
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV"
              className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </button>
          <div className="w-[76px]" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 sm:py-16">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/10 border border-emerald-600/30 rounded-full text-emerald-600 text-xs mb-4 tracking-widest">
            <Zap className="w-3 h-3" />
            FULL ACCESS
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl tracking-wider mb-3 ${theme.text}`}>ZNPCV</h1>
          <p className={`text-base sm:text-lg font-sans ${theme.textSecondary} mb-2`}>
            Die ultimative Trading-Checkliste — einmalig freischalten.
          </p>
          <p className={`text-sm font-sans ${theme.textMuted}`}>
            Kein Abo. Kein Ablaufdatum. Einmal zahlen — für immer nutzen.
          </p>
        </div>

        {/* Pricing Card */}
        <div className={cn(
          'rounded-2xl border-2 p-6 sm:p-8 mb-6 relative overflow-hidden',
          darkMode ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900'
        )}>
          {/* Decorative circle */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 bg-black -translate-y-20 translate-x-20" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className={`text-xs tracking-widest mb-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>EINMALIGE ZAHLUNG</div>
                <div className="text-5xl font-bold">99 €</div>
                <div className={`text-sm mt-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>einmalig, kein Abo</div>
              </div>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', darkMode ? 'bg-black' : 'bg-white')}>
                <Lock className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-black'}`} />
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-3 mb-7">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0', darkMode ? 'bg-black' : 'bg-white')}>
                    <Check className={`w-3 h-3 ${darkMode ? 'text-white' : 'text-black'}`} />
                  </div>
                  <span className={`text-sm font-sans ${darkMode ? 'text-zinc-700' : 'text-zinc-300'}`}>{text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {error && (
              <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm font-sans text-center">
                {error}
              </div>
            )}

            {isInIframe && (
              <div className={cn('mb-4 px-4 py-2 rounded-lg text-xs font-sans text-center border', darkMode ? 'bg-zinc-100 border-zinc-300 text-zinc-600' : 'bg-zinc-800 border-zinc-700 text-zinc-400')}>
                ⚠️ Checkout ist nur in der veröffentlichten App verfügbar.
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading || isInIframe}
              className={cn(
                'w-full py-4 rounded-xl font-bold tracking-widest text-sm transition-all flex items-center justify-center gap-2',
                darkMode ? 'bg-black text-white hover:bg-zinc-900 disabled:opacity-50' : 'bg-white text-black hover:bg-zinc-100 disabled:opacity-50',
                !isInIframe && 'active:scale-[0.98]'
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {user ? 'JETZT FREISCHALTEN — 99 €' : 'ANMELDEN & KAUFEN'}
                </>
              )}
            </button>

            <p className={cn('text-center text-xs font-sans mt-3', darkMode ? 'text-zinc-500' : 'text-zinc-400')}>
              Sichere Zahlung via Stripe · SSL verschlüsselt
            </p>
          </div>
        </div>

        {/* Trust signals */}
        <div className={cn('grid grid-cols-3 gap-3 text-center', theme.textMuted)}>
          {[
            { icon: Shield, label: 'SSL Sicher' },
            { icon: Lock, label: 'Kein Abo' },
            { icon: Star, label: 'Dauerhaft' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className={cn('p-3 rounded-xl border', theme.border, theme.bgCard)}>
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-[10px] tracking-widest">{label}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className={cn('mt-8 p-6 rounded-xl border', theme.border, theme.bgCard)}>
          <h3 className={`text-sm tracking-widest mb-4 ${theme.text}`}>HÄUFIGE FRAGEN</h3>
          <div className="space-y-4">
            {[
              { q: 'Gibt es ein Abo?', a: 'Nein. Du zahlst einmalig 99 € und hast dauerhaften Zugriff — auch auf alle zukünftigen Updates.' },
              { q: 'Welche Zahlungsmethoden?', a: 'Kreditkarte, SEPA-Lastschrift, Apple Pay, Google Pay und mehr — alles über Stripe.' },
              { q: 'Was, wenn ich Probleme habe?', a: 'Schreib uns unter support@znpcv.com — wir helfen dir innerhalb von 24h.' },
            ].map(({ q, a }) => (
              <div key={q}>
                <div className={`text-xs tracking-wider mb-1 ${theme.text}`}>{q}</div>
                <div className={`text-sm font-sans ${theme.textMuted}`}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}