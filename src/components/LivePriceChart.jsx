import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * LivePriceChart — Universeller Echtzeit-Preis + Chart
 *
 * Unterstützt ALLE Asset-Klassen:
 * - Crypto      → Binance (primär), CoinGecko (fallback)
 * - Forex       → Frankfurter.app (ECB) + ExchangeRate-API
 * - Gold/Silber → open.er-api.com (XAU, XAG)
 * - Öl/Rohstoffe → Yahoo Finance via CORS-Proxy
 * - Aktien, ETFs → Yahoo Finance via CORS-Proxy
 * - Indizes (DAX, SP500, NASDAQ) → Yahoo Finance via CORS-Proxy
 * - Futures     → Yahoo Finance via CORS-Proxy
 *
 * Kein Fake-/Zufalls-Fallback! Wenn keine Daten → Fehlermeldung.
 */

// ── Asset-Typ-Erkennung ──────────────────────────────────────────────────────
const CRYPTO_BASES = new Set([
  'BTC','ETH','BNB','SOL','XRP','ADA','DOGE','AVAX','DOT','LINK',
  'LTC','BCH','MATIC','ATOM','UNI','OP','ARB','SUI','TON','TRX',
  'SHIB','PEPE','NEAR','FTM','ALGO','VET','SAND','MANA','AXS','CRV',
  'AAVE','COMP','MKR','SNX','YFI','EGLD','FLOW','HBAR','RUNE','FIL','ICP',
]);

const FOREX_QUOTES = new Set([
  'USD','EUR','GBP','JPY','CHF','AUD','NZD','CAD','SEK','NOK',
  'DKK','HKD','SGD','CNY','MXN','ZAR','TRY','PLN','CZK','HUF',
]);

// Bekannte Index-Symbole → Yahoo-Ticker
const INDEX_MAP = {
  'DAX': '^GDAXI', 'GDAX': '^GDAXI', 'GER40': '^GDAXI', 'GER30': '^GDAXI',
  'SP500': '^GSPC', 'SPX': '^GSPC', 'S&P500': '^GSPC', 'US500': '^GSPC',
  'NASDAQ': '^IXIC', 'NAS100': '^NDX', 'NDX': '^NDX',
  'DOW': '^DJI', 'DJ30': '^DJI', 'US30': '^DJI', 'DJIA': '^DJI',
  'FTSE': '^FTSE', 'FTSE100': '^FTSE', 'UK100': '^FTSE',
  'NIKKEI': '^N225', 'JP225': '^N225',
  'CAC': '^FCHI', 'CAC40': '^FCHI', 'FR40': '^FCHI',
  'EUROSTOXX': '^STOXX50E', 'EU50': '^STOXX50E',
  'VIX': '^VIX',
  'OIL': 'CL=F', 'USOIL': 'CL=F', 'WTI': 'CL=F', 'CRUDE': 'CL=F',
  'BRENTOIL': 'BZ=F', 'BRENT': 'BZ=F', 'UKOIL': 'BZ=F',
  'NATGAS': 'NG=F', 'GAS': 'NG=F',
  'GOLD': 'GC=F', 'XAUUSD': 'GC=F',
  'SILVER': 'SI=F', 'XAGUSD': 'SI=F',
  'COPPER': 'HG=F',
  'WHEAT': 'ZW=F', 'CORN': 'ZC=F', 'SOYBEAN': 'ZS=F',
};

function detectAsset(raw) {
  const s = raw.toUpperCase().replace(/[\s/\\-]/g, '');

  // Index / Rohstoff-Map prüfen
  const rawUp = raw.toUpperCase().trim();
  if (INDEX_MAP[rawUp]) return { type: 'yahoo', ticker: INDEX_MAP[rawUp] };
  if (INDEX_MAP[s]) return { type: 'yahoo', ticker: INDEX_MAP[s] };

  // Crypto
  for (const base of CRYPTO_BASES) {
    if (s === base || s === `${base}USDT` || s === `${base}USD` || s === `${base}BTC` || s === `${base}EUR`) {
      return { type: 'crypto', base };
    }
  }

  // Gold/Silber via XAU/XAG
  if (s === 'XAUUSD' || s === 'GOLD') return { type: 'yahoo', ticker: 'GC=F' };
  if (s === 'XAGUSD' || s === 'SILVER') return { type: 'yahoo', ticker: 'SI=F' };
  if (s === 'XAUEUR') return { type: 'gold_eur' };

  // Forex: exakt 6 Buchstaben
  if (s.length === 6 && /^[A-Z]{6}$/.test(s)) {
    const from = s.slice(0, 3);
    const to = s.slice(3);
    if (FOREX_QUOTES.has(from) && FOREX_QUOTES.has(to)) {
      return { type: 'forex', from, to };
    }
  }

  // Forex aus "EUR/USD" Format
  const parts = raw.split(/[/\\]/).map(x => x.trim().toUpperCase());
  if (parts.length === 2 && FOREX_QUOTES.has(parts[0]) && FOREX_QUOTES.has(parts[1])) {
    return { type: 'forex', from: parts[0], to: parts[1] };
  }

  // Alles andere: Yahoo Finance (Aktie, ETF, Future, Index)
  return { type: 'yahoo', ticker: rawUp };
}

