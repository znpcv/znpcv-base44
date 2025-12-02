import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  Calculator, DollarSign, Percent, Target, Shield, TrendingUp, TrendingDown, 
  RefreshCw, Activity, Layers, AlertTriangle, Check, ChevronRight, Zap
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import { Input } from "@/components/ui/input";

// Presets
const ACCOUNT_SIZES = ['1000', '5000', '10000', '25000', '50000', '100000'];
const LEVERAGE_OPTIONS = [
  { value: 50, label: '1:50' },
  { value: 100, label: '1:100' },
  { value: 200, label: '1:200' },
  { value: 500, label: '1:500' },
];
const RISK_PRESETS = ['0.5', '1', '2', '3'];

export default function LotSizeCalculator({ pair, direction, onDataChange, initialData = {} }) {
  const { darkMode } = useLanguage();
  
  // State
  const [accountSize, setAccountSize] = useState(initialData.account_size || '10000');
  const [riskPercent, setRiskPercent] = useState(initialData.risk_percent || '1');
  const [leverage, setLeverage] = useState(100);
  const [entryPrice, setEntryPrice] = useState(initialData.entry_price || '');
  const [stopLoss, setStopLoss] = useState(initialData.stop_loss || '');
  const [takeProfit, setTakeProfit] = useState(initialData.take_profit || '');
  
  // Live price
  const [livePrice, setLivePrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Fetch live price
  const fetchLivePrice = async () => {
    if (!pair) return;
    setLoadingPrice(true);
    try {
      const oandaPair = pair.replace('/', '_').toUpperCase();
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get CURRENT LIVE forex price for ${pair} from TradingView OANDA (OANDA:${oandaPair}). Return bid, ask, current price. Use 5 decimals for EUR/USD etc, 3 for JPY pairs, 2 for Gold.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            bid: { type: "number" },
            ask: { type: "number" },
            price: { type: "number" }
          },
          required: ["price"]
        }
      });
      setLivePrice(result);
      if (!entryPrice && result.price) setEntryPrice(result.price.toString());
    } catch (err) {
      console.error('Price fetch error:', err);
    } finally {
      setLoadingPrice(false);
    }
  };

  useEffect(() => {
    if (pair) {
      fetchLivePrice();
      const interval = setInterval(fetchLivePrice, 60000);
      return () => clearInterval(interval);
    }
  }, [pair]);

  // Notify parent
  useEffect(() => {
    onDataChange?.({ account_size: accountSize, risk_percent: riskPercent, entry_price: entryPrice, stop_loss: stopLoss, take_profit: takeProfit, leverage });
  }, [accountSize, riskPercent, entryPrice, stopLoss, takeProfit, leverage]);

  // Calculation
  const calc = useMemo(() => {
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    const account = parseFloat(accountSize) || 0;
    const risk = parseFloat(riskPercent) || 1;
    
    if (!entry || !sl || !account) return null;
    
    const isLong = direction === 'long';
    const slDist = isLong ? entry - sl : sl - entry;
    const tpDist = tp ? (isLong ? tp - entry : entry - tp) : 0;
    
    if (slDist <= 0) return null;
    
    const p = pair?.toUpperCase() || '';
    const isJPY = p.includes('JPY');
    const isGold = p.includes('XAU') || p.includes('GOLD');
    
    const pipMult = isJPY ? 100 : isGold ? 10 : 10000;
    const pipVal = isJPY ? (1000 / entry) : isGold ? 10 : 10;
    const contractSize = isGold ? 100 : 100000;
    
    const slPips = Math.abs(entry - sl) * pipMult;
    const tpPips = tp ? Math.abs(tp - entry) * pipMult : 0;
    const riskAmt = account * (risk / 100);
    const lotSize = riskAmt / (slPips * pipVal);
    const posValue = lotSize * contractSize * entry;
    const margin = posValue / leverage;
    const rr = tpDist > 0 ? tpDist / slDist : 0;
    const profit = riskAmt * rr;
    
    return {
      lots: lotSize.toFixed(2),
      mini: (lotSize * 10).toFixed(2),
      micro: (lotSize * 100).toFixed(0),
      units: Math.round(lotSize * contractSize),
      risk: riskAmt.toFixed(2),
      profit: profit.toFixed(2),
      slPips: slPips.toFixed(1),
      tpPips: tpPips.toFixed(1),
      rr: rr.toFixed(2),
      margin: margin.toFixed(2)
    };
  }, [entryPrice, stopLoss, takeProfit, accountSize, riskPercent, direction, leverage, pair]);

  const decimals = pair?.toUpperCase()?.includes('JPY') ? 3 : pair?.toUpperCase()?.includes('XAU') ? 2 : 5;

  return (
    <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      
      {/* Header with Live Price */}
      <div className={`p-4 ${darkMode ? 'bg-zinc-900' : 'bg-white'} border-b ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
              <Calculator className={`w-5 h-5 ${darkMode ? 'text-black' : 'text-white'}`} />
            </div>
            <div>
              <h3 className={`font-bold tracking-wider ${darkMode ? 'text-white' : 'text-black'}`}>POSITION SIZE</h3>
              <div className="flex items-center gap-2">
                {pair && <span className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{pair}</span>}
                {direction && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${direction === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {direction === 'long' ? '↑ LONG' : '↓ SHORT'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Live Price Badge */}
          {pair && (
            <div className={`text-right ${loadingPrice ? 'animate-pulse' : ''}`}>
              {livePrice ? (
                <>
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                    {livePrice.price?.toFixed(decimals)}
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-500 text-[10px] font-bold">OANDA LIVE</span>
                    <button onClick={fetchLivePrice} className="ml-1">
                      <RefreshCw className={`w-3 h-3 ${loadingPrice ? 'animate-spin text-blue-400' : 'text-zinc-500 hover:text-white'}`} />
                    </button>
                  </div>
                </>
              ) : (
                <div className={`text-sm ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {loadingPrice ? 'Laden...' : 'Kein Preis'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Account Size - Minimal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
              <DollarSign className="w-3 h-3 inline mr-1" />KONTO
            </span>
            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
              ${parseInt(accountSize || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-1">
            {ACCOUNT_SIZES.map((size) => (
              <button key={size} onClick={() => setAccountSize(size)}
                className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                  accountSize === size
                    ? darkMode ? "bg-white text-black" : "bg-zinc-900 text-white"
                    : darkMode ? "bg-zinc-800 text-zinc-500 hover:text-white" : "bg-zinc-200 text-zinc-600 hover:text-black"
                )}>
                {size === '1000' ? '1K' : size === '5000' ? '5K' : size === '10000' ? '10K' : size === '25000' ? '25K' : size === '50000' ? '50K' : '100K'}
              </button>
            ))}
            <button onClick={() => { const c = prompt('Konto ($):'); if (c && !isNaN(c)) setAccountSize(c); }}
              className={cn("px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                !ACCOUNT_SIZES.includes(accountSize) && accountSize
                  ? darkMode ? "bg-white text-black" : "bg-zinc-900 text-white"
                  : darkMode ? "bg-zinc-800 text-zinc-500 hover:text-white" : "bg-zinc-200 text-zinc-600 hover:text-black"
              )}>
              ✏️
            </button>
          </div>
        </div>

        {/* Risk & Leverage Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Risk */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                <Percent className="w-3 h-3 inline mr-1" />RISIKO
              </span>
              <span className={`text-xs font-bold ${parseFloat(riskPercent) >= 2.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                ${accountSize ? (parseFloat(accountSize) * parseFloat(riskPercent) / 100).toFixed(0) : '0'}
              </span>
            </div>
            <div className="flex gap-1">
              {RISK_PRESETS.map((r) => (
                <button key={r} onClick={() => setRiskPercent(r)}
                  className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    riskPercent === r
                      ? r === '3' ? "bg-red-500 text-white" : r === '2' ? "bg-yellow-500 text-black" : "bg-emerald-500 text-white"
                      : darkMode ? "bg-zinc-800 text-zinc-500 hover:text-white" : "bg-zinc-200 text-zinc-600 hover:text-black"
                  )}>
                  {r}%
                </button>
              ))}
            </div>
          </div>
          
          {/* Leverage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                <Layers className="w-3 h-3 inline mr-1" />HEBEL
              </span>
              <span className={cn("text-xs font-bold", leverage >= 200 ? 'text-yellow-500' : darkMode ? 'text-white' : 'text-black')}>
                1:{leverage}
              </span>
            </div>
            <div className="flex gap-1">
              {LEVERAGE_OPTIONS.map((l) => (
                <button key={l.value} onClick={() => setLeverage(l.value)}
                  className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    leverage === l.value
                      ? l.value >= 500 ? "bg-red-500 text-white" : l.value >= 200 ? "bg-yellow-500 text-black" : "bg-blue-500 text-white"
                      : darkMode ? "bg-zinc-800 text-zinc-500 hover:text-white" : "bg-zinc-200 text-zinc-600 hover:text-black"
                  )}>
                  {l.label.replace('1:', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trade Levels - Clean */}
        <div className={`p-3 rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={`text-[9px] tracking-wider ${darkMode ? 'text-zinc-600' : 'text-zinc-500'} flex items-center gap-1 mb-1`}>
                <Target className="w-2.5 h-2.5" />ENTRY
              </label>
              <div className="relative">
                <Input type="number" step="0.00001" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder={livePrice?.price?.toFixed(decimals) || "—"}
                  className={`h-9 text-center text-sm font-bold rounded-lg ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-300 text-black'}`} />
                {livePrice && !entryPrice && (
                  <button onClick={() => setEntryPrice(livePrice.price?.toString())} 
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-blue-400 px-1.5 py-0.5 bg-blue-500/20 rounded">
                    LIVE
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="text-[9px] tracking-wider text-red-400 flex items-center gap-1 mb-1">
                <Shield className="w-2.5 h-2.5" />SL
              </label>
              <Input type="number" step="0.00001" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
                placeholder="—" className="h-9 text-center text-sm font-bold rounded-lg bg-red-500/10 border-red-500/20 text-red-400" />
            </div>
            <div>
              <label className="text-[9px] tracking-wider text-emerald-400 flex items-center gap-1 mb-1">
                <TrendingUp className="w-2.5 h-2.5" />TP
              </label>
              <Input type="number" step="0.00001" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="—" className="h-9 text-center text-sm font-bold rounded-lg bg-emerald-500/10 border-emerald-500/20 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {calc && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* Main Result - Big Lot Size */}
              <div className={`p-4 rounded-xl text-center mb-3 ${darkMode ? 'bg-gradient-to-br from-zinc-900 to-black border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}>
                <div className={`text-[10px] tracking-widest mb-1 ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  EMPFOHLENE POSITION
                </div>
                <div className={`text-5xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>
                  {calc.lots}
                </div>
                <div className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>STANDARD LOTS</div>
                
                {/* Mini/Micro/Units */}
                <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-dashed border-zinc-800/50">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{calc.mini}</div>
                    <div className={`text-[9px] ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>MINI</div>
                  </div>
                  <div className={`w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                  <div className="text-center">
                    <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{calc.micro}</div>
                    <div className={`text-[9px] ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>MICRO</div>
                  </div>
                  <div className={`w-px ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                  <div className="text-center">
                    <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{calc.units.toLocaleString()}</div>
                    <div className={`text-[9px] ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>UNITS</div>
                  </div>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className={`p-2.5 rounded-lg text-center ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                  <div className={`text-[8px] ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>RISIKO</div>
                  <div className="text-sm font-bold text-red-400">${calc.risk}</div>
                </div>
                <div className={`p-2.5 rounded-lg text-center ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                  <div className={`text-[8px] ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>SL PIPS</div>
                  <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{calc.slPips}</div>
                </div>
                <div className={`p-2.5 rounded-lg text-center ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                  <div className={`text-[8px] ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>MARGIN</div>
                  <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>${calc.margin}</div>
                </div>
                <div className={`p-2.5 rounded-lg text-center ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                  <div className={`text-[8px] ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>R:R</div>
                  <div className={cn("text-sm font-bold", 
                    parseFloat(calc.rr) >= 2 ? "text-emerald-400" : parseFloat(calc.rr) >= 1 ? "text-yellow-500" : "text-red-400"
                  )}>
                    {parseFloat(calc.rr) > 0 ? `1:${calc.rr}` : '—'}
                  </div>
                </div>
              </div>
              
              {/* Profit Box */}
              {parseFloat(calc.rr) > 0 && (
                <div className={`p-3 rounded-xl flex items-center justify-between ${parseFloat(calc.rr) >= 2 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                  <div className="flex items-center gap-2">
                    {parseFloat(calc.rr) >= 2 ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className={`text-xs font-bold ${parseFloat(calc.rr) >= 2 ? 'text-emerald-400' : 'text-yellow-500'}`}>
                      {parseFloat(calc.rr) >= 2 ? 'GUTES R:R' : 'MIN. 1:2 EMPFOHLEN'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-[9px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>GEWINN</div>
                    <div className="text-lg font-bold text-emerald-400">${calc.profit}</div>
                  </div>
                </div>
              )}
              
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!calc && entryPrice && (
          <div className={`p-6 rounded-xl text-center ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-zinc-700' : 'text-zinc-300'}`} />
            <div className={`text-sm ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>
              Stop Loss eingeben für Berechnung
            </div>
          </div>
        )}
        
        {!calc && !entryPrice && accountSize && (
          <div className={`p-6 rounded-xl text-center ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <Target className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-zinc-700' : 'text-zinc-300'}`} />
            <div className={`text-sm ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>
              Entry & Stop Loss eingeben
            </div>
          </div>
        )}
        
      </div>
      
      {/* Footer */}
      <div className={`px-4 py-2 text-center border-t ${darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50'}`}>
        <span className={`text-[9px] tracking-widest ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>
          ZNPCV POSITION CALCULATOR • OANDA DATA
        </span>
      </div>
    </div>
  );
}