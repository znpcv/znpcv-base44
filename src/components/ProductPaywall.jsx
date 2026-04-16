/**
 * ProductPaywall — zeigt den Produktkauf-Screen.
 *
 * product="checklist"  → ZNPCV Checkliste, $99 Lifetime
 * product="strategy"   → ZNPCV Strategie,  $2,499 einmalig
 * product="select"     → Produktauswahl (beide anzeigen)
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const CHECKLIST_FEATURES = [
  'Individuelle, frei konfigurierbare Checkliste',
  'Eigene Kriterien, Felder und Bedingungen',
  'Trade-Journal mit Screenshot-Dokumentation',
  'Performance-Dashboard und Statistiken',
  'Integrierter Lot-Size-Rechner',
  'Lebenslanger Zugang — einmalige Zahlung',
];

const STRATEGY_FEATURES = [
  'Vollständiger Zugriff auf die proprietäre ZNPCV Strategie',
  'Multi-Timeframe Analyse (W-D-4H)',
  'Golden Rule Check und Score-System',
  'No-Trade Skill und Entscheidungslogik',
  'Alle Strategie-Presets und -Kriterien',
  'Exklusiv und nicht öffentlich verfügbar',
];

function ProductCard({ title, price, priceNote, features, product, darkMode, onBuy, loading }) {
  const theme = {
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
  };

  const isStrategy = product === 'strategy';

  return (
    <div className={cn(
      'border-2 rounded-2xl p-5 flex flex-col',
      isStrategy
        ? darkMode ? 'border-amber-600/40 bg-amber-950/20' : 'border-amber-400/40 bg-amber-50/50'
        : `${theme.border} ${theme.bgCard}`
    )}>
      {isStrategy && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-600/20 border border-amber-600/30 rounded-full text-amber-500 text-[10px] tracking-widest mb-3 w-fit">
          <Shield className="w-2.5 h-2.5" />
          OPTIONAL
        </div>
      )}

      <h3 className={`text-base tracking-widest font-bold ${theme.text} mb-1`}>{title}</h3>
      <div className={`text-2xl font-light ${theme.text} mb-0.5`}>${price}</div>
      <div className={`text-[10px] font-sans ${theme.textMuted} mb-4`}>{priceNote}</div>

      <div className="space-y-2 flex-1 mb-5">
        {features.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <div className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
              isStrategy ? 'bg-amber-600/20' : 'bg-emerald-700/20'
            )}>
              <CheckCircle2 className={cn('w-2.5 h-2.5', isStrategy ? 'text-amber-500' : 'text-emerald-600')} />
            </div>
            <span className={`text-xs font-sans ${theme.textMuted} leading-relaxed`}>{f}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onBuy(product)}
        disabled={loading === product}
        className={cn(
          'w-full h-11 rounded-xl font-bold tracking-widest text-xs border-2 transition-all flex items-center justify-center gap-2',
          isStrategy
            ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
            : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700',
          loading === product && 'opacity-60 cursor-not-allowed'
        )}
      >
        {loading === product ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> WEITERLEITUNG...</>
        ) : (
          <>JETZT FREISCHALTEN <ArrowRight className="w-3.5 h-3.5" /></>
        )}
      </button>
    </div>
  );
}

export default function ProductPaywall({ darkMode, mode = 'select' }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
  };

  const handleBuy = async (product) => {
    setLoading(product);
    setError(null);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', { product });
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError('Checkout konnte nicht gestartet werden.');
      }
    } catch {
      setError('Fehler beim Starten des Checkouts. Bitte erneut versuchen.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${darkMode ? 'bg-zinc-900 border-2 border-zinc-800' : 'bg-zinc-100 border-2 border-zinc-200'}`}>
            <Lock className={`w-7 h-7 ${theme.textMuted}`} />
          </div>
          {mode === 'checklist' && (
            <>
              <h1 className="text-xl tracking-widest font-bold mb-1.5">ZUGANG ERFORDERLICH</h1>
              <p className={`text-xs font-sans leading-relaxed ${theme.textMuted}`}>
                Die freie Checkliste ist ein Lifetime-Produkt.<br />Einmalige Zahlung, dauerhafter Zugang.
              </p>
            </>
          )}
          {mode === 'strategy' && (
            <>
              <h1 className="text-xl tracking-widest font-bold mb-1.5">EXKLUSIVER ZUGANG</h1>
              <p className={`text-xs font-sans leading-relaxed ${theme.textMuted}`}>
                Die ZNPCV Strategie ist ein proprietäres Produkt.<br />Optional zusätzlich buchbar.
              </p>
            </>
          )}
          {mode === 'select' && (
            <>
              <h1 className="text-xl tracking-widest font-bold mb-1.5">PRODUKT AUSWÄHLEN</h1>
              <p className={`text-xs font-sans leading-relaxed ${theme.textMuted}`}>
                Wähle das Produkt, das zu deinen Anforderungen passt.
              </p>
            </>
          )}
        </div>

        {(mode === 'select' || mode === 'checklist') && mode !== 'strategy' && (
          <div className={mode === 'select' ? 'grid sm:grid-cols-2 gap-4' : ''}>
            <ProductCard
              title="ZNPCV Checkliste"
              price="99"
              priceNote="einmalig · Lifetime"
              features={CHECKLIST_FEATURES}
              product="checklist"
              darkMode={darkMode}
              onBuy={handleBuy}
              loading={loading}
            />
            {mode === 'select' && (
              <ProductCard
                title="ZNPCV Strategie"
                price="2.499"
                priceNote="einmalig · optional zusätzlich"
                features={STRATEGY_FEATURES}
                product="strategy"
                darkMode={darkMode}
                onBuy={handleBuy}
                loading={loading}
              />
            )}
          </div>
        )}

        {mode === 'strategy' && (
          <div className="max-w-sm mx-auto">
            <ProductCard
              title="ZNPCV Strategie"
              price="2.499"
              priceNote="einmalig · optional zusätzlich"
              features={STRATEGY_FEATURES}
              product="strategy"
              darkMode={darkMode}
              onBuy={handleBuy}
              loading={loading}
            />
          </div>
        )}

        {error && (
          <p className="text-rose-500 text-xs font-sans text-center mt-4">{error}</p>
        )}
        <p className={`text-[10px] font-sans text-center mt-4 ${theme.textMuted}`}>
          Sicher bezahlen via Stripe · SSL-verschlüsselt
        </p>
      </motion.div>
    </div>
  );
}