// ── Daten-Fetcher ────────────────────────────────────────────────────────────
async function fetchCryptoPrice(base) {
  const pairs = [`${base}USDT`, `${base}BUSD`, `${base}USD`];
  for (const sym of pairs) {
    try {
      const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) continue;
      const d = await r.json();
      if (!d.lastPrice) continue;
      const price = parseFloat(d.lastPrice);
      return {
        price,
        change24h: parseFloat(d.priceChangePercent),
        high: parseFloat(d.highPrice),
        low: parseFloat(d.lowPrice),
        volume: parseFloat(d.volume),
        source: 'Binance',
        currency: 'USD',
      };
    } catch { /* try next */ }
  }
  // CoinGecko fallback
  const idMap = { BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin', XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin', AVAX: 'avalanche-2', LINK: 'chainlink', DOT: 'polkadot' };
  const cgId = idMap[base];
  if (cgId) {
    try {
      const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`, { signal: AbortSignal.timeout(6000) });
      if (r.ok) {
        const d = await r.json();
        const info = d[cgId];
        if (info?.usd) return { price: info.usd, change24h: info.usd_24h_change ?? null, source: 'CoinGecko', currency: 'USD' };
      }
    } catch { /* no fallback */ }
  }
  throw new Error('Crypto price unavailable');
}

async function fetchForexPrice(from, to) {
  // Frankfurter (ECB, täglich)
  try {
    const r = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`, { signal: AbortSignal.timeout(5000) });
    if (r.ok) {
      const d = await r.json();
      if (d.rates?.[to]) return { price: d.rates[to], change24h: null, source: 'ECB', currency: to };
    }
  } catch { /* fallback */ }
  // ExchangeRate-API
  const r2 = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`, { signal: AbortSignal.timeout(5000) });
  if (!r2.ok) throw new Error('Forex unavailable');
  const d2 = await r2.json();
  if (!d2.rates?.[to]) throw new Error('No forex rate');
  return { price: d2.rates[to], change24h: null, source: 'ExchangeRate', currency: to };
}

async function fetchYahooPrice(ticker) {
  const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(yUrl)}`;
  const r = await fetch(proxy, { signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error('Proxy error');
  const wrapper = await r.json();
  const data = JSON.parse(wrapper.contents);
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error('No data');
  const change24h = meta.previousClose
    ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
    : null;
  return {
    price: meta.regularMarketPrice,
    change24h,
    high: meta.regularMarketDayHigh ?? null,
    low: meta.regularMarketDayLow ?? null,
    source: 'Yahoo',
    currency: meta.currency || 'USD',
  };
}

async function fetchPrice(raw) {
  const asset = detectAsset(raw);
  if (asset.type === 'crypto') return { ...await fetchCryptoPrice(asset.base), asset };
  if (asset.type === 'forex') return { ...await fetchForexPrice(asset.from, asset.to), asset };
  if (asset.type === 'yahoo') return { ...await fetchYahooPrice(asset.ticker), asset };
  if (asset.type === 'gold_eur') {
    // XAU in EUR: XAU→USD dann USD→EUR
    const [xau, fx] = await Promise.all([fetchYahooPrice('GC=F'), fetchForexPrice('USD', 'EUR')]);
    return { price: xau.price * fx.price, change24h: xau.change24h, source: 'Yahoo+ECB', currency: 'EUR', asset };
  }
  throw new Error('Unknown asset');
}

// ── Chart-Daten ──────────────────────────────────────────────────────────────
async function fetchChartData(raw) {
  const asset = detectAsset(raw);
  // Crypto → Binance klines
  if (asset.type === 'crypto') {
    const pairs = [`${asset.base}USDT`, `${asset.base}BUSD`];
    for (const sym of pairs) {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=1h&limit=24`, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) continue;
        const klines = await r.json();
        if (!Array.isArray(klines) || klines.length === 0) continue;
        return klines.map(k => ({
          time: new Date(k[0]).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          price: parseFloat(k[4]),
        }));
      } catch { /* try next */ }
    }
  }
  // Yahoo → 1-Tages Klines (1h Intervall)
  const ticker = asset.type === 'yahoo' ? asset.ticker
    : asset.type === 'forex' ? `${asset.from}${asset.to}=X`
    : null;
  if (ticker) {
    try {
      const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1h&range=1d`;
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(yUrl)}`;
      const r = await fetch(proxy, { signal: AbortSignal.timeout(10000) });
      if (r.ok) {
        const wrapper = await r.json();
        const data = JSON.parse(wrapper.contents);
        const result = data?.chart?.result?.[0];
        const timestamps = result?.timestamp;
        const closes = result?.indicators?.quote?.[0]?.close;
        if (timestamps && closes && timestamps.length > 0) {
          return timestamps.map((ts, i) => ({
            time: new Date(ts * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            price: closes[i] ?? null,
          })).filter(d => d.price !== null);
        }
      }
    } catch { /* no chart */ }
  }
  return [];
}

// ── Formatierung ─────────────────────────────────────────────────────────────
function formatPrice(price, asset) {
  if (price === null || price === undefined) return '—';
  const t = asset?.type;
  if (t === 'forex') {
    if (asset.from?.includes('JPY') || asset.to?.includes('JPY')) return price.toFixed(3);
    return price.toFixed(5);
  }
  if (t === 'crypto') {
    if (price > 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (price > 1) return price.toFixed(2);
    return price.toFixed(6);
  }
  if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(2);
}

function formatChartTick(price, asset) {
  if (!price) return '';
  const t = asset?.type;
  if (t === 'forex') return price.toFixed(4);
  if (t === 'crypto' && price > 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return price.toFixed(2);
}

// ── Komponente ───────────────────────────────────────────────────────────────
export default function LivePriceChart({ pair, darkMode }) {
  const [priceData, setPriceData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [priceChange, setPriceChange] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [priceError, setPriceError] = useState(false);
  const [assetInfo, setAssetInfo] = useState(null);
  const priceInterval = useRef(null);
  const chartInterval = useRef(null);

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  const loadPrice = async () => {
    if (!pair) return;
    try {
      const result = await fetchPrice(pair);
      setPriceData(result);
      setAssetInfo(result.asset);
      setPriceError(false);
    } catch {
      setPriceError(true);
    } finally {
      setLoadingPrice(false);
    }
  };

  const loadChart = async () => {
    if (!pair) return;
    try {
      const data = await fetchChartData(pair);
      if (data.length > 1) {
        const first = data[0].price;
        const last = data[data.length - 1].price;
        setPriceChange(((last - first) / first) * 100);
      }
      setChartData(data);
    } catch { /* silent */ }
    finally { setLoadingChart(false); }
  };

  useEffect(() => {
    if (!pair) return;
    setLoadingPrice(true);
    setLoadingChart(true);
    setPriceData(null);
    setPriceError(false);
    setChartData([]);

    loadPrice();
    loadChart();

    if (priceInterval.current) clearInterval(priceInterval.current);
    if (chartInterval.current) clearInterval(chartInterval.current);
    priceInterval.current = setInterval(loadPrice, 10000);
    chartInterval.current = setInterval(loadChart, 60000);

    return () => {
      clearInterval(priceInterval.current);
      clearInterval(chartInterval.current);
    };
  }, [pair]);

  const change24h = priceData?.change24h ?? priceChange;
  const isPositive = change24h >= 0;
  const chartColor = isPositive ? '#14b8a6' : '#f43f5e';

  const gradientId = `cpg-${pair?.replace(/[^a-zA-Z0-9]/g, '') || 'chart'}`;

  return (
    <div className={cn("rounded-xl sm:rounded-2xl border-2 overflow-hidden", theme.border, theme.bg)}>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className={cn("flex items-center justify-between px-3 sm:px-4 py-2 border-b", theme.border)}>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
          <span className="text-[10px] tracking-widest font-bold">LIVE MARKET</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-mono font-bold", theme.text)}>{pair}</span>
          {priceData?.source && (
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded border", theme.textSecondary, theme.border)}>
              {priceData.source}
            </span>
          )}
          <button onClick={loadPrice} className={cn("p-1 rounded transition-colors", darkMode ? 'text-zinc-600 hover:text-zinc-300' : 'text-zinc-300 hover:text-zinc-600')}>
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── BODY: Preis links | Chart rechts ───────────────────────── */}
      <div className="flex flex-row min-h-[130px] sm:min-h-[160px]">

        {/* LEFT — Preisinfos */}
        <div className={cn("flex flex-col justify-between p-3 sm:p-4 w-[42%] shrink-0 border-r", theme.border)}>
          {loadingPrice ? (
            <div className="animate-pulse space-y-2 flex-1">
              <div className={cn("h-7 rounded w-3/4", darkMode ? 'bg-zinc-800' : 'bg-zinc-200')} />
              <div className={cn("h-3 rounded w-1/2", darkMode ? 'bg-zinc-800' : 'bg-zinc-200')} />
            </div>
          ) : priceError || !priceData ? (
            <div className="flex items-start gap-1.5 text-rose-500 flex-1">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="text-[10px] font-sans leading-tight">Kein Preis verfügbar</span>
            </div>
          ) : (
            <div className="flex-1">
              <div className={cn("text-xl sm:text-2xl font-light tabular-nums leading-none mb-1", theme.text)}>
                {formatPrice(priceData.price, assetInfo)}
              </div>
              {priceData.currency && (
                <div className={cn("text-[9px] mb-1.5", theme.textSecondary)}>{priceData.currency}</div>
              )}
              {priceData.change24h !== null && priceData.change24h !== undefined && (
                <div className="flex items-center gap-1 mb-2">
                  {isPositive
                    ? <TrendingUp className="w-3 h-3 text-teal-500 shrink-0" />
                    : <TrendingDown className="w-3 h-3 text-rose-500 shrink-0" />
                  }
                  <span className={cn("text-xs font-bold", isPositive ? 'text-teal-500' : 'text-rose-500')}>
                    {isPositive ? '+' : ''}{priceData.change24h.toFixed(2)}%
                  </span>
                </div>
              )}
              {(priceData.high || priceData.low) && (
                <div className={cn("pt-2 border-t space-y-1", theme.border)}>
                  {priceData.high && (
                    <div>
                      <div className={cn("text-[8px]", theme.textSecondary)}>HIGH</div>
                      <div className={cn("font-mono text-[10px] sm:text-xs", theme.text)}>{formatPrice(priceData.high, assetInfo)}</div>
                    </div>
                  )}
                  {priceData.low && (
                    <div>
                      <div className={cn("text-[8px]", theme.textSecondary)}>LOW</div>
                      <div className={cn("font-mono text-[10px] sm:text-xs", theme.text)}>{formatPrice(priceData.low, assetInfo)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className={cn("flex items-center gap-1 text-[8px] sm:text-[9px] mt-2", theme.textSecondary)}>
            <div className="w-1 h-1 bg-teal-500 rounded-full animate-pulse" />
            10S
          </div>
        </div>

        {/* RIGHT — Chart */}
        <div className="flex-1 flex flex-col p-2 sm:p-3 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className={cn("text-[9px] tracking-widest", theme.textSecondary)}>24H CHART</span>
            <span className={cn("text-[10px] font-bold", isPositive ? 'text-teal-500' : 'text-rose-500')}>
              {isPositive ? '+' : ''}{(priceData?.change24h ?? priceChange).toFixed(2)}%
            </span>
          </div>

          {loadingChart ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-1 text-zinc-500">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[9px]">Keine Daten</span>
              </div>
            </div>
          ) : (
            <div className="flex-1" style={{ minHeight: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#18181b' : '#ffffff',
                      border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`,
                      borderRadius: '6px',
                      fontSize: '10px',
                      padding: '4px 8px',
                    }}
                    labelStyle={{ color: darkMode ? '#a1a1aa' : '#71717a', fontSize: 9 }}
                    formatter={(v) => [formatPrice(v, assetInfo), 'Preis']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={1.5}
                    fill={`url(#${gradientId})`}
                    animationDuration={300}
                    connectNulls
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className={cn("flex items-center justify-end gap-1 mt-1 text-[8px] sm:text-[9px]", theme.textSecondary)}>
            <div className="w-1 h-1 bg-teal-500 rounded-full animate-pulse" />
            1MIN
          </div>
        </div>

      </div>
    </div>
  );
}