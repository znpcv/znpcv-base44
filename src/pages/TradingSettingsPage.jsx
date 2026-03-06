import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings, Shield, Clock, TrendingUp, DollarSign, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';

const SESSIONS = ['London', 'NY', 'Asia', 'Off'];

export default function TradingSettingsPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [settings, setSettings] = useState({
    account_currency: 'USD',
    account_balance: 10000,
    risk_per_trade_pct: 1.0,
    max_daily_loss_pct: 2.0,
    max_trades_per_day: 3,
    min_rr: 2.0,
    min_go_score: 80,
    cooldown_minutes_after_loss: 10,
    lock_after_consecutive_losses: 2,
    sessions_enabled: { London: true, NY: true, Asia: false, Off: false },
    allow_override: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settingsId, setSettingsId] = useState(null);

  useEffect(() => {
    base44.entities.TradingSettings.list().then(data => {
      if (data.length > 0) {
        setSettings(s => ({ ...s, ...data[0] }));
        setSettingsId(data[0].id);
      }
    });
  }, []);

  const update = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  const toggleSession = (s) => setSettings(p => ({
    ...p,
    sessions_enabled: { ...(p.sessions_enabled || {}), [s]: !p.sessions_enabled?.[s] }
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settingsId) {
        await base44.entities.TradingSettings.update(settingsId, settings);
      } else {
        const res = await base44.entities.TradingSettings.create(settings);
        setSettingsId(res.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgCard} space-y-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${theme.textMuted}`} />
        <div className={`text-xs tracking-widest font-bold ${theme.textMuted}`}>{title}</div>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, value, onChange, min, max, step = 0.1, suffix }) => (
    <div>
      <label className={`text-xs ${theme.textMuted} block mb-1`}>{label}</label>
      <div className="flex items-center gap-2">
        <Input value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
          type="number" min={min} max={max} step={step}
          className={`flex-1 ${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : ''}`} />
        {suffix && <span className={`text-xs ${theme.textMuted} flex-shrink-0`}>{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`sticky top-0 z-50 ${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`text-xs tracking-widest font-bold ${theme.textMuted}`}>EINSTELLUNGEN</div>
          <DarkModeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">

        <Section icon={DollarSign} title="KONTO">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs ${theme.textMuted} block mb-1`}>WÄHRUNG</label>
              <select value={settings.account_currency} onChange={e => update('account_currency', e.target.value)}
                className={`w-full p-2 rounded-lg border text-sm font-bold ${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-zinc-300'}`}>
                {['USD', 'EUR', 'GBP', 'CHF'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Field label="KONTOSTAND" value={settings.account_balance} onChange={v => update('account_balance', v)} min={100} step={100} />
          </div>
        </Section>

        <Section icon={Shield} title="RISIKO-REGELN">
          <div className="grid grid-cols-2 gap-3">
            <Field label="RISIKO/TRADE (%)" value={settings.risk_per_trade_pct} onChange={v => update('risk_per_trade_pct', v)} min={0.1} max={10} step={0.1} suffix="%" />
            <Field label="MAX TAGESVERLUST (%)" value={settings.max_daily_loss_pct} onChange={v => update('max_daily_loss_pct', v)} min={0.5} max={20} step={0.5} suffix="%" />
            <Field label="MAX TRADES/TAG" value={settings.max_trades_per_day} onChange={v => update('max_trades_per_day', Math.round(v))} min={1} max={20} step={1} />
            <Field label="MIN R:R" value={settings.min_rr} onChange={v => update('min_rr', v)} min={0.5} max={10} step={0.1} />
          </div>
        </Section>

        <Section icon={TrendingUp} title="GO/NO-GO GATE">
          <Field label="MIN GO-SCORE (0-100)" value={settings.min_go_score} onChange={v => update('min_go_score', Math.round(v))} min={50} max={100} step={5} />
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} text-xs ${theme.textMuted}`}>
            Setup muss diesen Score erreichen, um als GO zu gelten. Empfehlung: 80.
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className={`text-sm font-bold ${theme.text}`}>Override erlauben</div>
              <div className={`text-xs ${theme.textMuted}`}>Erlaubt Trades trotz NO-GO mit Begründung</div>
            </div>
            <button onClick={() => update('allow_override', !settings.allow_override)}
              className={cn('w-12 h-6 rounded-full transition-all relative',
                settings.allow_override ? 'bg-amber-600' : darkMode ? 'bg-zinc-700' : 'bg-zinc-300')}>
              <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                settings.allow_override ? 'left-6' : 'left-0.5')} />
            </button>
          </div>
        </Section>

        <Section icon={Clock} title="COOLDOWN & SPERREN">
          <div className="grid grid-cols-2 gap-3">
            <Field label="COOLDOWN NACH VERLUST (MIN)" value={settings.cooldown_minutes_after_loss}
              onChange={v => update('cooldown_minutes_after_loss', Math.round(v))} min={0} max={120} step={5} />
            <Field label="VERLUSTE BIS TAGESSPERRE" value={settings.lock_after_consecutive_losses}
              onChange={v => update('lock_after_consecutive_losses', Math.round(v))} min={1} max={10} step={1} />
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} text-xs ${theme.textMuted}`}>
            Nach {settings.lock_after_consecutive_losses} aufeinanderfolgenden Verlusten wird das Trading bis morgen gesperrt.
          </div>
        </Section>

        <Section icon={Lock} title="SESSIONS">
          <div className={`text-xs ${theme.textMuted} mb-2`}>Welche Sessions sind erlaubt? (Trades außerhalb → Warnung)</div>
          <div className="grid grid-cols-2 gap-2">
            {SESSIONS.map(s => (
              <button key={s} onClick={() => toggleSession(s)}
                className={cn('p-3 rounded-xl border-2 font-bold text-sm tracking-wider transition-all',
                  settings.sessions_enabled?.[s]
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : `${theme.border} ${theme.textMuted} ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`)}>
                {s}
              </button>
            ))}
          </div>
        </Section>

        {/* Risk Preview */}
        <div className={`p-4 rounded-xl border-2 ${darkMode ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-zinc-50'}`}>
          <div className={`text-xs tracking-widest font-bold mb-3 ${theme.textMuted}`}>VORSCHAU</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Risiko/Trade', value: `${settings.account_currency} ${((settings.account_balance || 0) * (settings.risk_per_trade_pct || 1) / 100).toFixed(2)}` },
              { label: 'Max Tagesverlust', value: `${settings.account_currency} ${((settings.account_balance || 0) * (settings.max_daily_loss_pct || 2) / 100).toFixed(2)}` },
              { label: 'Min R:R', value: `1 : ${settings.min_rr}` },
              { label: 'Max Trades', value: `${settings.max_trades_per_day}/Tag` },
            ].map(row => (
              <div key={row.label}>
                <div className={`text-xs ${theme.textMuted}`}>{row.label}</div>
                <div className={`font-bold ${theme.text}`}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 max-w-2xl mx-auto">
        <Button onClick={handleSave} disabled={saving}
          className={cn('w-full h-12 font-bold tracking-widest text-sm rounded-xl',
            saved ? 'bg-emerald-700 text-white' : darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800')}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Wird gespeichert...' : saved ? '✓ Gespeichert!' : 'Einstellungen speichern'}
        </Button>
      </div>
    </div>
  );
}