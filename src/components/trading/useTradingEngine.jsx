import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { format, startOfDay, endOfDay, addMinutes } from 'date-fns';

const DEFAULT_SETTINGS = {
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
};

export function useTradingEngine() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [todayTrades, setTodayTrades] = useState([]);
  const [activeLocks, setActiveLocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEngine = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsData, tradesData, locksData] = await Promise.all([
        base44.entities.TradingSettings.list(),
        base44.entities.Trade.list('-entry_time', 100),
        base44.entities.DisciplineEvent.list('-created_date', 50),
      ]);

      if (settingsData.length > 0) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsData[0] });
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      const todayTs = todayTrades.filter(t => {
        const d = t.entry_time ? t.entry_time.slice(0, 10) : t.created_date?.slice(0, 10);
        return d === today;
      });
      setTodayTrades(tradesData.filter(t => {
        const d = t.entry_time ? t.entry_time.slice(0, 10) : t.created_date?.slice(0, 10);
        return d === today;
      }));

      const now = new Date();
      const active = locksData.filter(e => e.active_until && new Date(e.active_until) > now);
      setActiveLocks(active);
    } catch (e) {
      console.error('TradingEngine load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEngine();
  }, [loadEngine]);

  // Compute today stats
  const todayStats = (() => {
    const closed = todayTrades.filter(t => t.result !== 'open');
    const wins = closed.filter(t => t.result === 'win').length;
    const losses = closed.filter(t => t.result === 'loss').length;
    const pnl = closed.reduce((sum, t) => sum + (t.pnl_amount || 0), 0);
    const pnlR = closed.reduce((sum, t) => sum + (t.pnl_r || 0), 0);
    return { total: todayTrades.length, wins, losses, pnl, pnlR, closed: closed.length };
  })();

  // Check blockers for a setup
  const checkBlockers = (setupData) => {
    const blockers = [];
    const s = settings;

    if (setupData.rr && setupData.rr < s.min_rr) {
      blockers.push({ code: 'RR_UNTER_MIN', label: `R:R ${setupData.rr?.toFixed(2)} liegt unter Minimum ${s.min_rr}`, severity: 'hard' });
    }
    if (setupData.aoi_defined && (setupData.aoi_touches || 0) < 3) {
      blockers.push({ code: 'AOI_TOUCHES_UNTER_3', label: 'AOI weniger als 3 Berührungen', severity: 'hard' });
    }
    if (setupData.market_structure_ok === false) {
      blockers.push({ code: 'STRUCTURE_UNKLAR', label: 'Marktstruktur unklar', severity: 'hard' });
    }
    if (setupData.shift_of_structure === false) {
      blockers.push({ code: 'KEIN_SHIFT', label: 'Kein Shift of Structure bestätigt', severity: 'hard' });
    }

    const dailyLock = activeLocks.find(l => l.type === 'daily_lock');
    if (dailyLock) {
      blockers.push({ code: 'DAILY_LOCK_AKTIV', label: 'Tageslimit erreicht. Trading gesperrt bis morgen.', severity: 'hard' });
    }
    const cooldown = activeLocks.find(l => l.type === 'cooldown');
    if (cooldown) {
      const remaining = Math.ceil((new Date(cooldown.active_until) - new Date()) / 60000);
      blockers.push({ code: 'COOLDOWN_AKTIV', label: `Cooldown aktiv. Noch ${remaining} Min.`, severity: 'hard' });
    }
    if (todayStats.total >= s.max_trades_per_day) {
      blockers.push({ code: 'TRADE_LIMIT_ERREICHT', label: `Maximum ${s.max_trades_per_day} Trades/Tag erreicht`, severity: 'hard' });
    }

    // Psych blockers (soft)
    if (setupData.psych_sleep === 'schlecht' || setupData.psych_stress === 'hoch' || setupData.psych_focus === 'niedrig') {
      blockers.push({ code: 'PSYCH_WARNUNG', label: 'Psychologischer Zustand nicht optimal', severity: 'soft' });
    }

    return blockers;
  };

  // Compute go score from setup fields
  const computeGoScore = (setupData) => {
    let score = 0;
    if (setupData.aoi_defined) score += 20;
    if ((setupData.aoi_touches || 0) >= 3) score += 15;
    if (setupData.market_structure_ok) score += 20;
    if (setupData.shift_of_structure) score += 20;
    if (setupData.candle_trigger) score += 15;
    if ((setupData.confluences || []).length >= 2) score += 10;
    return score;
  };

  // Compute grade
  const computeGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 65) return 'B';
    return 'C';
  };

  // Risk engine
  const computeRisk = (entry, stop, target, balance, riskPct) => {
    const e = parseFloat(entry) || 0;
    const s = parseFloat(stop) || 0;
    const t = parseFloat(target) || 0;
    const b = parseFloat(balance) || 0;
    const r = parseFloat(riskPct) || 1;

    if (!e || !s || e === s) return null;

    const stopDist = Math.abs(e - s);
    const riskAmount = b * (r / 100);
    const positionSize = riskAmount / stopDist;
    const rr = t ? Math.abs(t - e) / stopDist : 0;

    return {
      riskAmount: riskAmount.toFixed(2),
      positionSize: positionSize.toFixed(4),
      stopDist: stopDist.toFixed(5),
      rr: rr.toFixed(2),
      potentialProfit: (riskAmount * rr).toFixed(2),
    };
  };

  // Trigger cooldown after loss
  const triggerCooldown = async (reason = 'VERLUST') => {
    const until = addMinutes(new Date(), settings.cooldown_minutes_after_loss);
    await base44.entities.DisciplineEvent.create({
      type: 'cooldown',
      reason_code: reason,
      details: { minutes: settings.cooldown_minutes_after_loss },
      active_until: until.toISOString(),
    });
    await loadEngine();
  };

  // Trigger daily lock
  const triggerDailyLock = async (reason = 'TAGESLIMIT') => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    await base44.entities.DisciplineEvent.create({
      type: 'daily_lock',
      reason_code: reason,
      details: {},
      active_until: tomorrow.toISOString(),
    });
    await loadEngine();
  };

  // Save/update settings
  const saveSettings = async (data) => {
    const existing = await base44.entities.TradingSettings.list();
    if (existing.length > 0) {
      await base44.entities.TradingSettings.update(existing[0].id, data);
    } else {
      await base44.entities.TradingSettings.create(data);
    }
    await loadEngine();
  };

  return {
    settings, todayStats, activeLocks, loading,
    checkBlockers, computeGoScore, computeGrade, computeRisk,
    triggerCooldown, triggerDailyLock, saveSettings, reload: loadEngine,
    todayTrades,
  };
}