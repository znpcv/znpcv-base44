import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, XOctagon, ShieldCheck, TrendingUp, TrendingDown, Target, Calculator, Brain, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useTradingEngine } from '@/components/trading/useTradingEngine';
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';
import AssetSelector from '@/components/AssetSelector';

const STEPS = ['Asset', 'Bias', 'AOI', 'Struktur', 'Preise', 'Psyche', 'Ergebnis'];
const CANDLE_TRIGGERS = ['Engulfing', 'Pinbar', 'Inside Bar', 'Harami', 'Doji', 'Marubozu'];
const CONFLUENCE_OPTIONS = ['EMA-Touch', 'Round Level', 'PSP Rejection', 'Swing H/L', 'Fibonacci', 'Gap Fill', 'Volume Spike'];

export default function SetupBuilderPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const { settings, checkBlockers, computeGoScore, computeGrade, computeRisk, todayStats, activeLocks } = useTradingEngine();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const [form, setForm] = useState({
    asset: '', direction: '', timeframe_context: 'D',
    aoi_defined: false, aoi_touches: 0,
    market_structure_ok: false, shift_of_structure: false,
    candle_trigger: '', confluences: [],
    entry_price: '', stop_price: '', target_price: '',
    psych_sleep: 'gut', psych_stress: 'niedrig', psych_focus: 'hoch',
    notes: '',
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleConfluence = (tag) => {
    setForm(p => ({
      ...p,
      confluences: p.confluences.includes(tag) ? p.confluences.filter(t => t !== tag) : [...p.confluences, tag]
    }));
  };

  // Computed values
  const goScore = computeGoScore(form);
  const grade = computeGrade(goScore);
  const blockers = checkBlockers({ ...form, rr: parseFloat(riskCalc?.rr || 0) });
  const hardBlockers = blockers.filter(b => b.severity === 'hard');
  const isGO = goScore >= settings.min_go_score && hardBlockers.length === 0;

  const riskCalc = computeRisk(form.entry_price, form.stop_price, form.target_price, settings.account_balance, settings.risk_per_trade_pct);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const handleSave = async (withOverride = false) => {
    setSaving(true);
    try {
      const rr = parseFloat(riskCalc?.rr || 0);
      const overrideUsed = withOverride && hardBlockers.length > 0;
      const setupData = {
        ...form,
        entry_price: parseFloat(form.entry_price) || null,
        stop_price: parseFloat(form.stop_price) || null,
        target_price: parseFloat(form.target_price) || null,
        rr, go_score: goScore, grade,
        blockers: hardBlockers.map(b => b.code),
        status: overrideUsed ? 'ready' : isGO ? 'ready' : 'blocked',
        override_used: overrideUsed,
        override_reason: overrideUsed ? overrideReason : null,
      };
      await base44.entities.TradeSetup.create(setupData);
      if (overrideUsed) {
        await base44.entities.DisciplineEvent.create({
          type: 'override', reason_code: 'MANUAL_OVERRIDE',
          details: { blockers: hardBlockers.map(b => b.code), reason: overrideReason },
          active_until: null,
        });
      }
      navigate(createPageUrl('TradeJournal'));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const gradeColor = { 'A+': 'bg-emerald-700 text-white', A: 'bg-blue-600 text-white', B: 'bg-amber-500 text-white', C: 'bg-rose-600 text-white' };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className={`text-xs tracking-widest ${theme.textMuted}`}>SETUP BUILDER</div>
            <div className="text-sm font-bold tracking-wider">{STEPS[step]}</div>
          </div>
          <DarkModeToggle />
        </div>
        {/* Step progress */}
        <div className={`flex ${darkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
          {STEPS.map((s, i) => (
            <div key={s} className={cn('flex-1 h-1 transition-all', i <= step ? 'bg-emerald-700' : darkMode ? 'bg-zinc-800' : 'bg-zinc-200')} />
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <AnimatePresence mode="wait">

          {/* STEP 0: Asset + Richtung */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <StepHeader n="01" title="Asset & Richtung" sub="Welches Instrument und welche Richtung?" />
              <AssetSelector selectedPair={form.asset} onSelect={v => update('asset', v)} />
              {form.asset && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {['long', 'short'].map(d => (
                    <button key={d} onClick={() => update('direction', d)}
                      className={cn('p-4 rounded-xl border-2 font-bold tracking-widest text-sm transition-all',
                        form.direction === d
                          ? d === 'long' ? 'bg-emerald-700 border-emerald-700 text-white' : 'bg-rose-600 border-rose-600 text-white'
                          : `${theme.border} ${theme.text} ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'}`)}>
                      {d === 'long' ? <TrendingUp className="w-5 h-5 mx-auto mb-1" /> : <TrendingDown className="w-5 h-5 mx-auto mb-1" />}
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
              <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                <label className={`text-xs tracking-widest ${theme.textMuted} block mb-2`}>TIMEFRAME KONTEXT</label>
                <div className="flex flex-wrap gap-2">
                  {['W', 'D', '4H', '2H', '1H', '30m', '15m'].map(tf => (
                    <button key={tf} onClick={() => update('timeframe_context', tf)}
                      className={cn('px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wider transition-all',
                        form.timeframe_context === tf
                          ? darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                          : `${theme.border} ${theme.textMuted} ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`)}>
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: HTF Bias */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <StepHeader n="02" title="HTF Bias & Marktstruktur" sub="Wöchentlich / Täglich / 4H Trend und Struktur" />
              <ToggleCard
                label="Marktstruktur klar" desc="Klare HH/HL (Aufwärts) oder LH/LL (Abwärts) Struktur sichtbar?"
                value={form.market_structure_ok} onChange={v => update('market_structure_ok', v)}
                darkMode={darkMode} />
              <ToggleCard
                label="Shift of Structure" desc="BOS/MSS bestätigt auf Entry-Timeframe?"
                value={form.shift_of_structure} onChange={v => update('shift_of_structure', v)}
                darkMode={darkMode} />
              <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard} space-y-2`}>
                <label className={`text-xs tracking-widest ${theme.textMuted} block`}>CONFLUENCE TAGS</label>
                <div className="flex flex-wrap gap-2">
                  {CONFLUENCE_OPTIONS.map(tag => (
                    <button key={tag} onClick={() => toggleConfluence(tag)}
                      className={cn('px-2.5 py-1 rounded-lg text-xs font-bold border transition-all',
                        form.confluences.includes(tag)
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : `${theme.border} ${theme.textMuted} ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`)}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: AOI */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <StepHeader n="03" title="Area of Interest (AOI)" sub="Ist der Preis in einer validen AOI Zone?" />
              <ToggleCard label="AOI definiert" desc="Klare Supply/Demand Zone oder HTF Unterstützung/Widerstand?"
                value={form.aoi_defined} onChange={v => update('aoi_defined', v)} darkMode={darkMode} />
              {form.aoi_defined && (
                <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-3`}>AOI BERÜHRUNGEN (min. 3)</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => update('aoi_touches', Math.max(0, (form.aoi_touches || 0) - 1))}
                      className={`w-10 h-10 rounded-full border-2 ${theme.border} font-bold text-lg ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>−</button>
                    <div className="text-center flex-1">
                      <div className={cn('text-4xl font-bold', (form.aoi_touches || 0) >= 3 ? 'text-emerald-600' : 'text-rose-500')}>
                        {form.aoi_touches || 0}
                      </div>
                      <div className={`text-xs ${theme.textMuted}`}>{(form.aoi_touches || 0) >= 3 ? '✓ Ausreichend' : 'Zu wenig'}</div>
                    </div>
                    <button onClick={() => update('aoi_touches', (form.aoi_touches || 0) + 1)}
                      className={`w-10 h-10 rounded-full border-2 ${theme.border} font-bold text-lg ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>+</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Struktur + Candle Trigger */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <StepHeader n="04" title="Candle Trigger" sub="Welches Kerzenmuster löst den Entry aus?" />
              <div className="grid grid-cols-2 gap-2">
                {CANDLE_TRIGGERS.map(ct => (
                  <button key={ct} onClick={() => update('candle_trigger', ct)}
                    className={cn('p-3 rounded-xl border-2 text-sm font-bold tracking-wider transition-all',
                      form.candle_trigger === ct
                        ? darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                        : `${theme.border} ${theme.text} ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'}`)}>
                    {ct}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Entry/Stop/Target */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <StepHeader n="05" title="Entry / Stop / Target" sub="Risk Engine berechnet automatisch Positionsgröße & R:R" />
              <div className="space-y-3">
                {[
                  { key: 'entry_price', label: 'ENTRY PREIS', placeholder: '1.0850' },
                  { key: 'stop_price', label: 'STOP LOSS', placeholder: '1.0800' },
                  { key: 'target_price', label: 'TAKE PROFIT', placeholder: '1.0950' },
                ].map(f => (
                  <div key={f.key} className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                    <label className={`text-xs tracking-widest ${theme.textMuted} block mb-1`}>{f.label}</label>
                    <Input value={form[f.key]} onChange={e => update(f.key, e.target.value)}
                      placeholder={f.placeholder} type="number" step="any"
                      className={`text-lg font-bold ${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-zinc-300'}`} />
                  </div>
                ))}
              </div>
              {riskCalc && (
                <div className={`p-4 rounded-xl border-2 ${isGO ? 'border-emerald-700 bg-emerald-700/10' : 'border-amber-600 bg-amber-600/10'}`}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <RiskRow label="R:R" value={`1 : ${riskCalc.rr}`} good={parseFloat(riskCalc.rr) >= settings.min_rr} />
                    <RiskRow label="Risiko" value={`${settings.account_currency} ${riskCalc.riskAmount}`} />
                    <RiskRow label="Positionsgröße" value={riskCalc.positionSize} />
                    <RiskRow label="Pot. Gewinn" value={`${settings.account_currency} ${riskCalc.potentialProfit}`} good />
                  </div>
                  {parseFloat(riskCalc.rr) < settings.min_rr && (
                    <div className="mt-2 flex items-center gap-2 text-amber-500 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      R:R unter Minimum ({settings.min_rr}). Setup wird blockiert.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 5: Psyche */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <StepHeader n="06" title="Psycho-Check" sub="Ehrliche Selbsteinschätzung vor dem Trade" />
              {[
                { key: 'psych_sleep', label: 'SCHLAF', options: ['gut', 'mittel', 'schlecht'] },
                { key: 'psych_stress', label: 'STRESSLEVEL', options: ['niedrig', 'mittel', 'hoch'] },
                { key: 'psych_focus', label: 'FOKUS', options: ['hoch', 'mittel', 'niedrig'] },
              ].map(f => (
                <div key={f.key} className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-2`}>{f.label}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {f.options.map((o, i) => {
                      const isWarn = (f.key === 'psych_sleep' && o === 'schlecht') ||
                        (f.key === 'psych_stress' && o === 'hoch') ||
                        (f.key === 'psych_focus' && o === 'niedrig');
                      return (
                        <button key={o} onClick={() => update(f.key, o)}
                          className={cn('py-2 rounded-lg border text-xs font-bold tracking-wider transition-all',
                            form[f.key] === o
                              ? isWarn ? 'bg-rose-600 text-white border-rose-600' : 'bg-emerald-700 text-white border-emerald-700'
                              : `${theme.border} ${theme.textMuted} ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`)}>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {(form.psych_sleep === 'schlecht' || form.psych_stress === 'hoch' || form.psych_focus === 'niedrig') && (
                <div className={`p-3 rounded-xl border-2 border-amber-600 bg-amber-600/10`}>
                  <div className="flex items-start gap-2 text-amber-500">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-sm tracking-wider">Psycho-Warnung</div>
                      <div className="text-xs mt-0.5">Dein Zustand ist nicht optimal. Überdenke den Trade oder warte auf bessere Bedingungen.</div>
                    </div>
                  </div>
                </div>
              )}
              <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                <label className={`text-xs tracking-widest ${theme.textMuted} block mb-2`}>NOTIZEN (OPTIONAL)</label>
                <Textarea value={form.notes} onChange={e => update('notes', e.target.value)}
                  placeholder="Setup-Begründung, Besonderheiten..."
                  className={`text-sm ${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-zinc-300'} min-h-[80px]`} />
              </div>
            </motion.div>
          )}

          {/* STEP 6: Score + GO/NO-GO */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <StepHeader n="07" title="GO / NO-GO Ergebnis" sub="Finale Bewertung deines Setups" />

              {/* Score Badge */}
              <div className={cn('p-6 rounded-2xl text-center border-2', isGO ? 'border-emerald-700 bg-emerald-700/10' : 'border-rose-600 bg-rose-600/10')}>
                <div className={cn('text-5xl font-bold mb-1', isGO ? 'text-emerald-600' : 'text-rose-500')}>{goScore}</div>
                <div className={`text-xs tracking-widest mb-3 ${theme.textMuted}`}>VON {settings.min_go_score} BENÖTIGT</div>
                <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold tracking-widest text-sm',
                  isGO ? 'bg-emerald-700 text-white' : 'bg-rose-600 text-white')}>
                  {isGO ? <><ShieldCheck className="w-4 h-4" /> GO — Setup erfüllt alle Kriterien.</> : <><XOctagon className="w-4 h-4" /> NO-GO</>}
                </div>
                {form.asset && <div className={`mt-2 text-sm font-bold ${theme.text}`}>{form.asset} • {form.direction?.toUpperCase()} • {grade && <span className={cn('px-2 py-0.5 rounded text-white text-xs', gradeColor[grade])}>{grade}</span>}</div>}
              </div>

              {/* Blocker Liste */}
              {hardBlockers.length > 0 && (
                <div className={`p-4 rounded-xl border-2 border-rose-600 bg-rose-600/5 space-y-2`}>
                  <div className="font-bold text-rose-500 text-sm tracking-wider flex items-center gap-2">
                    <XOctagon className="w-4 h-4" /> NO-GO — Bitte behebe diese Punkte:
                  </div>
                  {hardBlockers.map(b => (
                    <div key={b.code} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span className={theme.text}>{b.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Score Breakdown */}
              <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgCard} space-y-2`}>
                <div className={`text-xs tracking-widest font-bold ${theme.textMuted} mb-3`}>SCORE AUFSCHLÜSSELUNG</div>
                {[
                  { label: 'AOI definiert', points: 20, achieved: form.aoi_defined },
                  { label: 'AOI ≥ 3 Berührungen', points: 15, achieved: (form.aoi_touches || 0) >= 3 },
                  { label: 'Marktstruktur klar', points: 20, achieved: form.market_structure_ok },
                  { label: 'Shift of Structure', points: 20, achieved: form.shift_of_structure },
                  { label: 'Candle Trigger', points: 15, achieved: !!form.candle_trigger },
                  { label: '≥ 2 Confluences', points: 10, achieved: (form.confluences || []).length >= 2 },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-4 h-4 rounded flex items-center justify-center',
                        item.achieved ? 'bg-emerald-700' : darkMode ? 'bg-zinc-800' : 'bg-zinc-200')}>
                        {item.achieved && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm ${item.achieved ? theme.text : theme.textMuted}`}>{item.label}</span>
                    </div>
                    <span className={cn('text-sm font-bold', item.achieved ? 'text-emerald-600' : theme.textMuted)}>
                      {item.achieved ? `+${item.points}` : `0/${item.points}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Save Buttons */}
              <div className="space-y-3 pt-2">
                {isGO ? (
                  <Button onClick={() => handleSave(false)} disabled={saving}
                    className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold tracking-widest text-sm rounded-xl">
                    {saving ? 'Wird gespeichert...' : '✓ Setup speichern & Ausführen'}
                  </Button>
                ) : (
                  <>
                    <div className={`p-3 rounded-xl border ${darkMode ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-zinc-50'} text-center`}>
                      <div className={`text-sm font-bold ${theme.text} mb-1`}>Setup kann nicht ausgeführt werden</div>
                      <div className={`text-xs ${theme.textMuted}`}>Behebe die oben genannten Blocker oder nutze das Override (Ausnahme).</div>
                    </div>
                    {settings.allow_override && (
                      <Button onClick={() => setShowOverrideDialog(true)} variant="outline"
                        className={`w-full h-10 text-sm border-2 ${darkMode ? 'border-amber-600 text-amber-500 hover:bg-amber-600/10' : 'border-amber-500 text-amber-600 hover:bg-amber-50'}`}>
                        Override beantragen (Ausnahme)
                      </Button>
                    )}
                    <Button onClick={() => navigate(-1)} variant="ghost" className="w-full h-10 text-sm">
                      Setup verwerfen
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav Buttons */}
        {step < 6 && (
          <div className="fixed bottom-6 left-0 right-0 px-4 max-w-2xl mx-auto flex gap-3">
            {step > 0 && (
              <Button onClick={() => setStep(s => s - 1)} variant="outline"
                className={`h-12 px-6 border-2 ${theme.border} ${theme.text} ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-50'}`}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && (!form.asset || !form.direction)}
              className={cn('flex-1 h-12 font-bold tracking-widest text-sm rounded-xl',
                darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800')}>
              Weiter <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </main>

      {/* Override Dialog */}
      <AnimatePresence>
        {showOverrideDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className={`${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-2xl p-6 max-w-sm w-full`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div className="font-bold tracking-wider text-amber-500">OVERRIDE AUSNAHME</div>
              </div>
              <p className={`text-sm ${theme.textMuted} mb-4 leading-relaxed`}>
                Override ist eine Ausnahme. Begründung ist Pflicht. Diese Aktion wird protokolliert.
              </p>
              <Textarea value={overrideReason} onChange={e => setOverrideReason(e.target.value)}
                placeholder="Begründe warum du trotz NO-GO tradest..."
                className={`mb-4 ${darkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-300'} min-h-[80px] text-sm`} />
              <div className="flex gap-2">
                <Button onClick={() => setShowOverrideDialog(false)} variant="outline" className="flex-1">Abbrechen</Button>
                <Button onClick={() => { setShowOverrideDialog(false); handleSave(true); }}
                  disabled={!overrideReason.trim() || saving}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  Override bestätigen
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepHeader({ n, title, sub }) {
  const { darkMode } = useLanguage();
  return (
    <div className="text-center mb-2">
      <div className={`text-3xl font-light mb-1 ${darkMode ? 'text-zinc-800' : 'text-zinc-300'}`}>{n}</div>
      <h2 className={`text-xl tracking-widest font-bold mb-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
      <p className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{sub}</p>
    </div>
  );
}

function ToggleCard({ label, desc, value, onChange, darkMode }) {
  return (
    <button onClick={() => onChange(!value)}
      className={cn('w-full p-4 rounded-xl border-2 text-left transition-all',
        value ? 'border-emerald-700 bg-emerald-700/10' : darkMode ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300')}>
      <div className="flex items-center justify-between">
        <div>
          <div className={cn('font-bold text-sm tracking-wider', value ? 'text-emerald-600' : darkMode ? 'text-white' : 'text-zinc-900')}>{label}</div>
          <div className={`text-xs mt-0.5 ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{desc}</div>
        </div>
        <div className={cn('w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0',
          value ? 'bg-emerald-700 border-emerald-700' : darkMode ? 'border-zinc-700' : 'border-zinc-400')}>
          {value && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
      </div>
    </button>
  );
}

function RiskRow({ label, value, good }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={cn('font-bold text-sm', good === true ? 'text-emerald-600' : good === false ? 'text-rose-500' : 'text-white')}>{value}</div>
    </div>
  );
}