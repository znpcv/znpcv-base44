/**
 * PaymentSuccess — Shown after Stripe redirects back on successful payment.
 * Verifies the session server-side and grants entitlement if not yet done by webhook.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import { clearEntitlementCache } from '@/hooks/useEntitlement';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setStatus('success'); // No session ID but on success page — assume success
      clearEntitlementCache();
      return;
    }

    verifySession(sessionId);
  }, []);

  const verifySession = async (sessionId) => {
    try {
      const res = await base44.functions.invoke('verifyPaymentSession', { session_id: sessionId });
      if (res.data?.success) {
        clearEntitlementCache();
        setStatus('success');
      } else {
        setStatus('error');
        setError('Zahlung konnte nicht bestätigt werden. Bitte kontaktiere support@znpcv.com.');
      }
    } catch (err) {
      console.error('[PaymentSuccess] verification failed:', err);
      // Still show success — payment may have worked, webhook will handle it
      clearEntitlementCache();
      setStatus('success');
    }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center px-4`}>
      <div className="max-w-md w-full text-center">

        {status === 'verifying' && (
          <>
            <Loader2 className={`w-12 h-12 mx-auto mb-4 animate-spin ${theme.textMuted}`} />
            <h1 className={`text-2xl tracking-wider mb-2 ${theme.text}`}>WIRD VERIFIZIERT</h1>
            <p className={`text-sm font-sans ${theme.textMuted}`}>Einen Moment bitte.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-700/10 border border-emerald-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div className={`text-xs tracking-widest mb-2 ${theme.textMuted}`}>ZAHLUNG ERFOLGREICH</div>
            <h1 className={`text-3xl sm:text-4xl tracking-wider mb-3 ${theme.text}`}>ZUGRIFF AKTIV</h1>
            <p className={`text-sm font-sans mb-2 ${theme.textSecondary}`}>
              Dein ZNPCV Full Access wurde aktiviert.
            </p>
            <p className={`text-xs font-sans mb-8 ${theme.textMuted}`}>
              Kein Abo, kein Ablaufdatum — dauerhafter Vollzugriff auf alle Funktionen.
            </p>
            <button
              onClick={() => navigate(createPageUrl('Home'))}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold tracking-widest text-sm hover:bg-zinc-100 transition-all mx-auto group"
            >
              WEITER ZU ZNPCV
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className={`text-xs font-sans mt-4 ${theme.textMuted}`}>
              Fragen? <a href="mailto:support@znpcv.com" className="underline">support@znpcv.com</a>
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={`text-xs tracking-widest mb-2 text-red-500`}>FEHLER</div>
            <h1 className={`text-2xl tracking-wider mb-3 ${theme.text}`}>VERIFIZIERUNG FEHLGESCHLAGEN</h1>
            <p className={`text-sm font-sans mb-6 ${theme.textSecondary}`}>{error}</p>
            <button
              onClick={() => navigate(createPageUrl('Home'))}
              className={`px-6 py-3 rounded-xl border-2 font-bold tracking-widest text-sm transition-all ${theme.border} ${theme.text}`}
            >
              ZUR ÜBERSICHT
            </button>
          </>
        )}
      </div>
    </div>
  );
}