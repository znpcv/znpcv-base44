/**
 * Access.jsx — ZNPCV Purchase / Access Gate
 * Dezent, hochwertig, ruhig — kein aggressiver Paywall-Stil.
 * Wird nur erreicht, wenn Nutzer aktiv einen geschützten Bereich betreten möchte.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Lock, Shield, Star, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { useEntitlement } from '@/hooks/useEntitlement';
import { cn } from '@/lib/utils';

export default function AccessPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const { entitled, isAdmin, loading: entitlementLoading } = useEntitlement();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Already entitled → go directly to app
  useEffect(() => {
    if (!entitlementLoading && (entitled || isAdmin)) {
      navigate(createPageUrl('Home'), { replace: true });
    }
  }, [entitled, isAdmin, entitlementLoading, navigate]);

  const handleCheckout = async () => {
    if (isInIframe) {
      alert('Der Kauf ist nur in der veröffentlichten App verfügbar. Bitte öffne ZNPCV direkt im Browser.');
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
        cancel_url: `${window.location.origin}/Access`
      });

      if (res.data?.already_entitled) {
        navigate(createPageUrl('Home'), { replace: true });
        return;
      }

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError('Checkout konnte nicht gestartet werden. Bitte versuche es erneut.');
      }
    } catch {
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
        <div className={cn('w-8 h-8 border-2 border-t-transparent rounded-full animate-spin', darkMode ? 'border-white' : 'border-zinc-900')} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>

      {/* Header */}
      <header className={cn('border-b sticky top-0 z-50', theme.bg, theme.border)}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={() => navigate(createPageUrl('Landing'))}
              className={cn(
                'p-2 rounded-xl border-2 transition-all',
                darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400'
              )}
            >
              <ArrowLeft className={`w-4 h-4 ${theme.text}`} />
            </button>
          </div>
          <button onClick={() => navigate(createPageUrl('Landing'))}>
            <img
              src={darkMode
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV"
              className="h-8 w-auto hover:opacity-80 transition-opacity"
            />
          </button>
          <div className="w-[76px]" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12 sm:py-16">

        {/* Context note */}
        <div className="text-center mb-10">
          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs tracking-widest border mb-5',
            darkMode ? 'border-zinc-800 text-zinc-500 bg-zinc-900' : 'border-zinc-200 text-zinc-500 bg-zinc-50'
          )}>
            <Lock className="w-3 h-3" />
            APP-ZUGANG
          </div>

          <h1 className={`text-3xl sm:text-4xl tracking-wider mb-3 ${theme.text}`}>ZNPCV</h1>

          <p className={cn('text-base sm:text-lg font-sans leading-relaxed max-w-md mx-auto mb-2', theme.textSecondary)}>
            Das Analyse-System ist für registrierte Nutzer mit aktivem Zugang verfügbar.
          </p>

          <p className={cn('text-sm font-sans', theme.textMuted)}>
            Einmalige Zahlung. Kein Abo. Dauerhafter Vollzugriff.
          </p>
        </div>

        {/* Pricing Card */}
        <div className={cn(
          'rounded-2xl border-2 p-7 sm:p-9 mb-5 relative overflow-hidden',
          darkMode ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900'
        )}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 bg-black -translate-y-20 translate-x-20" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className={cn('text-xs tracking-widest mb-1', darkMode ? 'text-zinc-500' : 'text-zinc-400')}>EINMALIG</div>
                <div className="text-5xl font-bold">99 €</div>
              </div>
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', darkMode ? 'bg-black' : 'bg-white')}>
                <Zap className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-black'}`} />
              </div>
            </div>

            <div className="space-y-2.5 mb-7">
              {[
                'Multi-Timeframe Analyse — W, D, 4H',
                'Trading Dashboard und Performance-Tracking',
                'Trade Journal mit vollständiger Historie',
                'Positionsrechner und Risiko-Management',
                'No-Trade Skill und strukturiertes Scoring',
                'Alle künftigen Updates ohne Aufpreis',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0', darkMode ? 'bg-black' : 'bg-white')}>
                    <Check className={`w-3 h-3 ${darkMode ? 'text-white' : 'text-black'}`} />
                  </div>
                  <span className={cn('text-sm font-sans', darkMode ? 'text-zinc-600' : 'text-zinc-300')}>{item}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-sans text-center">
                {error}
              </div>
            )}

            {isInIframe && (
              <div className={cn(
                'mb-4 px-4 py-2.5 rounded-xl text-xs font-sans text-center border',
                darkMode ? 'bg-zinc-100 border-zinc-300 text-zinc-600' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              )}>
                Der Kauf ist nur in der veröffentlichten App verfügbar.
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading || isInIframe}
              className={cn(
                'w-full py-4 rounded-xl font-bold tracking-widest text-sm transition-all flex items-center justify-center gap-2 group',
                darkMode ? 'bg-black text-white hover:bg-zinc-900 disabled:opacity-50' : 'bg-white text-black hover:bg-zinc-100 disabled:opacity-50',
                !isInIframe && 'active:scale-[0.98]'
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {user ? 'FREISCHALTEN — 99 €' : 'ANMELDEN & FORTFAHREN'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className={cn('text-center text-xs font-sans mt-3', darkMode ? 'text-zinc-500' : 'text-zinc-400')}>
              Sichere Zahlung via Stripe · SSL verschlüsselt
            </p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Lock, label: 'Kein Abo' },
            { icon: Shield, label: 'SSL gesichert' },
            { icon: Star, label: 'Dauerhaft' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className={cn('p-3 rounded-xl border text-center', theme.border, theme.bgCard)}>
              <Icon className={`w-4 h-4 mx-auto mb-1 ${theme.textMuted}`} />
              <div className={`text-[10px] tracking-widest ${theme.textMuted}`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Already have access? */}
        {user && (
          <div className="text-center">
            <p className={cn('text-xs font-sans mb-2', theme.textMuted)}>Zugang bereits erworben?</p>
            <button
              onClick={() => navigate(createPageUrl('Home'))}
              className={cn(
                'text-xs font-sans underline underline-offset-4 transition-colors',
                darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'
              )}
            >
              Weiter zur App
            </button>
          </div>
        )}

        {/* Back to public website */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate(createPageUrl('Landing'))}
            className={cn(
              'text-xs font-sans transition-colors',
              darkMode ? 'text-zinc-700 hover:text-zinc-500' : 'text-zinc-300 hover:text-zinc-500'
            )}
          >
            ← Zurück zur Website
          </button>
        </div>
      </main>
    </div>
  );
}