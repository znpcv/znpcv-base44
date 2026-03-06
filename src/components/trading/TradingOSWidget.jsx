import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, AlertTriangle, TrendingUp, BookOpen, Settings, BarChart3, Plus, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TradingOSWidget({ darkMode }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const [trades, events] = await Promise.all([
          base44.entities.Trade.list('-created_date', 50),
          base44.entities.DisciplineEvent.list('-created_date', 20),
        ]);
        const todayTrades = trades.filter(t => {
          const d = t.entry_time ? t.entry_time.slice(0, 10) : t.created_date?.slice(0, 10);
          return d === today;
        });
        const closed = todayTrades.filter(t => t.result !== 'open');
        const pnl = closed.reduce((s, t) => s + (t.pnl_amount || 0), 0);
        setStats({
          total: todayTrades.length,
          wins: closed.filter(t => t.result === 'win').length,
          losses: closed.filter(t => t.result === 'loss').length,
          open: todayTrades.filter(t => t.result === 'open').length,
          pnl,
        });
        const now = new Date();
        setLocks(events.filter(e => e.active_until && new Date(e.active_until) > now));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const theme = {
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const dailyLock = locks.find(l => l.type === 'daily_lock');
  const cooldown = locks.find(l => l.type === 'cooldown');

  return (
    <div className={`border ${theme.border} rounded-2xl overflow-hidden`}>
      {/* Header */}
      <div className={`p-3 flex items-center justify-between ${darkMode ? 'bg-zinc-950 border-b border-zinc-800' : 'bg-zinc-100 border-b border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <Shield className={`w-4 h-4 ${theme.textMuted}`} />
          <span className={`text-xs tracking-widest font-bold ${theme.textMuted}`}>TRADING OS</span>
        </div>
        <button onClick={() => navigate(createPageUrl('TradingSettingsPage'))}
          className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'}`}>
          <Settings className={`w-3.5 h-3.5 ${theme.textMuted}`} />
        </button>
      </div>

      {/* Lock Banner */}
      {(dailyLock || cooldown) && (
        <div className="px-3 py-2 bg-rose-600/10 border-b border-rose-600/30">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            {dailyLock ? 'Tageslimit erreicht. Trading gesperrt bis morgen.' : `Cooldown aktiv bis ${new Date(cooldown.active_until).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
          </div>
        </div>
      )}

      <div className={`p-3 ${theme.bgCard}`}>
        {/* Today Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: 'Heute', value: stats.total },
              { label: 'Offen', value: stats.open, color: 'text-blue-500' },
              { label: 'Wins', value: stats.wins, color: 'text-emerald-600' },
              { label: 'P&L', value: `${stats.pnl >= 0 ? '+' : ''}${stats.pnl.toFixed(0)}`, color: stats.pnl >= 0 ? 'text-emerald-600' : 'text-rose-500' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={cn('font-bold text-base', s.color || theme.text)}>{s.value}</div>
                <div className={`text-[10px] tracking-wider ${theme.textMuted}`}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => navigate(createPageUrl('SetupBuilder'))}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold tracking-wider">
            <Plus className="w-3.5 h-3.5" />
            Neues Setup
          </button>
          <button onClick={() => navigate(createPageUrl('TradeJournal'))}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold tracking-wider ${theme.border} ${theme.text} ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>
            <BookOpen className="w-3.5 h-3.5" />
            Journal
            <ChevronRight className="w-3 h-3 ml-auto" />
          </button>
          <button onClick={() => navigate(createPageUrl('TradingInsights'))}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold tracking-wider ${theme.border} ${theme.text} ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>
            <BarChart3 className="w-3.5 h-3.5" />
            Insights
            <ChevronRight className="w-3 h-3 ml-auto" />
          </button>
          <button onClick={() => navigate(createPageUrl('TradingSettingsPage'))}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold tracking-wider ${theme.border} ${theme.text} ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}>
            <Settings className="w-3.5 h-3.5" />
            Einstellungen
            <ChevronRight className="w-3 h-3 ml-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}