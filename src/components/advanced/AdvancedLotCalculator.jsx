import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Target, Zap, TrendingUp, AlertTriangle, Check, Layers } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LIMITS, PRICE_RANGE, RISK_RANGE, LEVERAGE_RANGE, ACCOUNT_RANGE } from '@/lib/inputValidation';

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
    <div className="space-y-2 sm:space-y-3 md:space-y-4">
      {/* Account Size - Compact */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4`}>
        <label className={`flex items-center gap-1.5 sm:gap-2 ${theme.textMuted} text-[10px] sm:text-xs tracking-wider mb-2 sm:mb-3`}>
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
          ACCOUNT
        </label>
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
          {['1000', '5000', '10000', '50000'].map((size) => (
            <button key={size} type="button" onClick={() => { setAccountSize(size); setCustomAccount(''); }}
              className={cn("py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold border transition-all",
                accountSize === size ? "bg-emerald-700 text-white border-emerald-600" : `${theme.input} hover:border-emerald-600/50`)}>
              {size === '1000' ? '1K' : size === '5000' ? '5K' : size === '10000' ? '10K' : '50K'}
            </button>
          ))}
        </div>
        <Input type="number" placeholder="Custom (USD)" value={customAccount}
          min={ACCOUNT_RANGE.MIN} max={ACCOUNT_RANGE.MAX}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length > LIMITS.ACCOUNT) return;
            setCustomAccount(v);
            if (v) setAccountSize(v);
          }}
          className={`${theme.input} text-xs sm:text-sm text-center mb-1.5 sm:mb-2 h-8 sm:h-9 md:h-10`} />
        {accountSize && (
          <div className="text-center p-1.5 sm:p-2 bg-emerald-700/10 border border-emerald-600/20 rounded-md sm:rounded-lg">
            <span className="text-emerald-600 font-bold text-sm sm:text-base md:text-lg">${parseInt(accountSize).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Leverage - Compact */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4`}>
        <label className={`flex items-center gap-1.5 sm:gap-2 ${theme.textMuted} text-[10px] sm:text-xs tracking-wider mb-2 sm:mb-3`}>
          <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
          LEVERAGE
        </label>
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
          {['50', '100', '200', '500'].map((lev) => (
            <button key={lev} type="button" onClick={() => { setLeverage(lev); setCustomLeverage(''); }}
              className={cn("py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold border transition-all",
                leverage === lev ? "bg-blue-500 text-white border-blue-500" : `${theme.input} hover:border-blue-500/50`)}>
              1:{lev}
            </button>
          ))}
        </div>
        <Input type="number" placeholder="Custom" value={customLeverage}
          min={LEVERAGE_RANGE.MIN} max={LEVERAGE_RANGE.MAX}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length > LIMITS.LEVERAGE) return;
            setCustomLeverage(v);
            if (v) setLeverage(v);
          }}
          className={`${theme.input} text-xs sm:text-sm text-center h-8 sm:h-9 md:h-10`} />
      </div>

      {/* Risk - Compact */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4`}>
        <label className={`flex items-center gap-1.5 sm:gap-2 ${theme.textMuted} text-[10px] sm:text-xs tracking-wider mb-2 sm:mb-3`}>
          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
          RISK %
        </label>
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
          {['1', '2', '3', '4', '5'].map((r) => (
            <button key={r} type="button" onClick={() => { setRiskPercent(r); setCustomRisk(''); }}
              className={cn("py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-bold border transition-all",
                riskPercent === r 
                  ? (r === '3' || r === '4' || r === '5') ? "bg-emerald-700 text-white border-emerald-600" : "bg-blue-500 text-white border-blue-500"
                  : `${theme.input} hover:border-emerald-600/50`)}>
              {r}%
            </button>
          ))}
        </div>
        <Input type="number" step="0.1" placeholder="Custom" value={customRisk}
          min={RISK_RANGE.MIN} max={RISK_RANGE.MAX}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length > LIMITS.PERCENT) return;
            setCustomRisk(v);
            if (v) setRiskPercent(v);
          }}
          className={`${theme.input} text-xs sm:text-sm text-center mb-1.5 sm:mb-2 h-8 sm:h-9 md:h-10`} />
        <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 bg-emerald-700/10 text-emerald-500 border border-emerald-600/20">
          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          ZNPCV: 3-5%
        </div>
      </div>

      {/* Trade Levels - Compact */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4`}>
        <label className={`flex items-center gap-1.5 sm:gap-2 ${theme.textMuted} text-[10px] sm:text-xs tracking-wider mb-2 sm:mb-3`}>
          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
          LEVELS
        </label>
        <div className="space-y-1.5 sm:space-y-2">
          <div>
            <label className={`text-[9px] sm:text-[10px] ${theme.textMuted} mb-1 block`}>ENTRY</label>
            <Input type="number" step="0.00001" value={entryPrice}
              min={PRICE_RANGE.MIN} max={PRICE_RANGE.MAX}
              onChange={(e) => { if (e.target.value.length <= LIMITS.PRICE) setEntryPrice(e.target.value); }}
              placeholder="0.00000" className={`${theme.input} text-center text-xs sm:text-sm h-8 sm:h-9 md:h-10`} />
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <div>
              <label className="text-[9px] sm:text-[10px] text-rose-600 mb-1 block">SL</label>
              <Input type="number" step="0.00001" value={stopLoss}
                min={PRICE_RANGE.MIN} max={PRICE_RANGE.MAX}
                onChange={(e) => { if (e.target.value.length <= LIMITS.PRICE) setStopLoss(e.target.value); }}
                placeholder="0.00000" className="bg-rose-600/10 border-rose-600/30 text-center text-xs sm:text-sm h-8 sm:h-9 md:h-10" />
            </div>
            <div>
              <label className="text-[9px] sm:text-[10px] text-emerald-600 mb-1 block">TP</label>
              <Input type="number" step="0.00001" value={takeProfit}
                min={PRICE_RANGE.MIN} max={PRICE_RANGE.MAX}
                onChange={(e) => { if (e.target.value.length <= LIMITS.PRICE) setTakeProfit(e.target.value); }}
                placeholder="0.00000" className="bg-emerald-700/10 border-emerald-600/30 text-center text-xs sm:text-sm h-8 sm:h-9 md:h-10" />
            </div>
          </div>
          <details className="mt-1.5 sm:mt-2">
            <summary className={`text-[9px] sm:text-[10px] ${theme.textMuted} cursor-pointer hover:text-emerald-600`}>+ TP2/TP3</summary>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
              <Input type="number" step="0.00001" value={takeProfit2} onChange={(e) => setTakeProfit2(e.target.value)}
                placeholder="TP2" className={`${theme.input} text-[10px] sm:text-xs text-center h-7 sm:h-8`} />
              <Input type="number" step="0.00001" value={takeProfit3} onChange={(e) => setTakeProfit3(e.target.value)}
                placeholder="TP3" className={`${theme.input} text-[10px] sm:text-xs text-center h-7 sm:h-8`} />
            </div>
          </details>
        </div>
      </div>

      {/* Results - Compact */}
      {calculation?.isValid && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="border-2 border-emerald-600/30 bg-gradient-to-br from-teal-600/10 to-teal-600/5 rounded-lg sm:rounded-xl overflow-hidden">
          <div className="bg-emerald-700 text-white p-2 sm:p-2.5 md:p-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span className="font-bold tracking-wider text-[10px] sm:text-xs md:text-sm">CALCULATION</span>
            </div>
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
          </div>
          
          <div className="p-2.5 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
            <div className={`text-center p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl ${darkMode ? 'bg-black/30' : 'bg-white'}`}>
              <div className={`text-[9px] sm:text-[10px] tracking-widest mb-0.5 sm:mb-1 ${theme.textMuted}`}>LOT SIZE</div>
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${theme.text}`}>{calculation.lotSize}</div>
              <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-2 sm:mt-3 text-[10px] sm:text-xs">
                <div><span className={theme.textMuted}>Mini:</span> <span className="font-bold">{calculation.miniLots}</span></div>
                <div><span className={theme.textMuted}>Micro:</span> <span className="font-bold">{calculation.microLots}</span></div>
                <div><span className={theme.textMuted}>Units:</span> <span className="font-bold">{calculation.units}</span></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className={`p-2 sm:p-2.5 md:p-3 rounded-md sm:rounded-lg ${theme.bg}`}>
                <div className={`text-[8px] sm:text-[9px] ${theme.textMuted}`}>RISK</div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-rose-600">${calculation.riskAmount}</div>
              </div>
              <div className={`p-2 sm:p-2.5 md:p-3 rounded-md sm:rounded-lg ${theme.bg}`}>
                <div className={`text-[8px] sm:text-[9px] ${theme.textMuted}`}>MARGIN</div>
                <div className={`text-sm sm:text-base md:text-lg font-bold ${theme.text}`}>${calculation.marginRequired}</div>
              </div>
              <div className={`p-2 sm:p-2.5 md:p-3 rounded-md sm:rounded-lg ${theme.bg}`}>
                <div className={`text-[8px] sm:text-[9px] ${theme.textMuted}`}>SL PIPS</div>
                <div className={`text-sm sm:text-base md:text-lg font-bold ${theme.text}`}>{calculation.slPips}</div>
              </div>
              <div className={`p-2 sm:p-2.5 md:p-3 rounded-md sm:rounded-lg ${theme.bg}`}>
                <div className={`text-[8px] sm:text-[9px] ${theme.textMuted}`}>R:R</div>
                <div className={cn("text-sm sm:text-base md:text-lg font-bold", 
                  parseFloat(calculation.rr) >= 2.5 ? "text-emerald-600" : 
                  parseFloat(calculation.rr) >= 1.5 ? "text-amber-500" : "text-rose-600")}>
                  1:{calculation.rr}
                </div>
              </div>
            </div>
            
            {parseFloat(calculation.rr) > 0 && (
              <div className="space-y-1.5 sm:space-y-2">
                <div className="p-2 sm:p-2.5 md:p-3 bg-emerald-700/20 border border-emerald-600/30 rounded-md sm:rounded-lg flex items-center justify-between">
                  <span className="text-emerald-600 text-[10px] sm:text-xs font-bold">TP1</span>
                  <span className="text-emerald-600 text-base sm:text-lg md:text-xl font-bold">${calculation.potentialProfit}</span>
                </div>
                {takeProfit2 && parseFloat(calculation.tp2Profit) > 0 && (
                  <div className="p-1.5 sm:p-2 bg-emerald-700/10 rounded-md sm:rounded-lg flex justify-between text-[10px] sm:text-xs">
                    <span className="text-emerald-600">TP2</span>
                    <span className="text-emerald-600 font-bold">${calculation.tp2Profit}</span>
                  </div>
                )}
                {takeProfit3 && parseFloat(calculation.tp3Profit) > 0 && (
                  <div className="p-1.5 sm:p-2 bg-emerald-700/10 rounded-md sm:rounded-lg flex justify-between text-[10px] sm:text-xs">
                    <span className="text-emerald-600">TP3</span>
                    <span className="text-emerald-600 font-bold">${calculation.tp3Profit}</span>
                  </div>
                )}
              </div>
            )}
            
            {parseFloat(calculation.rr) < 2.5 && parseFloat(calculation.rr) > 0 && (
              <div className="p-1.5 sm:p-2 bg-amber-500/10 border border-amber-500/30 rounded-md sm:rounded-lg flex items-center gap-1.5 sm:gap-2">
                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-500 flex-shrink-0" />
                <span className="text-amber-500 text-[9px] sm:text-[10px] md:text-xs">Min. 1:2.5 R:R</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}