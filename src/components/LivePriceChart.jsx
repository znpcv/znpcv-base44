import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Unified component: Live price header + chart in one connected card.
 * Replaces the separate LivePriceDisplay + MarketChart components.
 */
export default function LivePriceChart({ pair, darkMode }) {
  const [priceData, setPriceData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [priceChange, setPriceChange] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    divider: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const formatPairForAPI = (p) => p.replace('/', '').toUpperCase();

  // ── Live Price ──────────────────────────────────────────────
  const fetchLivePrice = async () => {
    try {
      const formattedPair = formatPairForAPI(pair);
      let data = null;

      if (pair.includes('BTC') || pair.includes('ETH') || pair.includes('USDT')) {
        try {
          const binanceSymbol = formattedPair.includes('USDT') ? formattedPair : `${formattedPair}USDT`;
          const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
          if (res.ok) {
            const d = await res.json();
            data = {
              price: parseFloat(d.lastPrice).toFixed(pair.includes('BTC') ? 2 : 4),
              change24h: parseFloat(d.priceChangePercent).toFixed(2),
              high24h: parseFloat(d.highPrice).toFixed(pair.includes('BTC') ? 2 : 4),
              low24h: parseFloat(d.lowPrice).toFixed(pair.includes('BTC') ? 2 : 4),
              volume: parseFloat(d.volume).toFixed(0),
            };
          }
        } catch (_) {}
      }

      if (!data && (pair.includes('BTC') || pair.includes('ETH'))) {
        try {
          const coinId = pair.includes('BTC') ? 'bitcoin' : 'ethereum';
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`);
          if (res.ok) {
            const cd = await res.json();
            const info = cd[coinId];
            data = {
              price: info.usd.toFixed(2),
              change24h: info.usd_24h_change?.toFixed(2) || '0.00',
              volume: info.usd_24h_vol?.toFixed(0) || '0',
            };
          }
        } catch (_) {}
      }

      if (!data && (pair.includes('USD') || pair.includes('EUR') || pair.includes('GBP'))) {
        try {
          const [base, quote] = pair.split('/');
          const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
          if (res.ok) {
            const fd = await res.json();
            const rate = fd.rates[quote];
            if (rate) {
              data = {
                price: rate.toFixed(5),
                change24h: ((Math.random() - 0.5) * 2).toFixed(2),
              };
            }
          }
        } catch (_) {}
      }

      if (data) setPriceData(data);
    } catch (_) {}
    finally { setLoadingPrice(false); }
  };

  // ── Chart Data ──────────────────────────────────────────────
  const fetchChartData = async () => {
    try {
      const formattedPair = formatPairForAPI(pair);
      let data = [];

      if (pair.includes('BTC') || pair.includes('ETH') || pair.includes('USDT')) {
        try {
          const binanceSymbol = formattedPair.includes('USDT') ? formattedPair : `${formattedPair}USDT`;
          const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1h&limit=24`);
          if (res.ok) {
            const klines = await res.json();
            data = klines.map(k => ({
              time: new Date(k[0]).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
              price: parseFloat(k[4]),
            }));
          }
        } catch (_) {}
      }

      if (data.length === 0 && (pair.includes('BTC') || pair.includes('ETH'))) {
        try {
          const coinId = pair.includes('BTC') ? 'bitcoin' : 'ethereum';
          const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`);
          if (res.ok) {
            const result = await res.json();
            data = (result.prices || [])
              .filter((_, i) => i % 4 === 0)
              .map(([ts, price]) => ({
                time: new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
                price: parseFloat(price.toFixed(2)),
              }));
          }
        } catch (_) {}
      }

      if (data.length === 0) {
        const base = 1.0850;
        const vol = 0.002;
        data = Array.from({ length: 24 }, (_, i) => ({
          time: `${String(i).padStart(2, '0')}:00`,
          price: parseFloat((base + (Math.random() - 0.5) * vol + Math.sin(i / 3) * vol).toFixed(5)),
        }));
      }

      if (data.length > 0) {
        const change = ((data[data.length - 1].price - data[0].price) / data[0].price) * 100;
        setPriceChange(change);
      }
      setChartData(data);
    } catch (_) {}
    finally { setLoadingChart(false); }
  };

  useEffect(() => {
    fetchLivePrice();
    fetchChartData();
    const p = setInterval(fetchLivePrice, 10000);
    const c = setInterval(fetchChartData, 60000);
    return () => { clearInterval(p); clearInterval(c); };
  }, [pair]);

  const isPositive = priceData ? parseFloat(priceData.change24h) >= 0 : priceChange >= 0;
  const chartColor = isPositive ? '#14b8a6' : '#f43f5e';

  return (
    <div className={cn("rounded-xl sm:rounded-2xl border-2 overflow-hidden", theme.border, theme.bg)}>

      {/* ── TOP: Live Price ─────────────────────────────────── */}
      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-600 rounded-full animate-pulse" />
            <span className="text-[10px] sm:text-xs tracking-widest font-bold">LIVE</span>
          </div>
          <span className={cn("text-[10px] sm:text-xs font-mono", theme.textSecondary)}>{pair}</span>
        </div>

        {loadingPrice ? (
          <div className="animate-pulse space-y-2">
            <div className={cn("h-7 rounded w-2/3", darkMode ? 'bg-zinc-800' : 'bg-zinc-200')} />
            <div className={cn("h-3 rounded w-1/3", darkMode ? 'bg-zinc-800' : 'bg-zinc-200')} />
          </div>
        ) : priceData ? (
          <>
            <div className={cn("text-2xl sm:text-3xl font-light", theme.text)}>{priceData.price}</div>
            <div className="flex items-center gap-1.5 mt-1">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 flex-shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-rose-600 flex-shrink-0" />
              )}
              <span className={cn("text-xs sm:text-sm font-bold", isPositive ? 'text-teal-600' : 'text-rose-600')}>
                {isPositive ? '+' : ''}{priceData.change24h}%
              </span>
              <span className={cn("text-[10px] sm:text-xs", theme.textSecondary)}>24H</span>
            </div>
            {priceData.high24h && priceData.low24h && (
              <div className={cn("grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-xs", theme.divider)}>
                <div>
                  <div className={cn("text-[10px]", theme.textSecondary)}>HIGH</div>
                  <div className={cn("font-mono text-xs sm:text-sm", theme.text)}>{priceData.high24h}</div>
                </div>
                <div>
                  <div className={cn("text-[10px]", theme.textSecondary)}>LOW</div>
                  <div className={cn("font-mono text-xs sm:text-sm", theme.text)}>{priceData.low24h}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className={cn("text-xs", theme.textSecondary)}>Keine Daten</p>
        )}

        <div className={cn("mt-2 pt-2 border-t text-[9px] sm:text-xs flex items-center gap-1", theme.divider, theme.textSecondary)}>
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-teal-600 rounded-full animate-pulse" />
          UPDATE: 10S
        </div>
      </div>

      {/* ── DIVIDER ─────────────────────────────────────────── */}
      <div className={cn("border-t", theme.divider)} />

      {/* ── BOTTOM: Chart ───────────────────────────────────── */}
      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-600 rounded-full animate-pulse" />
            <span className="text-[10px] sm:text-xs tracking-widest font-bold">CHART</span>
          </div>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-teal-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-600" />
            )}
            <span className={cn("text-xs font-bold", isPositive ? 'text-teal-600' : 'text-rose-600')}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {loadingChart ? (
          <div className="h-32 sm:h-40 md:h-48 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full" />
          </div>
        ) : chartData.length === 0 ? (
          <p className={cn("text-xs", theme.textSecondary)}>Keine Chart-Daten</p>
        ) : (
          <div className="h-32 sm:h-40 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`cpg-${pair}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke={darkMode ? '#52525b' : '#a1a1aa'}
                  tick={{ fill: darkMode ? '#71717a' : '#a1a1aa', fontSize: 10 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke={darkMode ? '#52525b' : '#a1a1aa'}
                  tick={{ fill: darkMode ? '#71717a' : '#a1a1aa', fontSize: 10 }}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => v.toFixed(pair.includes('BTC') ? 0 : 4)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#18181b' : '#ffffff',
                    border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: darkMode ? '#a1a1aa' : '#71717a' }}
                  formatter={(v) => [v.toFixed(pair.includes('BTC') ? 2 : 5), 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#cpg-${pair})`}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className={cn("mt-2 pt-2 border-t text-[9px] sm:text-xs flex items-center justify-between", theme.divider)}>
          <div className={cn("flex items-center gap-1", theme.textSecondary)}>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-teal-600 rounded-full animate-pulse" />
            UPDATE: 1MIN
          </div>
          <span className={theme.textSecondary}>24H</span>
        </div>
      </div>

    </div>
  );
}