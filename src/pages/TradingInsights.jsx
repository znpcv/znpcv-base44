import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Award, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { cn } from '@/lib/utils';

export default function TradingInsightsPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Trade.list('-entry_time', 200)
      .then(setTrades).finally(() => setLoading(false));
  }, []);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const closed = trades.filter(t => t.result !== 'open' && t.pnl_r != null);
  const wins = closed.filter(t => t.result === 'win');
  const losses = closed.filter(t => t.result === 'loss');
  const winrate = closed.length ? (wins.length / closed.length * 100).toFixed(1) : 0;
  const avgWin = wins.length ? wins.reduce((s, t) => s + (t.pnl_r || 0), 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl_r || 0), 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;
  const expectancy = (parseFloat(winrate) / 100) * avgWin - (1 - parseFloat(winrate) / 100) * avgLoss;
  const totalPnlR = closed.reduce((s, t) => s + (t.pnl_r || 0), 0);

  // Grade breakdown
  const gradeStats = ['A+', 'A', 'B', 'C'].map(g => {
    const gt = closed.filter(t => t.grade === g);
    const gw = gt.filter(t => t.result === 'win');
    return {
      grade: g,
      count: gt.length,
      winrate: gt.length ? (gw.length / gt.length * 100).toFixed(0) : 0,
      pnlR: gt.reduce((s, t) => s + (t.pnl_r || 0), 0).toFixed(1),
    };
  });

  // Session breakdown
  const sessionStats = ['London', 'NY', 'Asia', 'Off'].map(s => {
    const st = closed.filter(t => t.session === s);
    const sw = st.filter(t => t.result === 'win');
    return {
      session: s,
      count: st.length,
      winrate: st.length ? (sw.length / st.length * 100).toFixed(0) : 0,
      pnlR: st.reduce((sum, t) => sum + (t.pnl_r || 0), 0).toFixed(1),
    };
  }).filter(s => s.count > 0);

  // Equity curve
  const equityCurve = closed.reduce((acc, t) => {
    const last = acc[acc.length - 1]?.value || 0;
    acc.push({ value: parseFloat((last + (t.pnl_r || 0)).toFixed(2)), name: acc.length + 1 });
    return acc;
  }, []);

  // Recommendations
  const recommendations = [];
  if (gradeStats.find(g => g.grade === 'B' && parseFloat(g.pnlR) < 0)) {
    recommendations.push({ icon: '⚠️', text: 'B-Setups sind negativ — überdenke, ob du B-Setups handelst.' });
  }
  if (gradeStats.find(g => g.grade === 'C' && g.count > 0)) {
    recommendations.push({ icon: '🚫', text: 'C-Setups im Portfolio — diese sofort streichen.' });
  }
  const bestSession = sessionStats.sort((a, b) => parseFloat(b.pnlR) - parseFloat(a.pnlR))[0];
  if (bestSession) {
    recommendations.push({ icon: '✅', text: `${bestSession.session} Session performt am besten (${bestSession.pnlR}R) — Fokus erhöhen.` });
  }
  if (parseFloat(winrate) > 0 && expectancy < 0.3) {
    recommendations.push({ icon: '📊', text: 'Expectancy unter 0.3R — R:R oder Winrate verbessern.' });
  }

  // Top errors from discipline events (simplified)
  const overrides = trades.filter(t => t.override_used);

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`sticky top-0 z-50 ${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`text-xs tracking-widest font-bold ${theme.textMuted}`}>INSIGHTS</div>
          <DarkModeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-8">
        {loading ? (
          <div className="text-center py-16">
            <div className={`w-8 h-8 border-2 ${darkMode ? 'border-white' : 'border-black'} border-t-transparent rounded-full animate-spin mx-auto`} />
          </div>
        ) : closed.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className={`w-10 h-10 mx-auto mb-3 ${theme.textMuted}`} />
            <div className={`font-bold tracking-wider ${theme.text}`}>Noch keine abgeschlossenen Trades</div>
            <div className={`text-sm ${theme.textMuted} mt-1`}>Schließe Trades ab, um Insights zu sehen</div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Winrate', value: `${winrate}%`, good: parseFloat(winrate) >= 50, icon: Award },
                { label: 'Profit Factor', value: profitFactor.toFixed(2), good: profitFactor >= 1.5, icon: Target },
                { label: 'Expectancy (R)', value: expectancy.toFixed(2), good: expectancy >= 0.3, icon: TrendingUp },
                { label: 'Gesamt (R)', value: `${totalPnlR >= 0 ? '+' : ''}${totalPnlR.toFixed(1)}R`, good: totalPnlR >= 0, icon: BarChart3 },
              ].map(kpi => (
                <div key={kpi.label} className={`p-4 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                  <kpi.icon className={`w-4 h-4 mb-1 ${theme.textMuted}`} />
                  <div className={cn('text-2xl font-bold', kpi.good ? 'text-emerald-600' : 'text-rose-500')}>{kpi.value}</div>
                  <div className={`text-xs tracking-wider ${theme.textMuted}`}>{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Equity Curve */}
            {equityCurve.length > 1 && (
              <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                <div className={`text-xs tracking-widest font-bold mb-3 ${theme.textMuted}`}>EQUITY KURVE (R)</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={equityCurve}>
                    <Line type="monotone" dataKey="value" stroke={totalPnlR >= 0 ? '#059669' : '#e11d48'} strokeWidth={2} dot={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: darkMode ? '#09090b' : '#fff', border: '1px solid #27272a', borderRadius: 8 }}
                      labelStyle={{ color: darkMode ? '#71717a' : '#52525b' }}
                      itemStyle={{ color: '#059669' }}
                      formatter={v => [`${v}R`, 'Equity']}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Grade Breakdown */}
            <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgCard}`}>
              <div className={`text-xs tracking-widest font-bold mb-3 ${theme.textMuted}`}>NACH SETUP-GRADE</div>
              <div className="space-y-2">
                {gradeStats.filter(g => g.count > 0).map(g => {
                  const gradeColor = { 'A+': 'bg-emerald-700', A: 'bg-blue-600', B: 'bg-amber-500', C: 'bg-rose-600' };
                  return (
                    <div key={g.grade} className="flex items-center gap-3">
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', gradeColor[g.grade])}>{g.grade}</div>
                      <div className="flex-1">
                        <div className={`flex justify-between text-xs mb-1 ${theme.text}`}>
                          <span>{g.count} Trades • {g.winrate}% WR</span>
                          <span className={parseFloat(g.pnlR) >= 0 ? 'text-emerald-600' : 'text-rose-500'}>{parseFloat(g.pnlR) >= 0 ? '+' : ''}{g.pnlR}R</span>
                        </div>
                        <div className={`h-1.5 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                          <div className={cn('h-1.5 rounded-full', gradeColor[g.grade])} style={{ width: `${g.winrate}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Session Breakdown */}
            {sessionStats.length > 0 && (
              <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                <div className={`text-xs tracking-widest font-bold mb-3 ${theme.textMuted}`}>NACH SESSION</div>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={sessionStats} barSize={28}>
                    <XAxis dataKey="session" tick={{ fill: darkMode ? '#71717a' : '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: darkMode ? '#09090b' : '#fff', border: '1px solid #27272a', borderRadius: 8 }}
                      formatter={(v, n) => [n === 'pnlR' ? `${v}R` : `${v}%`, n === 'pnlR' ? 'P&L (R)' : 'Winrate']}
                    />
                    <Bar dataKey="pnlR" radius={[4, 4, 0, 0]}>
                      {sessionStats.map((s, i) => (
                        <Cell key={i} fill={parseFloat(s.pnlR) >= 0 ? '#059669' : '#e11d48'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Override / Discipline Stats */}
            {overrides.length > 0 && (
              <div className={`p-4 rounded-xl border-2 border-amber-600/50 bg-amber-600/5`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <div className="font-bold text-sm text-amber-500 tracking-wider">DISZIPLIN</div>
                </div>
                <div className={`text-sm ${theme.text}`}>{overrides.length} Override(s) — Trades ohne GO-Kriterien</div>
                {(() => {
                  const overrideWins = overrides.filter(t => t.result === 'win').length;
                  const overrideWR = overrides.length ? (overrideWins / overrides.length * 100).toFixed(0) : 0;
                  return <div className={`text-xs ${theme.textMuted} mt-1`}>Override Winrate: {overrideWR}%</div>;
                })()}
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgCard}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <div className={`text-xs tracking-widest font-bold ${theme.textMuted}`}>EMPFEHLUNGEN</div>
                </div>
                <div className="space-y-2">
                  {recommendations.map((r, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                      <span className="text-lg flex-shrink-0">{r.icon}</span>
                      <span className={`text-sm ${theme.text}`}>{r.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgCard}`}>
              <div className={`text-xs tracking-widest font-bold mb-3 ${theme.textMuted}`}>ZUSAMMENFASSUNG</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  { label: 'Trades gesamt', value: closed.length },
                  { label: 'Wins', value: wins.length },
                  { label: 'Losses', value: losses.length },
                  { label: 'Ø Win (R)', value: `+${avgWin.toFixed(2)}R` },
                  { label: 'Ø Loss (R)', value: `-${avgLoss.toFixed(2)}R` },
                  { label: 'Overrides', value: overrides.length },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-1 border-b border-dashed border-zinc-800/50">
                    <span className={theme.textMuted}>{row.label}</span>
                    <span className={`font-bold ${theme.text}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}