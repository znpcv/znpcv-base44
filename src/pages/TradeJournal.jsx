import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, Clock, TrendingUp, TrendingDown, Upload, X as XIcon, AlertTriangle, BookOpen, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useTradingEngine } from '@/components/trading/useTradingEngine';
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SESSION_OPTIONS = ['London', 'NY', 'Asia', 'Off'];
const TAG_OPTIONS = ['FOMO', 'Revenge', 'Disziplin ✓', 'News', 'Break-Even', 'Trailing', 'Partial Close', 'Early Exit', 'Late Entry'];

export default function TradeJournalPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const { settings, triggerCooldown, triggerDailyLock, todayStats, activeLocks, reload } = useTradingEngine();

  const [trades, setTrades] = useState([]);
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTrade, setShowNewTrade] = useState(false);
  const [closingTrade, setClosingTrade] = useState(null);
  const [saving, setSaving] = useState(false);

  const [newTrade, setNewTrade] = useState({
    asset: '', direction: 'long', entry_price: '', stop_price: '', target_price: '',
    session: 'London', tags: [], notes: '', setup_id: '', screenshots_entry: [],
  });
  const [closeData, setCloseData] = useState({
    exit_price: '', exit_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    result: 'win', mfe_r: '', mae_r: '', notes: '', screenshots_exit: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        base44.entities.Trade.list('-created_date', 50),
        base44.entities.TradeSetup.filter({ status: 'ready' }),
      ]);
      setTrades(t);
      setSetups(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const openTrades = trades.filter(t => t.result === 'open');
  const closedTrades = trades.filter(t => t.result !== 'open');
  const needsJournal = closedTrades.filter(t => !t.screenshots_exit?.length || !t.notes);

  // Daily lock check
  const dailyLock = activeLocks?.find(l => l.type === 'daily_lock');
  const cooldown = activeLocks?.find(l => l.type === 'cooldown');

  const handleCreateTrade = async () => {
    if (!newTrade.asset || !newTrade.entry_price || !newTrade.stop_price) return;
    if (dailyLock || cooldown) return;
    setSaving(true);
    try {
      const e = parseFloat(newTrade.entry_price);
      const s = parseFloat(newTrade.stop_price);
      const t = parseFloat(newTrade.target_price) || 0;
      const stopDist = Math.abs(e - s);
      const rr = t && stopDist > 0 ? Math.abs(t - e) / stopDist : 0;
      const riskAmount = (settings.account_balance || 10000) * ((settings.risk_per_trade_pct || 1) / 100);

      await base44.entities.Trade.create({
        ...newTrade,
        entry_price: e, stop_price: s, target_price: t,
        entry_time: new Date().toISOString(),
        rr_planned: rr, risk_amount: riskAmount,
        position_size: stopDist > 0 ? riskAmount / stopDist : 0,
        result: 'open',
      });
      setShowNewTrade(false);
      setNewTrade({ asset: '', direction: 'long', entry_price: '', stop_price: '', target_price: '', session: 'London', tags: [], notes: '', setup_id: '', screenshots_entry: [] });
      await loadData();
      reload();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleCloseTrade = async () => {
    if (!closingTrade) return;
    setSaving(true);
    try {
      const exitPrice = parseFloat(closeData.exit_price);
      const entry = closingTrade.entry_price;
      const stop = closingTrade.stop_price;
      const stopDist = Math.abs(entry - stop);
      const isLong = closingTrade.direction === 'long';
      const pnlPerUnit = isLong ? exitPrice - entry : entry - exitPrice;
      const pnlAmount = pnlPerUnit * (closingTrade.position_size || 1);
      const pnlR = stopDist > 0 ? pnlPerUnit / stopDist : 0;

      await base44.entities.Trade.update(closingTrade.id, {
        exit_price: exitPrice,
        exit_time: closeData.exit_time ? new Date(closeData.exit_time).toISOString() : new Date().toISOString(),
        result: closeData.result,
        pnl_amount: pnlAmount,
        pnl_r: pnlR,
        rr_realized: Math.abs(pnlR),
        mfe_r: parseFloat(closeData.mfe_r) || null,
        mae_r: parseFloat(closeData.mae_r) || null,
        notes: closeData.notes,
        screenshots_exit: closeData.screenshots_exit,
      });

      // Discipline engine
      if (closeData.result === 'loss') {
        await triggerCooldown('VERLUST');
        // Check consecutive losses
        const recent = trades.slice(0, 3).filter(t => t.result === 'loss');
        if (recent.length >= (settings.lock_after_consecutive_losses - 1)) {
          await triggerDailyLock('VERLUST_SERIE');
        }
      }

      setClosingTrade(null);
      setCloseData({ exit_price: '', exit_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"), result: 'win', mfe_r: '', mae_r: '', notes: '', screenshots_exit: [] });
      await loadData();
      reload();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const uploadScreenshot = async (file, type) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (type === 'entry') setNewTrade(p => ({ ...p, screenshots_entry: [...(p.screenshots_entry || []), file_url] }));
    if (type === 'exit') setCloseData(p => ({ ...p, screenshots_exit: [...(p.screenshots_exit || []), file_url] }));
  };

  const toggleTag = (tag) => {
    setNewTrade(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag]
    }));
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`sticky top-0 z-50 ${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className={`text-xs tracking-widest ${theme.textMuted}`}>TRADE JOURNAL</div>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button onClick={() => navigate(createPageUrl('TradingInsights'))}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}>
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">
        {/* Lock / Cooldown Banner */}
        {(dailyLock || cooldown) && (
          <div className="p-4 rounded-xl border-2 border-rose-600 bg-rose-600/10">
            <div className="flex items-start gap-3 text-rose-500">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-bold tracking-wider text-sm">
                  {dailyLock ? 'Tageslimit erreicht. Trading ist bis morgen gesperrt.' : 'Cooldown aktiv — warte kurz.'}
                </div>
                {cooldown && (
                  <div className="text-xs mt-0.5">
                    Entsperrt um: {new Date(cooldown.active_until).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Today Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Trades', value: todayStats?.total || 0 },
            { label: 'Wins', value: todayStats?.wins || 0, color: 'text-emerald-600' },
            { label: 'Losses', value: todayStats?.losses || 0, color: 'text-rose-500' },
            { label: 'P&L', value: `${(todayStats?.pnl || 0) >= 0 ? '+' : ''}${(todayStats?.pnl || 0).toFixed(0)}`, color: (todayStats?.pnl || 0) >= 0 ? 'text-emerald-600' : 'text-rose-500' },
          ].map(s => (
            <div key={s.label} className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard} text-center`}>
              <div className={cn('font-bold text-lg', s.color || theme.text)}>{s.value}</div>
              <div className={`text-xs tracking-wider ${theme.textMuted}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Journal abschließen Alert */}
        {needsJournal.length > 0 && (
          <div className={`p-3 rounded-xl border-2 border-amber-600 bg-amber-600/10`}>
            <div className="flex items-center gap-2 text-amber-500 text-sm font-bold">
              <BookOpen className="w-4 h-4" />
              {needsJournal.length} Trade(s) ohne vollständiges Journal
            </div>
            <div className={`text-xs ${theme.textMuted} mt-0.5`}>Fehlende Screenshots oder Notizen. Bitte abschließen.</div>
          </div>
        )}

        {/* Open Trades */}
        {openTrades.length > 0 && (
          <section>
            <h2 className={`text-xs tracking-widest font-bold mb-2 ${theme.textMuted}`}>OFFENE TRADES ({openTrades.length})</h2>
            <div className="space-y-2">
              {openTrades.map(trade => (
                <TradeCard key={trade.id} trade={trade} darkMode={darkMode}
                  onClose={() => setClosingTrade(trade)} />
              ))}
            </div>
          </section>
        )}

        {/* Closed Trades */}
        {closedTrades.length > 0 && (
          <section>
            <h2 className={`text-xs tracking-widest font-bold mb-2 ${theme.textMuted}`}>GESCHLOSSEN ({closedTrades.length})</h2>
            <div className="space-y-2">
              {closedTrades.slice(0, 10).map(trade => (
                <TradeCard key={trade.id} trade={trade} darkMode={darkMode} />
              ))}
            </div>
          </section>
        )}

        {trades.length === 0 && !loading && (
          <div className="text-center py-16">
            <BookOpen className={`w-10 h-10 mx-auto mb-3 ${theme.textMuted}`} />
            <div className={`font-bold tracking-wider ${theme.text}`}>Noch keine Trades</div>
            <div className={`text-sm ${theme.textMuted} mt-1`}>Erstelle deinen ersten Trade</div>
          </div>
        )}
      </main>

      {/* FAB - New Trade */}
      {!dailyLock && !cooldown && (
        <button onClick={() => setShowNewTrade(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-700 text-white shadow-lg flex items-center justify-center hover:bg-emerald-800 transition-colors z-40">
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* New Trade Sheet */}
      <AnimatePresence>
        {showNewTrade && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className={`w-full max-w-2xl ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold tracking-widest ${theme.text}`}>NEUER TRADE</h3>
                <button onClick={() => setShowNewTrade(false)}><XIcon className="w-5 h-5" /></button>
              </div>

              {/* Setup Link */}
              {setups.length > 0 && (
                <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard} mb-3`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-2`}>SETUP VERKNÜPFEN (OPTIONAL)</label>
                  <select value={newTrade.setup_id} onChange={e => {
                    const s = setups.find(s => s.id === e.target.value);
                    setNewTrade(p => ({
                      ...p, setup_id: e.target.value,
                      asset: s?.asset || p.asset, direction: s?.direction || p.direction,
                      entry_price: s?.entry_price || p.entry_price,
                      stop_price: s?.stop_price || p.stop_price,
                      target_price: s?.target_price || p.target_price,
                    }));
                  }} className={`w-full p-2 rounded-lg border text-sm ${darkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-300'}`}>
                    <option value="">Kein Setup</option>
                    {setups.map(s => (
                      <option key={s.id} value={s.id}>{s.asset} {s.direction?.toUpperCase()} — Score: {s.go_score}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-1`}>INSTRUMENT</label>
                  <Input value={newTrade.asset} onChange={e => setNewTrade(p => ({ ...p, asset: e.target.value }))}
                    placeholder="EURUSD, BTCUSDT..." className={`${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : ''}`} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {['long', 'short'].map(d => (
                    <button key={d} onClick={() => setNewTrade(p => ({ ...p, direction: d }))}
                      className={cn('p-3 rounded-xl border-2 font-bold tracking-wider text-sm',
                        newTrade.direction === d
                          ? d === 'long' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-rose-600 text-white border-rose-600'
                          : `${theme.border} ${theme.text}`)}>
                      {d === 'long' ? <TrendingUp className="w-4 h-4 mx-auto mb-0.5" /> : <TrendingDown className="w-4 h-4 mx-auto mb-0.5" />}
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>

                {[
                  { key: 'entry_price', label: 'ENTRY' },
                  { key: 'stop_price', label: 'STOP LOSS' },
                  { key: 'target_price', label: 'TAKE PROFIT' },
                ].map(f => (
                  <div key={f.key} className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                    <label className={`text-xs tracking-widest ${theme.textMuted} block mb-1`}>{f.label}</label>
                    <Input value={newTrade[f.key]} onChange={e => setNewTrade(p => ({ ...p, [f.key]: e.target.value }))}
                      type="number" step="any" className={`${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : ''}`} />
                  </div>
                ))}

                {/* Session */}
                <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-2`}>SESSION</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SESSION_OPTIONS.map(s => (
                      <button key={s} onClick={() => setNewTrade(p => ({ ...p, session: s }))}
                        className={cn('py-1.5 rounded-lg border text-xs font-bold',
                          newTrade.session === s ? darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black' : `${theme.border} ${theme.textMuted}`)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-2`}>TAGS</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TAG_OPTIONS.map(t => (
                      <button key={t} onClick={() => toggleTag(t)}
                        className={cn('px-2 py-1 rounded-lg text-xs border',
                          newTrade.tags.includes(t) ? 'bg-emerald-700 text-white border-emerald-700' : `${theme.border} ${theme.textMuted}`)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Screenshot Entry */}
                <ScreenshotUploader label="ENTRY SCREENSHOT (PFLICHT)" darkMode={darkMode}
                  files={newTrade.screenshots_entry}
                  onUpload={f => uploadScreenshot(f, 'entry')}
                  onRemove={url => setNewTrade(p => ({ ...p, screenshots_entry: p.screenshots_entry.filter(u => u !== url) }))} />

                <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-1`}>NOTIZEN</label>
                  <Textarea value={newTrade.notes} onChange={e => setNewTrade(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Setup-Begründung..." className={`text-sm min-h-[60px] ${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : ''}`} />
                </div>

                <Button onClick={handleCreateTrade} disabled={saving || !newTrade.asset || !newTrade.entry_price || !newTrade.stop_price || !newTrade.screenshots_entry?.length}
                  className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold tracking-widest">
                  {saving ? 'Speichern...' : !newTrade.screenshots_entry?.length ? 'Entry Screenshot fehlt (Pflicht)' : 'Trade öffnen'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close Trade Sheet */}
      <AnimatePresence>
        {closingTrade && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className={`w-full max-w-2xl ${darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold tracking-widest ${theme.text}`}>TRADE ABSCHLIESSEN — {closingTrade.asset}</h3>
                <button onClick={() => setClosingTrade(null)}><XIcon className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-1`}>EXIT PREIS</label>
                  <Input value={closeData.exit_price} onChange={e => setCloseData(p => ({ ...p, exit_price: e.target.value }))}
                    type="number" step="any" placeholder="Exit Preis..." className={`text-lg font-bold ${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : ''}`} />
                </div>
                <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-1`}>EXIT ZEIT</label>
                  <Input value={closeData.exit_time} onChange={e => setCloseData(p => ({ ...p, exit_time: e.target.value }))}
                    type="datetime-local" className={`${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : ''}`} />
                </div>

                {/* Result */}
                <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-2`}>ERGEBNIS</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['win', 'loss', 'breakeven'].map(r => (
                      <button key={r} onClick={() => setCloseData(p => ({ ...p, result: r }))}
                        className={cn('py-2 rounded-xl border-2 font-bold text-xs tracking-wider',
                          closeData.result === r
                            ? r === 'win' ? 'bg-emerald-700 text-white border-emerald-700' : r === 'loss' ? 'bg-rose-600 text-white border-rose-600' : darkMode ? 'bg-zinc-700 text-white border-zinc-600' : 'bg-zinc-300 text-black border-zinc-300'
                            : `${theme.border} ${theme.textMuted}`)}>
                        {r === 'win' ? 'WIN' : r === 'loss' ? 'LOSS' : 'BE'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[{ key: 'mfe_r', label: 'MFE (R)' }, { key: 'mae_r', label: 'MAE (R)' }].map(f => (
                    <div key={f.key} className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                      <label className={`text-xs tracking-widest ${theme.textMuted} block mb-1`}>{f.label}</label>
                      <Input value={closeData[f.key]} onChange={e => setCloseData(p => ({ ...p, [f.key]: e.target.value }))}
                        type="number" step="0.1" placeholder="0.0" className={`${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : ''}`} />
                    </div>
                  ))}
                </div>

                <ScreenshotUploader label="EXIT SCREENSHOT (PFLICHT)" darkMode={darkMode}
                  files={closeData.screenshots_exit}
                  onUpload={f => uploadScreenshot(f, 'exit')}
                  onRemove={url => setCloseData(p => ({ ...p, screenshots_exit: p.screenshots_exit.filter(u => u !== url) }))} />

                <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <label className={`text-xs tracking-widest ${theme.textMuted} block mb-1`}>NOTIZEN (PFLICHT)</label>
                  <Textarea value={closeData.notes} onChange={e => setCloseData(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Was lief gut? Was verbessern?" className={`text-sm min-h-[80px] ${darkMode ? 'bg-zinc-950 border-zinc-700 text-white' : ''}`} />
                </div>

                <Button onClick={handleCloseTrade}
                  disabled={saving || !closeData.exit_price || !closeData.notes?.trim() || !closeData.screenshots_exit?.length}
                  className={cn('w-full h-12 font-bold tracking-widest',
                    closeData.result === 'win' ? 'bg-emerald-700 hover:bg-emerald-800 text-white' : closeData.result === 'loss' ? 'bg-rose-600 hover:bg-rose-700 text-white' : darkMode ? 'bg-white text-black' : 'bg-black text-white')}>
                  {saving ? 'Speichern...' : !closeData.screenshots_exit?.length ? 'Exit Screenshot fehlt (Pflicht)' : !closeData.notes?.trim() ? 'Notizen fehlen (Pflicht)' : 'Trade abschließen'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TradeCard({ trade, darkMode, onClose }) {
  const theme = { text: darkMode ? 'text-white' : 'text-zinc-900', textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500', border: darkMode ? 'border-zinc-800' : 'border-zinc-200', bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50' };
  const isOpen = trade.result === 'open';
  const resultColor = trade.result === 'win' ? 'text-emerald-600' : trade.result === 'loss' ? 'text-rose-500' : theme.textMuted;

  return (
    <div className={cn('p-4 rounded-xl border-2', isOpen ? darkMode ? 'border-blue-600/50 bg-blue-600/5' : 'border-blue-500/30 bg-blue-500/5' : `${theme.border} ${theme.bgCard}`)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {trade.direction === 'long' ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
          <span className={`font-bold tracking-wider ${theme.text}`}>{trade.asset}</span>
          {trade.session && <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'}`}>{trade.session}</span>}
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <div className="flex items-center gap-1 text-blue-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">OFFEN</span>
            </div>
          ) : (
            <span className={cn('text-sm font-bold', resultColor)}>{trade.result?.toUpperCase()}</span>
          )}
        </div>
      </div>
      <div className={`flex items-center gap-4 text-xs ${theme.textMuted}`}>
        <span>E: {trade.entry_price}</span>
        <span>SL: {trade.stop_price}</span>
        {trade.rr_planned ? <span>R:R: {trade.rr_planned?.toFixed(2)}</span> : null}
        {trade.pnl_amount != null && !isOpen ? <span className={resultColor}>{trade.pnl_amount >= 0 ? '+' : ''}{trade.pnl_amount?.toFixed(2)}</span> : null}
      </div>
      {isOpen && onClose && (
        <Button onClick={onClose} size="sm"
          className="mt-3 w-full h-8 text-xs tracking-widest bg-emerald-700 hover:bg-emerald-800 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Trade abschließen & Journal
        </Button>
      )}
    </div>
  );
}

function ScreenshotUploader({ label, darkMode, files, onUpload, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const theme = { border: darkMode ? 'border-zinc-800' : 'border-zinc-200', bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50', textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500' };

  const handleChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try { await onUpload(f); } finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgCard}`}>
      <label className={`text-xs tracking-widest ${theme.textMuted} block mb-2`}>{label}</label>
      {files?.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {files.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-zinc-700" />
              <button onClick={() => onRemove(url)} className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full flex items-center justify-center">
                <XIcon className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      <label className={cn('flex items-center justify-center gap-2 p-2 border border-dashed rounded-lg cursor-pointer transition-all',
        uploading ? 'opacity-50 cursor-not-allowed' : darkMode ? 'border-zinc-700 hover:border-zinc-600' : 'border-zinc-300 hover:border-zinc-400')}>
        <input type="file" accept="image/*" onChange={handleChange} className="hidden" disabled={uploading} />
        {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
        <span className={`text-xs ${theme.textMuted}`}>{uploading ? 'Wird hochgeladen...' : 'Hochladen'}</span>
      </label>
    </div>
  );
}