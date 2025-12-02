import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, RefreshCw, Activity, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/LanguageContext';

export default function LivePriceTracker({ pair, direction, accountSize, riskPercent, stopLoss, takeProfit, onPriceUpdate, onCalculation }) {
  const { darkMode, t } = useLanguage();
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Convert pair format for OANDA (e.g., EUR/USD -> EUR_USD)
  const formatPairForOanda = (p) => {
    if (!p) return '';
    return p.replace('/', '_').toUpperCase();
  };

  const fetchLivePrice = async () => {
    if (!pair) return;
    
    setLoading(true);
    setError(null);
    
    const oandaPair = formatPairForOanda(pair);
    
    try {
      // Get live price from OANDA via TradingView
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get the CURRENT LIVE market price for ${pair} (${oandaPair}) from TradingView OANDA charts.

CRITICAL: The data MUST come from TradingView with OANDA as the broker/data provider.
- Search for "TradingView OANDA ${pair}" or "OANDA:${oandaPair} TradingView"
- Check tradingview.com for OANDA:${oandaPair} chart
- The symbol format on TradingView is OANDA:${oandaPair}

This is the exact same data traders see on TradingView when using OANDA charts.

Return PRECISE prices:
- 5 decimal places for standard Forex (EUR/USD, GBP/USD, etc.)
- 3 decimal places for JPY pairs (USD/JPY, EUR/JPY, etc.)
- 2 decimal places for Gold (XAU/USD)

IMPORTANT: Bid = selling price, Ask = buying price. The spread should be realistic (typically 0.5-3 pips for major pairs).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            current_price: { type: "number", description: "Mid price (average of bid and ask)" },
            bid: { type: "number", description: "OANDA bid price from TradingView" },
            ask: { type: "number", description: "OANDA ask price from TradingView" },
            spread: { type: "number", description: "Spread in pips" },
            change_percent: { type: "number", description: "Daily change percentage" },
            high_24h: { type: "number", description: "Daily high" },
            low_24h: { type: "number", description: "Daily low" },
            open: { type: "number", description: "Daily open price" },
            source: { type: "string", description: "Should be OANDA via TradingView" },
            timestamp: { type: "string", description: "Time of the quote" }
          },
          required: ["current_price", "bid", "ask"]
        }
      });

      setPriceData(result);
      setLastUpdate(new Date());
      
      if (onPriceUpdate && result.current_price) {
        onPriceUpdate(result.current_price);
      }

      // Calculate lot size with live price
      if (result.current_price && accountSize && riskPercent && stopLoss) {
        const calc = calculateLotSize(result.current_price, result.bid, result.ask);
        if (onCalculation) {
          onCalculation(calc);
        }
      }
    } catch (err) {
      setError('OANDA Daten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  // Professional Lot Size Calculator
  const calculateLotSize = (currentPrice, bid, ask) => {
    const entry = currentPrice;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    const account = parseFloat(accountSize) || 0;
    const riskPct = parseFloat(riskPercent) || 1;
    
    if (!entry || !sl || !account) return null;
    
    const isLong = direction === 'long';
    const slDistance = isLong ? entry - sl : sl - entry;
    const tpDistance = tp ? (isLong ? tp - entry : entry - tp) : 0;
    
    if (slDistance <= 0) return null;
    
    // Determine pair characteristics
    const p = pair?.toUpperCase() || '';
    const isJPY = p.includes('JPY');
    const isGold = p.includes('XAU') || p.includes('GOLD');
    const isCrypto = p.includes('BTC') || p.includes('ETH');
    const isIndex = p.includes('US30') || p.includes('SPX') || p.includes('NAS') || p.includes('DAX');
    
    // Pip value calculation based on pair type
    let pipMultiplier, pipValue, contractSize;
    
    if (isJPY) {
      pipMultiplier = 100; // 0.01 = 1 pip
      pipValue = 1000 / entry; // ~$9.26 per pip for USD/JPY at 108
      contractSize = 100000;
    } else if (isGold) {
      pipMultiplier = 10; // 0.1 = 1 pip for gold
      pipValue = 10; // $10 per pip for 1 lot
      contractSize = 100;
    } else if (isCrypto) {
      pipMultiplier = 1;
      pipValue = 1;
      contractSize = 1;
    } else if (isIndex) {
      pipMultiplier = 1;
      pipValue = 1;
      contractSize = 1;
    } else {
      // Standard Forex pairs
      pipMultiplier = 10000; // 0.0001 = 1 pip
      pipValue = 10; // $10 per pip for 1 standard lot (EUR/USD, GBP/USD, etc.)
      contractSize = 100000;
    }
    
    const slPips = Math.abs(entry - sl) * pipMultiplier;
    const tpPips = tp ? Math.abs(tp - entry) * pipMultiplier : 0;
    
    // Risk amount in account currency (USD assumed)
    const riskAmount = account * (riskPct / 100);
    
    // Lot size calculation: Lot Size = Risk Amount / (SL Pips × Pip Value)
    const lotSize = riskAmount / (slPips * pipValue);
    
    // Position sizes
    const standardLots = lotSize;
    const miniLots = lotSize * 10;
    const microLots = lotSize * 100;
    const units = Math.round(lotSize * contractSize);
    
    // R:R calculation
    const rr = tpDistance > 0 ? tpDistance / slDistance : 0;
    const potentialProfit = riskAmount * rr;
    
    // Margin requirement (approximate, assuming 1:100 leverage)
    const marginRequired = (units * entry) / 100;
    
    // Distance from current price
    const distanceToSL = Math.abs(entry - sl);
    const distanceToTP = tp ? Math.abs(tp - entry) : 0;
    const slPercent = (distanceToSL / entry) * 100;
    const tpPercent = tp ? (distanceToTP / entry) * 100 : 0;

    return {
      currentPrice: entry,
      bid,
      ask,
      spread: ask && bid ? ((ask - bid) * pipMultiplier).toFixed(1) : null,
      slPips: slPips.toFixed(1),
      tpPips: tpPips.toFixed(1),
      riskAmount: riskAmount.toFixed(2),
      potentialProfit: potentialProfit.toFixed(2),
      rr: rr.toFixed(2),
      standardLots: standardLots.toFixed(2),
      miniLots: miniLots.toFixed(2),
      microLots: microLots.toFixed(0),
      units,
      marginRequired: marginRequired.toFixed(2),
      slPercent: slPercent.toFixed(2),
      tpPercent: tpPercent.toFixed(2),
      pipValue: pipValue.toFixed(2),
      isValid: slDistance > 0,
      direction,
      pair
    };
  };

  useEffect(() => {
    if (pair) {
      fetchLivePrice();
      const interval = setInterval(fetchLivePrice, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [pair]);

  // Determine decimal places based on pair type
  const getDecimalPlaces = () => {
    if (!pair) return 5;
    const p = pair.toUpperCase();
    if (p.includes('JPY')) return 3;
    if (p.includes('XAU') || p.includes('GOLD')) return 2;
    if (p.includes('BTC') || p.includes('ETH')) return 2;
    return 5;
  };

  const decimals = getDecimalPlaces();

  if (!pair) {
    return (
      <div className={`border rounded-xl p-4 text-center ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-zinc-100'}`}>
        <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-zinc-700' : 'text-zinc-400'}`} />
        <div className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Wähle zuerst ein Währungspaar</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
        <button 
          onClick={fetchLivePrice}
          className="mt-3 w-full px-3 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (loading && !priceData) {
    return (
      <div className={`border rounded-xl p-6 text-center ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-zinc-100'}`}>
        <RefreshCw className={`w-8 h-8 mx-auto mb-2 animate-spin ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`} />
        <div className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>OANDA Live-Daten werden geladen...</div>
      </div>
    );
  }

  if (!priceData) return null;

  const isPositive = (priceData.change_percent || 0) >= 0;
  const spread = priceData.spread || (priceData.ask && priceData.bid ? ((priceData.ask - priceData.bid) * (pair.includes('JPY') ? 100 : 10000)).toFixed(1) : null);
  
  // Calculate lot size with current data
  const liveCalc = priceData.current_price && accountSize && riskPercent && stopLoss 
    ? calculateLotSize(priceData.current_price, priceData.bid, priceData.ask) 
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-4 sm:p-5 space-y-4"
    >
      {/* Header with OANDA + TradingView branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-blue-500 z-10">
              <span className="text-white font-bold text-[10px]">O</span>
            </div>
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center border-2 border-zinc-700">
              <span className="text-blue-400 font-bold text-[10px]">TV</span>
            </div>
          </div>
          <div>
            <span className={`font-bold tracking-widest text-xs ${darkMode ? 'text-white' : 'text-black'}`}>OANDA × TRADINGVIEW</span>
            <div className="text-[9px] text-blue-400">Live Forex Daten</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-500 text-xs font-bold">LIVE</span>
        </div>
      </div>

      {/* Current Price - Large Display */}
      <div className={`rounded-xl p-5 text-center ${darkMode ? 'bg-white/10 backdrop-blur' : 'bg-white/80 backdrop-blur border border-zinc-200'}`}>
        <div className={`text-xs mb-1 tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>{pair}</div>
        <div className={`text-4xl sm:text-5xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
          {priceData.current_price?.toFixed(decimals)}
        </div>
        {priceData.change_percent !== undefined && (
          <div className={cn("flex items-center justify-center gap-2 text-sm font-sans",
            isPositive ? "text-emerald-500" : "text-red-500")}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-bold">{isPositive ? '+' : ''}{priceData.change_percent?.toFixed(2)}%</span>
            <span className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>(24h)</span>
          </div>
        )}
      </div>

      {/* Bid/Ask/Spread */}
      {priceData.bid && priceData.ask && (
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="text-[10px] text-red-300 mb-1 tracking-wider">BID</div>
            <div className="text-base sm:text-lg font-bold text-red-400">{priceData.bid.toFixed(decimals)}</div>
          </div>
          <div className={`text-center p-3 rounded-xl border ${darkMode ? 'bg-zinc-900/50 border-zinc-700' : 'bg-zinc-200/50 border-zinc-300'}`}>
            <div className={`text-[10px] mb-1 tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>SPREAD</div>
            <div className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{spread} <span className="text-xs font-normal">pips</span></div>
          </div>
          <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="text-[10px] text-emerald-300 mb-1 tracking-wider">ASK</div>
            <div className="text-base sm:text-lg font-bold text-emerald-400">{priceData.ask.toFixed(decimals)}</div>
          </div>
        </div>
      )}

      {/* 24h High/Low */}
      {(priceData.high_24h || priceData.low_24h) && (
        <div className="grid grid-cols-2 gap-2">
          <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-200/50'}`}>
            <div className={`text-[10px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>24H HOCH</div>
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{priceData.high_24h?.toFixed(decimals) || '—'}</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-zinc-900/50' : 'bg-zinc-200/50'}`}>
            <div className={`text-[10px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>24H TIEF</div>
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{priceData.low_24h?.toFixed(decimals) || '—'}</div>
          </div>
        </div>
      )}

      {/* Live Lot Size Calculator */}
      {liveCalc && liveCalc.isValid && (
        <div className={`rounded-xl p-4 space-y-3 ${darkMode ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30' : 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className={`font-bold tracking-widest text-xs ${darkMode ? 'text-white' : 'text-black'}`}>LIVE LOT SIZE</span>
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${direction === 'long' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
              {direction?.toUpperCase()}
            </div>
          </div>
          
          {/* Main Lot Size */}
          <div className={`text-center p-4 rounded-xl ${darkMode ? 'bg-black/30' : 'bg-white/80'}`}>
            <div className={`text-[10px] tracking-widest mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>EMPFOHLENE LOT SIZE</div>
            <div className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{liveCalc.standardLots}</div>
            <div className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Standard Lots ({liveCalc.units.toLocaleString()} Units)</div>
          </div>
          
          {/* Lot Sizes Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/60'}`}>
              <div className={`text-[9px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>MINI</div>
              <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{liveCalc.miniLots}</div>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/60'}`}>
              <div className={`text-[9px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>MICRO</div>
              <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{liveCalc.microLots}</div>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/60'}`}>
              <div className={`text-[9px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>MARGIN</div>
              <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>${liveCalc.marginRequired}</div>
            </div>
          </div>
          
          {/* Risk/Reward Details */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/60'}`}>
              <div className={`text-[9px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>RISIKO</div>
              <div className="text-sm font-bold text-red-400">${liveCalc.riskAmount}</div>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/60'}`}>
              <div className={`text-[9px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>SL</div>
              <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{liveCalc.slPips} pips</div>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/60'}`}>
              <div className={`text-[9px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>TP</div>
              <div className="text-sm font-bold text-emerald-400">{liveCalc.tpPips || '—'} pips</div>
            </div>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-black/20' : 'bg-white/60'}`}>
              <div className={`text-[9px] ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>R:R</div>
              <div className={cn("text-sm font-bold", parseFloat(liveCalc.rr) >= 2 ? "text-emerald-400" : parseFloat(liveCalc.rr) >= 1 ? "text-yellow-500" : "text-red-500")}>
                1:{liveCalc.rr}
              </div>
            </div>
          </div>
          
          {/* Potential Profit */}
          {parseFloat(liveCalc.rr) > 0 && (
            <div className="flex items-center justify-between p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold">POTENZIELLER GEWINN</span>
              </div>
              <span className="text-emerald-400 text-lg font-bold">${liveCalc.potentialProfit}</span>
            </div>
          )}
        </div>
      )}

      {/* Show hint when missing data */}
      {priceData && (!stopLoss || !accountSize) && (
        <div className={`p-3 rounded-lg text-center text-xs ${darkMode ? 'bg-zinc-900/50 text-zinc-500' : 'bg-zinc-200/50 text-zinc-600'}`}>
          Gib Account Size, Stop Loss und Risk % ein für Live Lot Size Berechnung
        </div>
      )}

      {/* Footer with source and update */}
      <div className={`flex items-center justify-between text-xs pt-2 border-t ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-zinc-300 text-zinc-600'}`}>
        <div className="flex items-center gap-2">
          <span>Quelle: <span className="text-blue-400 font-bold">OANDA:TradingView</span></span>
          <span>•</span>
          <span>{lastUpdate ? lastUpdate.toLocaleTimeString('de-DE') : '—'}</span>
        </div>
        <button
          onClick={fetchLivePrice}
          disabled={loading}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          <span>Aktualisieren</span>
        </button>
      </div>
    </motion.div>
  );
}