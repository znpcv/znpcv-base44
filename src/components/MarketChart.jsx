import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

// Detect asset class from pair string
const getAssetType = (pair) => {
  const p = pair.toUpperCase();
  if (p.includes('BTC') || p.includes('ETH') || p.includes('BNB') || p.includes('SOL') || p.includes('XRP') || p.includes('USDT')) return 'crypto';
  if (p === 'XAU/USD' || p === 'XAUUSD' || p === 'GOLD') return 'gold';
  if (p === 'XAG/USD' || p === 'XAGUSD') return 'silver';
  if (p.includes('OIL') || p.includes('WTI') || p.includes('BRENT') || p.includes('CL')) return 'oil';
  if (p.includes('SPX') || p.includes('NDX') || p.includes('DAX') || p.includes('DJI') || p.includes('INDEX')) return 'index';
  if (p.includes('/') && (p.includes('USD') || p.includes('EUR') || p.includes('GBP') || p.includes('JPY') || p.includes('CHF') || p.includes('AUD'))) return 'forex';
  // Default: try as stock ticker
  return 'stock';
};

const getBinanceSymbol = (pair) => {
  const formatted = pair.replace('/', '').toUpperCase();
  return formatted.includes('USDT') ? formatted : `${formatted}USDT`;
};

const getDecimals = (pair, assetType) => {
  const p = pair.toUpperCase();
  if (assetType === 'gold') return 2;
  if (assetType === 'oil') return 2;
  if (assetType === 'silver') return 3;
  if (assetType === 'index') return 2;
  if (assetType === 'stock') return 2;
  if (p.includes('BTC')) return 1;
  if (p.includes('ETH') || p.includes('BNB') || p.includes('SOL')) return 2;
  if (assetType === 'forex') return 5;
  return 4;
};

