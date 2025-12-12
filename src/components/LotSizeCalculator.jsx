import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  Calculator, DollarSign, Percent, Target, Shield, TrendingUp, TrendingDown, 
  RefreshCw, Activity, ChevronDown, Layers, AlertTriangle, Check, Info
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';
import { Input } from "@/components/ui/input";

// Account size presets
const ACCOUNT_SIZES = [
  { value: '1000', label: '$1,000' },
  { value: '5000', label: '$5,000' },
  { value: '10000', label: '$10,000' },
  { value: '25000', label: '$25,000' },
  { value: '50000', label: '$50,000' },
  { value: '100000', label: '$100,000' },
  { value: '200000', label: '$200,000' },
];

// Leverage options
const LEVERAGE_OPTIONS = [
  { value: 1, label: '1:1' },
  { value: 10, label: '1:10' },
  { value: 50, label: '1:50' },
  { value: 100, label: '1:100' },
  { value: 200, label: '1:200' },
  { value: 300, label: '1:300' },
  { value: 400, label: '1:400' },
  { value: 500, label: '1:500' },
];

// Risk percent presets (ZNPCV empfiehlt 3-5%)
const RISK_PRESETS = ['1', '2', '3', '4', '5'];

export default function LotSizeCalculator({ 
  pair, 
  direction, 
  onDataChange,
  initialData = {}
}) {
  const { darkMode, t } = useLanguage();
  
  // Form state
  const [accountSize, setAccountSize] = useState(initialData.account_size || '');
  const [customAccount, setCustomAccount] = useState('');
  const [riskPercent, setRiskPercent] = useState(initialData.risk_percent || '1');
  const [customRisk, setCustomRisk] = useState('');
  const [leverage, setLeverage] = useState(initialData.leverage || '100');
  const [customLeverage, setCustomLeverage] = useState('');
  const [entryPrice, setEntryPrice] = useState(initialData.entry_price || '');
  const [stopLoss, setStopLoss] = useState(initialData.stop_loss || '');
  const [takeProfit, setTakeProfit] = useState(initialData.take_profit || '');
  
  // Live price state
  const [livePrice, setLivePrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch live price from OANDA/TradingView
  const fetchLivePrice = async () => {
    if (!pair) return;
    setLoadingPrice(true);
    
    try {
      const oandaPair = pair.replace('/', '_').toUpperCase();
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get CURRENT LIVE price for ${pair} from TradingView OANDA charts (OANDA:${oandaPair}).
Return precise bid/ask prices. 5 decimals for standard pairs, 3 for JPY, 2 for Gold.`,
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
      setLastUpdate(new Date());
      
      // Auto-fill entry price if empty
      if (!entryPrice && result.price) {
        setEntryPrice(result.price.toString());
      }
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

  // Notify parent of changes
  useEffect(() => {
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

  // Calculate lot size and all values
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
    
    // Pair characteristics
    const p = pair?.toUpperCase() || '';
    const isJPY = p.includes('JPY');
    const isGold = p.includes('XAU') || p.includes('GOLD');
    
    // Pip calculation
    let pipMultiplier = isJPY ? 100 : isGold ? 10 : 10000;
    let pipValue = isJPY ? (1000 / entry) : isGold ? 10 : 10;
    let contractSize = isGold ? 100 : 100000;
    
    const slPips = Math.abs(entry - sl) * pipMultiplier;
    const tpPips = tp ? Math.abs(tp - entry) * pipMultiplier : 0;
    
    // Risk amount
    const riskAmount = account * (risk / 100);
    
    // Lot size = Risk Amount / (SL Pips × Pip Value)
    const lotSize = riskAmount / (slPips * pipValue);
    
    // Position value and margin
    const positionValue = lotSize * contractSize * entry;
    const marginRequired = positionValue / parseFloat(leverage);
    
    // R:R ratio
    const rr = tpDistance > 0 ? tpDistance / slDistance : 0;
    const potentialProfit = riskAmount * rr;
    
    // Spread (if live price available)
    const spread = livePrice?.bid && livePrice?.ask 
      ? ((livePrice.ask - livePrice.bid) * pipMultiplier).toFixed(1) 
      : null;
    
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
      pipValue: pipValue.toFixed(2),
      spread,
      isValid: true
    };
  }, [entryPrice, stopLoss, takeProfit, accountSize, riskPercent, direction, leverage, pair, livePrice]);

  // Decimals for price display
  const decimals = pair?.toUpperCase()?.includes('JPY') ? 3 : pair?.toUpperCase()?.includes('XAU') ? 2 : 5;

  // Theme
  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-white',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textDim: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    input: darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-black',
  };

  return (
    <div className="space-y-4">
      
      {/* Live Price Header */}
      {pair && (
        <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className={`font-bold text-sm ${theme.text}`}>{pair}</div>
                <div className="text-[10px] text-blue-400">OANDA • TradingView</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {loadingPrice ? (
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
                  <span className="text-teal-600 text-xs font-bold">LIVE</span>
                </div>
              )}
            </div>
          </div>
          
          {livePrice && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-rose-600/10' : 'bg-red-50'} border border-rose-600/20`}>
                <div className="text-[9px] text-rose-600">BID</div>
                <div className="text-sm font-bold text-rose-600">{livePrice.bid?.toFixed(decimals)}</div>
              </div>
              <div className={`p-2 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textDim}`}>PREIS</div>
                <div className={`text-sm font-bold ${theme.text}`}>{livePrice.price?.toFixed(decimals)}</div>
              </div>
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-teal-600/10' : 'bg-teal-50'} border border-teal-600/20`}>
                <div className="text-[9px] text-teal-600">ASK</div>
                <div className="text-sm font-bold text-teal-600">{livePrice.ask?.toFixed(decimals)}</div>
              </div>
            </div>
          )}
          
          {lastUpdate && (
            <div className={`text-[10px] ${theme.textDim} text-center mt-2`}>
              Aktualisiert: {lastUpdate.toLocaleTimeString('de-DE')}
              <button onClick={fetchLivePrice} className="ml-2 text-blue-400 hover:text-blue-300">
                <RefreshCw className="w-3 h-3 inline" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Account Size */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
        <label className={`flex items-center gap-2 ${theme.textMuted} text-xs tracking-wider mb-3`}>
          <DollarSign className="w-4 h-4" />
          KONTOGRÖSSE (USD)
        </label>
        
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {ACCOUNT_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => setAccountSize(size.value)}
              className={cn(
                "py-2 px-1 rounded-lg text-xs font-bold transition-all border",
                accountSize === size.value
                  ? "bg-teal-600 text-white border-teal-600"
                  : `${theme.input} hover:border-teal-600/50`
              )}
            >
              {size.label.replace('$', '').replace(',000', 'K').replace(',', '')}
            </button>
          ))}
          <button
            onClick={() => {
              const custom = prompt('Kontogröße in USD:');
              if (custom && !isNaN(custom)) setAccountSize(custom);
            }}
            className={cn(
              "py-2 px-1 rounded-lg text-xs font-bold transition-all border",
              !ACCOUNT_SIZES.find(s => s.value === accountSize) && accountSize
                ? "bg-emerald-500 text-white border-emerald-500"
                : `${theme.input} hover:border-emerald-500/50`
            )}
          >
            {!ACCOUNT_SIZES.find(s => s.value === accountSize) && accountSize 
              ? `$${parseInt(accountSize).toLocaleString()}` 
              : 'Andere'}
          </button>
        </div>
        
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
          HEBEL (LEVERAGE)
        </label>
        
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {[50, 100, 200, 500].map((lev) => (
            <button
              key={lev}
              onClick={() => {
                setLeverage(lev.toString());
                setCustomLeverage('');
              }}
              className={cn(
                "py-2 px-1 rounded-lg text-xs font-bold transition-all border",
                leverage === lev.toString()
                  ? "bg-blue-500 text-white border-blue-500"
                  : `${theme.input} hover:border-blue-500/50`
              )}
            >
              1:{lev}
            </button>
          ))}
        </div>
        <Input
          type="number"
          placeholder="Individuell (z.B. 300)"
          value={customLeverage}
          onChange={(e) => {
            setCustomLeverage(e.target.value);
            if (e.target.value) setLeverage(e.target.value);
          }}
          className={`${theme.input} text-sm text-center`}
        />
      </div>

      {/* Risk Percent */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
        <label className={`flex items-center gap-2 ${theme.textMuted} text-xs tracking-wider mb-3`}>
          <Percent className="w-4 h-4" />
          RISIKO PRO TRADE
        </label>
        
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          {['1', '2', '3', '4', '5'].map((risk) => (
            <button
              key={risk}
              onClick={() => {
                setRiskPercent(risk);
                setCustomRisk('');
              }}
              className={cn(
                "py-2.5 rounded-lg text-sm font-bold transition-all border",
                riskPercent === risk
                  ? (risk === '3' || risk === '4' || risk === '5') 
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-blue-500 text-white border-blue-500"
                  : `${theme.input} hover:border-teal-600/50`
              )}
            >
              {risk}%
            </button>
          ))}
        </div>
        
        <Input
          type="number"
          step="0.1"
          placeholder="Individuell (z.B. 2.5)"
          value={customRisk}
          onChange={(e) => {
            setCustomRisk(e.target.value);
            if (e.target.value) setRiskPercent(e.target.value);
          }}
          className={`${theme.input} text-sm text-center mb-2`}
        />
        
        {/* Info: ZNPCV empfiehlt 3-5% */}
        <div className={`p-2 rounded-lg text-xs flex items-center gap-2 bg-teal-600/10 text-teal-400 border border-teal-600/20`}>
          <Check className="w-3 h-3" />
          ZNPCV empfiehlt 3-5% Risiko pro Trade
        </div>
        
        {accountSize && riskPercent && (
          <div className={`mt-2 text-center p-2 rounded-lg ${theme.bg}`}>
            <span className={`text-xs ${theme.textDim}`}>Risiko: </span>
            <span className="font-bold text-teal-400">
              ${(parseFloat(accountSize) * parseFloat(riskPercent) / 100).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Trade Levels */}
      <div className={`${theme.bgCard} border ${theme.border} rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <label className={`flex items-center gap-2 ${theme.textMuted} text-xs tracking-wider`}>
            <Target className="w-4 h-4" />
            TRADE LEVELS
          </label>
          {direction && (
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${direction === 'long' ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white'}`}>
              {direction === 'long' ? '↑ LONG' : '↓ SHORT'}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div>
            <label className={`text-[10px] ${theme.textDim} mb-1 block`}>ENTRY PREIS</label>
            <div className="relative">
              <Input 
                type="number" 
                step="0.00001" 
                value={entryPrice} 
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder={livePrice?.price?.toFixed(decimals) || "0.00000"}
                className={`${theme.input} h-10 rounded-lg text-center pr-16`}
              />
              {livePrice && (
                <button 
                  onClick={() => setEntryPrice(livePrice.price?.toString())}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 hover:text-blue-300"
                >
                  LIVE
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-[10px] text-rose-600 mb-1">
                <Shield className="w-3 h-3" />
                STOP LOSS
              </label>
              <Input 
                type="number" 
                step="0.00001" 
                value={stopLoss} 
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="0.00000"
                className="bg-rose-600/10 border-rose-600/30 text-center h-10 rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-[10px] text-teal-600 mb-1">
                <TrendingUp className="w-3 h-3" />
                TAKE PROFIT
              </label>
              <Input 
                type="number" 
                step="0.00001" 
                value={takeProfit} 
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="0.00000"
                className="bg-teal-600/10 border-teal-600/30 text-center h-10 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {calculation && calculation.isValid && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-teal-600/30 bg-gradient-to-br from-teal-600/10 to-teal-600/5 rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-teal-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <span className="font-bold tracking-wider text-sm">BERECHNUNG</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span className="text-xs">BEREIT</span>
            </div>
          </div>
          
          {/* Main Result - Lot Size */}
          <div className="p-4">
            <div className={`text-center p-5 rounded-xl mb-4 ${darkMode ? 'bg-black/30' : 'bg-white'}`}>
              <div className={`text-[10px] tracking-widest mb-1 ${theme.textDim}`}>EMPFOHLENE LOT SIZE</div>
              <div className={`text-5xl font-bold ${theme.text}`}>{calculation.lotSize}</div>
              <div className={`text-sm ${theme.textMuted}`}>Standard Lots</div>
            </div>
            
            {/* Lot Variants */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className={`text-center p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textDim}`}>MINI LOTS</div>
                <div className={`text-lg font-bold ${theme.text}`}>{calculation.miniLots}</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textDim}`}>MICRO LOTS</div>
                <div className={`text-lg font-bold ${theme.text}`}>{calculation.microLots}</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textDim}`}>UNITS</div>
                <div className={`text-lg font-bold ${theme.text}`}>{calculation.units.toLocaleString()}</div>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className={`p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textDim}`}>RISIKO</div>
                <div className="text-lg font-bold text-red-400">${calculation.riskAmount}</div>
              </div>
              <div className={`p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textDim}`}>MARGIN</div>
                <div className={`text-lg font-bold ${theme.text}`}>${calculation.marginRequired}</div>
              </div>
              <div className={`p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textDim}`}>SL PIPS</div>
                <div className={`text-lg font-bold ${theme.text}`}>{calculation.slPips}</div>
              </div>
              <div className={`p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-[9px] ${theme.textDim}`}>R:R RATIO</div>
                <div className={cn("text-lg font-bold", 
                  parseFloat(calculation.rr) >= 2.5 ? "text-teal-600" : 
                  parseFloat(calculation.rr) >= 1.5 ? "text-amber-500" : "text-rose-600"
                )}>
                  1:{calculation.rr}
                </div>
              </div>
            </div>
            
            {/* Potential Profit */}
            {parseFloat(calculation.rr) > 0 && (
              <div className="p-3 bg-teal-600/20 border border-teal-600/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <span className="text-teal-600 text-xs font-bold">POTENZIELLER GEWINN</span>
                </div>
                <span className="text-teal-600 text-xl font-bold">${calculation.potentialProfit}</span>
              </div>
            )}
            
            {/* Warnings */}
            {parseFloat(calculation.rr) > 0 && parseFloat(calculation.rr) < 2.5 && (
              <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-amber-500 text-xs">ZNPCV empfiehlt min. 1:2.5 R:R</span>
              </div>
            )}
            
            {parseFloat(calculation.rr) >= 2.5 && (
              <div className="mt-2 p-2 bg-teal-600/10 border border-teal-600/30 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                <span className="text-teal-600 text-xs">Gutes Risk:Reward Verhältnis!</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Hint when missing data */}
      {(!calculation || !calculation.isValid) && accountSize && (
        <div className={`p-4 rounded-xl text-center ${theme.bgCard} border ${theme.border}`}>
          <Info className={`w-8 h-8 mx-auto mb-2 ${theme.textDim}`} />
          <div className={`text-sm ${theme.textMuted}`}>
            Gib Entry & Stop Loss ein für die Berechnung
          </div>
        </div>
      )}
    </div>
  );
}