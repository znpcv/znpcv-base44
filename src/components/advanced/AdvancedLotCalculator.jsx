import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Target, Zap, TrendingUp, AlertTriangle, Check, Layers } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AdvancedLotCalculator({ pair, direction, onDataChange, initialData = {}, darkMode }) {
  const [accountSize, setAccountSize] = useState(initialData?.account_size || '');
  const [customAccount, setCustomAccount] = useState('');
  const [riskPercent, setRiskPercent] = useState(initialData?.risk_percent || '3');
  const [customRisk, setCustomRisk] = useState('');
  const [leverage, setLeverage] = useState(initialData?.leverage || '100');
  const [customLeverage, setCustomLeverage] = useState('');
  const [entryPrice, setEntryPrice] = useState(initialData?.entry_price || '');
  const [stopLoss, setStopLoss] = useState(initialData?.stop_loss || '');
  const [takeProfit, setTakeProfit] = useState(initialData?.take_profit || '');
  const [takeProfit2, setTakeProfit2] = useState('');
  const [takeProfit3, setTakeProfit3] = useState('');

  React.useEffect(() => {
    if (onDataChange) {
      onDataChange({
        account_size: accountSize,
        risk_percent: riskPercent,
        entry_price: entryPrice,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        leverage
      });
    }
  }, [accountSize, riskPercent, entryPrice, stopLoss, takeProfit, leverage]);

  const calculation = useMemo(() => {
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    const account = parseFloat(accountSize) || 0;
    const risk = parseFloat(riskPercent) || 1;
    
    if (!entry || !sl || !account) return null;
    
    const isLong = direction === 'long';
    const slDistance = isLong ? entry - sl : sl - entry;
    const tpDistance = tp ? (isLong ? tp - entry : entry - tp) : 0;
    
    if (slDistance <= 0) return null;
    
    const p = pair?.toUpperCase() || '';
    const isJPY = p.includes('JPY');
    const isGold = p.includes('XAU') || p.includes('GOLD');
    
    let pipMultiplier = isJPY ? 100 : isGold ? 10 : 10000;
    let pipValue = isJPY ? (1000 / entry) : isGold ? 10 : 10;
    let contractSize = isGold ? 100 : 100000;
    
    const slPips = Math.abs(entry - sl) * pipMultiplier;
    const tpPips = tp ? Math.abs(tp - entry) * pipMultiplier : 0;
    
    const riskAmount = account * (risk / 100);
    const lotSize = riskAmount / (slPips * pipValue);
    const positionValue = lotSize * contractSize * entry;
    const marginRequired = positionValue / (parseFloat(leverage) || 100);
    
    const rr = tpDistance > 0 ? tpDistance / slDistance : 0;
    const potentialProfit = riskAmount * rr;
    
    // Multiple TP levels
    const tp2Profit = takeProfit2 ? riskAmount * (isLong ? (parseFloat(takeProfit2) - entry) : (entry - parseFloat(takeProfit2))) / slDistance : 0;
    const tp3Profit = takeProfit3 ? riskAmount * (isLong ? (parseFloat(takeProfit3) - entry) : (entry - parseFloat(takeProfit3))) / slDistance : 0;
    
    return {
      lotSize: lotSize.toFixed(2),
      miniLots: (lotSize * 10).toFixed(2),
      microLots: (lotSize * 100).toFixed(0),
      units: Math.round(lotSize * contractSize),
      riskAmount: riskAmount.toFixed(2),
      potentialProfit: potentialProfit.toFixed(2),
      slPips: slPips.toFixed(1),
      tpPips: tpPips.toFixed(1),
      rr: rr.toFixed(2),
      marginRequired: marginRequired.toFixed(2),
      positionValue: positionValue.toFixed(0),
      tp2Profit: tp2Profit.toFixed(2),
      tp3Profit: tp3Profit.toFixed(2),
      marginPercent: ((marginRequired / account) * 100).toFixed(1),
      isValid: true
    };
  }, [entryPrice, stopLoss, takeProfit, takeProfit2, takeProfit3, accountSize, riskPercent, direction, leverage, pair]);

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    input: darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-black',
  };

  return (
    <div className="space-y-4">
      {/* Account Size */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
        <label className={`flex items-center gap-2 ${theme.textMuted} text-xs tracking-wider mb-3`}>
          <DollarSign className="w-4 h-4" />
          KONTOGRÖSSE
        </label>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {['1000', '5000', '10000', '50000'].map((size) => (
            <button key={size} type="button" onClick={() => { setAccountSize(size); setCustomAccount(''); }}
              className={cn("py-2 rounded-lg text-xs font-bold border transition-all",
                accountSize === size ? "bg-teal-600 text-white border-teal-600" : `${theme.input} hover:border-teal-600/50`)}>
              {size === '1000' ? '1K' : size === '5000' ? '5K' : size === '10000' ? '10K' : '50K'}
            </button>
          ))}
        </div>
        <Input type="number" placeholder="Individuelle Kontogröße (USD)" value={customAccount}
          onChange={(e) => { setCustomAccount(e.target.value); if (e.target.value) setAccountSize(e.target.value); }}
          className={`${theme.input} text-sm text-center mb-2`} />
        {accountSize && (
          <div className="text-center p-2 bg-teal-600/10 border border-teal-600/20 rounded-lg">
            <span className="text-teal-600 font-bold text-lg">${parseInt(accountSize).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Leverage */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
        <label className={`flex items-center gap-2 ${theme.textMuted} text-xs tracking-wider mb-3`}>
          <Layers className="w-4 h-4" />
          HEBEL
        </label>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {['50', '100', '200', '500'].map((lev) => (
            <button key={lev} type="button" onClick={() => { setLeverage(lev); setCustomLeverage(''); }}
              className={cn("py-2 rounded-lg text-xs font-bold border transition-all",
                leverage === lev ? "bg-blue-500 text-white border-blue-500" : `${theme.input} hover:border-blue-500/50`)}>
              1:{lev}
            </button>
          ))}
        </div>
        <Input type="number" placeholder="Individuell (z.B. 300)" value={customLeverage}
          onChange={(e) => { setCustomLeverage(e.target.value); if (e.target.value) setLeverage(e.target.value); }}
          className={`${theme.input} text-sm text-center`} />
      </div>

      {/* Risk */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
        <label className={`flex items-center gap-2 ${theme.textMuted} text-xs tracking-wider mb-3`}>
          <Target className="w-4 h-4" />
          RISIKO PRO TRADE
        </label>
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          {['1', '2', '3', '4', '5'].map((r) => (
            <button key={r} type="button" onClick={() => { setRiskPercent(r); setCustomRisk(''); }}
              className={cn("py-2 rounded-lg text-sm font-bold border transition-all",
                riskPercent === r 
                  ? (r === '3' || r === '4' || r === '5') ? "bg-teal-600 text-white border-teal-600" : "bg-blue-500 text-white border-blue-500"
                  : `${theme.input} hover:border-teal-600/50`)}>
              {r}%
            </button>
          ))}
        </div>
        <Input type="number" step="0.1" placeholder="Individuell (z.B. 2.5)" value={customRisk}
          onChange={(e) => { setCustomRisk(e.target.value); if (e.target.value) setRiskPercent(e.target.value); }}
          className={`${theme.input} text-sm text-center mb-2`} />
        <div className="p-2 rounded-lg text-xs flex items-center gap-2 bg-teal-600/10 text-teal-400 border border-teal-600/20">
          <Check className="w-3 h-3" />
          ZNPCV empfiehlt 3-5%
        </div>
      </div>

      {/* Trade Levels */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
        <label className={`flex items-center gap-2 ${theme.textMuted} text-xs tracking-wider mb-3`}>
          <Target className="w-4 h-4" />
          TRADE LEVELS
        </label>
        <div className="space-y-2">
          <div>
            <label className={`text-[10px] ${theme.textMuted} mb-1 block`}>ENTRY</label>
            <Input type="number" step="0.00001" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="0.00000" className={`${theme.input} text-center`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-rose-600 mb-1 block">STOP LOSS</label>
              <Input type="number" step="0.00001" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
                placeholder="0.00000" className="bg-rose-600/10 border-rose-600/30 text-center" />
            </div>
            <div>
              <label className="text-[10px] text-teal-600 mb-1 block">TAKE PROFIT</label>
              <Input type="number" step="0.00001" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="0.00000" className="bg-teal-600/10 border-teal-600/30 text-center" />
            </div>
          </div>
          <details className="mt-2">
            <summary className={`text-[10px] ${theme.textMuted} cursor-pointer hover:text-teal-600`}>+ Weitere TP Levels</summary>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input type="number" step="0.00001" value={takeProfit2} onChange={(e) => setTakeProfit2(e.target.value)}
                placeholder="TP2" className={`${theme.input} text-xs text-center`} />
              <Input type="number" step="0.00001" value={takeProfit3} onChange={(e) => setTakeProfit3(e.target.value)}
                placeholder="TP3" className={`${theme.input} text-xs text-center`} />
            </div>
          </details>
        </div>
      </div>

      {/* Results */}
      {calculation?.isValid && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="border-2 border-teal-600/30 bg-gradient-to-br from-teal-600/10 to-teal-600/5 rounded-xl overflow-hidden">
          <div className="bg-teal-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <span className="font-bold tracking-wider text-sm">ADVANCED CALCULATION</span>
            </div>
            <Zap className="w-4 h-4" />
          </div>
          
          <div className="p-4 space-y-3">
            <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-black/30' : 'bg-white'}`}>
              <div className={`text-[10px] tracking-widest mb-1 ${theme.textMuted}`}>LOT SIZE</div>
              <div className={`text-4xl font-bold ${theme.text}`}>{calculation.lotSize}</div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div><span className={theme.textMuted}>Mini:</span> <span className="font-bold">{calculation.miniLots}</span></div>
                <div><span className={theme.textMuted}>Micro:</span> <span className="font-bold">{calculation.microLots}</span></div>
                <div><span className={theme.textMuted}>Units:</span> <span className="font-bold">{calculation.units}</span></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textMuted}`}>RISIKO</div>
                <div className="text-lg font-bold text-rose-600">${calculation.riskAmount}</div>
              </div>
              <div className={`p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textMuted}`}>MARGIN ({calculation.marginPercent}%)</div>
                <div className={`text-lg font-bold ${theme.text}`}>${calculation.marginRequired}</div>
              </div>
              <div className={`p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textMuted}`}>SL PIPS</div>
                <div className={`text-lg font-bold ${theme.text}`}>{calculation.slPips}</div>
              </div>
              <div className={`p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textMuted}`}>R:R</div>
                <div className={cn("text-lg font-bold", 
                  parseFloat(calculation.rr) >= 2.5 ? "text-teal-600" : 
                  parseFloat(calculation.rr) >= 1.5 ? "text-amber-500" : "text-rose-600")}>
                  1:{calculation.rr}
                </div>
              </div>
            </div>
            
            {parseFloat(calculation.rr) > 0 && (
              <div className="space-y-2">
                <div className="p-3 bg-teal-600/20 border border-teal-600/30 rounded-lg flex items-center justify-between">
                  <span className="text-teal-600 text-xs font-bold">TP1 PROFIT</span>
                  <span className="text-teal-600 text-xl font-bold">${calculation.potentialProfit}</span>
                </div>
                {takeProfit2 && parseFloat(calculation.tp2Profit) > 0 && (
                  <div className="p-2 bg-teal-600/10 rounded-lg flex justify-between text-xs">
                    <span className="text-teal-600">TP2 PROFIT</span>
                    <span className="text-teal-600 font-bold">${calculation.tp2Profit}</span>
                  </div>
                )}
                {takeProfit3 && parseFloat(calculation.tp3Profit) > 0 && (
                  <div className="p-2 bg-teal-600/10 rounded-lg flex justify-between text-xs">
                    <span className="text-teal-600">TP3 PROFIT</span>
                    <span className="text-teal-600 font-bold">${calculation.tp3Profit}</span>
                  </div>
                )}
              </div>
            )}
            
            {parseFloat(calculation.rr) < 2.5 && parseFloat(calculation.rr) > 0 && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-amber-500 text-xs">ZNPCV empfiehlt min. 1:2.5 R:R</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}