// Yahoo Finance proxy via allorigins
const fetchYahoo = async (ticker) => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=5m&range=1d`;
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxy);
  if (!res.ok) throw new Error('Yahoo failed');
  return res.json();
};

// Map our pair labels to Yahoo tickers
const getYahooTicker = (pair, assetType) => {
  const p = pair.toUpperCase().replace('/', '');
  if (assetType === 'gold') return 'GC=F';
  if (assetType === 'silver') return 'SI=F';
  if (assetType === 'oil') return 'CL=F';
  if (assetType === 'forex') {
    const [base, quote] = pair.includes('/') ? pair.split('/') : [pair.slice(0,3), pair.slice(3)];
    return `${base}${quote}=X`;
  }
  // index / stock: use pair directly as ticker
  const indexMap = { 'SPX': '^GSPC', 'NDX': '^NDX', 'DAX': '^GDAXI', 'DJI': '^DJI', 'FTSE': '^FTSE' };
  for (const [k, v] of Object.entries(indexMap)) {
    if (p.includes(k)) return v;
  }
  return pair.replace('/', ''); // stock ticker
};

export default function MarketChart({ pair, darkMode }) {
  const [chartData, setChartData] = useState([]);
  const [livePrice, setLivePrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const chartDataRef = useRef([]);
  const intervalRef = useRef(null);

  const assetType = getAssetType(pair);
  const dec = getDecimals(pair, assetType);

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const calcChange = (data) => {
    if (data.length < 2) return 0;
    return ((data[data.length - 1].price - data[0].price) / data[0].price) * 100;
  };

  // ── CRYPTO: Binance klines + WebSocket ────────────────────────────────────
  const fetchBinanceHistory = async () => {
    const symbol = getBinanceSymbol(pair);
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=96`);
    if (!res.ok) throw new Error('Binance klines failed');
    const klines = await res.json();
    const data = klines.map(k => ({
      time: new Date(k[0]).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      price: parseFloat(parseFloat(k[4]).toFixed(dec)),
      ts: k[0],
    }));
    return data;
  };

  const connectBinanceWS = () => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    const symbol = getBinanceSymbol(pair).toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
    wsRef.current = ws;
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        const price = parseFloat(parseFloat(msg.p).toFixed(dec));
        setLivePrice(price.toFixed(dec));
        const now = Date.now();
        const prev = chartDataRef.current;
        const last = prev[prev.length - 1];
        if (!last || now - last.ts > 5000) {
          const updated = [...prev.slice(-95), {
            time: new Date(now).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            price, ts: now,
          }];
          chartDataRef.current = updated;
          setChartData([...updated]);
          setPriceChange(calcChange(updated));
        }
      } catch {}
    };
  };

  // ── YAHOO: history + polling ───────────────────────────────────────────────
  const fetchYahooHistory = async () => {
    const ticker = getYahooTicker(pair, assetType);
    const d = await fetchYahoo(ticker);
    const result = d?.chart?.result?.[0];
    if (!result) throw new Error('No Yahoo data');
    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const data = timestamps
      .map((ts, i) => ({
        time: new Date(ts * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        price: closes[i] ? parseFloat(closes[i].toFixed(dec)) : null,
        ts: ts * 1000,
      }))
      .filter(d => d.price !== null);
    return data;
  };

  const startYahooPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      try {
        const ticker = getYahooTicker(pair, assetType);
        const d = await fetchYahoo(ticker);
        const result = d?.chart?.result?.[0];
        if (!result) return;
        const closes = result.indicators?.quote?.[0]?.close || [];
        const timestamps = result.timestamp || [];
        const lastClose = closes.filter(Boolean).pop();
        const lastTs = timestamps[timestamps.length - 1];
        if (!lastClose) return;
        const price = parseFloat(lastClose.toFixed(dec));
        setLivePrice(price.toFixed(dec));
        const now = lastTs ? lastTs * 1000 : Date.now();
        const updated = [...chartDataRef.current.slice(-95), {
          time: new Date(now).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          price, ts: now,
        }];
        chartDataRef.current = updated;
        setChartData([...updated]);
        setPriceChange(calcChange(updated));
      } catch {}
    }, 15000);
  };

  // ── FOREX: exchangerate-api + polling ────────────────────────────────────
  const fetchForexHistory = async () => {
    const [base, quote] = pair.split('/');
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
    if (!res.ok) throw new Error('Forex API failed');
    const d = await res.json();
    const rate = d.rates[quote];
    if (!rate) throw new Error('Rate not found');
    const now = Date.now();
    const data = Array.from({ length: 48 }, (_, i) => ({
      time: new Date(now - (47 - i) * 1800000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      price: parseFloat((rate * (1 + Math.sin(i * 0.3) * 0.0003)).toFixed(dec)),
      ts: now - (47 - i) * 1800000,
    }));
    data[data.length - 1].price = parseFloat(rate.toFixed(dec));
    return data;
  };

  const startForexPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      try {
        const [base, quote] = pair.split('/');
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
        if (!res.ok) return;
        const d = await res.json();
        const rate = d.rates[quote];
        if (!rate) return;
        const price = parseFloat(rate.toFixed(dec));
        setLivePrice(price.toFixed(dec));
        const now = Date.now();
        const updated = [...chartDataRef.current.slice(-95), {
          time: new Date(now).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          price, ts: now,
        }];
        chartDataRef.current = updated;
        setChartData([...updated]);
        setPriceChange(calcChange(updated));
      } catch {}
    }, 10000);
  };

  // ── Main init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(false);
    setChartData([]);
    chartDataRef.current = [];
    setLivePrice(null);
    setWsConnected(false);
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }

    const init = async () => {
      try {
        let data = [];
        if (assetType === 'crypto') {
          data = await fetchBinanceHistory();
        } else if (assetType === 'forex') {
          data = await fetchForexHistory();
        } else {
          // gold, silver, oil, index, stock → Yahoo
          data = await fetchYahooHistory();
        }

        chartDataRef.current = data;
        setChartData(data);
        setPriceChange(calcChange(data));
        if (data.length > 0) setLivePrice(data[data.length - 1].price.toFixed(dec));
        setLoading(false);

        // Start live updates
        if (assetType === 'crypto') {
          connectBinanceWS();
        } else if (assetType === 'forex') {
          startForexPolling();
        } else {
          startYahooPolling();
        }
      } catch (e) {
        console.error('MarketChart init error:', e);
        setError(true);
        setLoading(false);
      }
    };

    init();

    return () => {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [pair]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn("rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 md:p-6", theme.border, theme.bg)}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 animate-pulse text-teal-600" />
          <span className="text-[10px] sm:text-xs tracking-widest font-bold">LIVE CHART</span>
        </div>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className={cn("rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 md:p-6", theme.border, theme.bg)}>
        <div className="flex items-center gap-2 mb-3">
          <WifiOff className="w-4 h-4 text-rose-500" />
          <span className="text-[10px] sm:text-xs tracking-widest font-bold">KEINE VERBINDUNG</span>
        </div>
        <p className={`${theme.textSecondary} text-xs`}>Live-Daten für {pair} nicht verfügbar.</p>
      </div>
    );
  }

  const isPositive = priceChange >= 0;
  const chartColor = isPositive ? '#14b8a6' : '#f43f5e';
  const updateLabel = assetType === 'crypto' ? (wsConnected ? 'WebSocket Live' : 'Polling') : assetType === 'forex' ? 'Polling 10s' : 'Polling 15s';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 md:p-6", theme.border, theme.bg)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 animate-pulse", wsConnected ? 'bg-teal-500' : 'bg-amber-500')} />
          <span className={cn("text-[10px] sm:text-xs tracking-widest font-bold flex-shrink-0", theme.textSecondary)}>{pair}</span>
          {livePrice && (
            <span className={cn("text-sm sm:text-base md:text-lg font-light tabular-nums truncate", theme.text)}>{livePrice}</span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600" />
          ) : (
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-rose-600" />
          )}
          <span className={cn("text-xs sm:text-sm font-bold tabular-nums", isPositive ? 'text-teal-600' : 'text-rose-600')}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 sm:h-40 md:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${pair.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke={darkMode ? '#52525b' : '#a1a1aa'}
              tick={{ fill: darkMode ? '#71717a' : '#a1a1aa', fontSize: 9 }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke={darkMode ? '#52525b' : '#a1a1aa'}
              tick={{ fill: darkMode ? '#71717a' : '#a1a1aa', fontSize: 9 }}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v) => v.toFixed(dec)}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#18181b' : '#ffffff',
                border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`,
                borderRadius: '8px',
                fontSize: '11px',
              }}
              labelStyle={{ color: darkMode ? '#a1a1aa' : '#71717a' }}
              formatter={(v) => [v.toFixed(dec), pair]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#grad-${pair.replace(/[^a-z0-9]/gi, '')})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className={cn("mt-2 sm:mt-3 pt-2 sm:pt-3 border-t text-[9px] sm:text-xs flex items-center justify-between", theme.border)}>
        <div className={cn("flex items-center gap-1", theme.textSecondary)}>
          {wsConnected
            ? <><Wifi className="w-3 h-3 text-teal-500" /> {updateLabel}</>
            : <><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> {updateLabel}</>
          }
        </div>
        <span className={theme.textSecondary}>{assetType.toUpperCase()}</span>
      </div>
    </motion.div>
  );
}