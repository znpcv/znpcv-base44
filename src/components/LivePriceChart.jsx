import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

// ── Asset-Typ-Erkennung ──────────────────────────────────────────────────────
const CRYPTO_BASES = new Set([
  'BTC','ETH','BNB','SOL','XRP','ADA','DOGE','AVAX','DOT','LINK',
  'LTC','BCH','MATIC','ATOM','UNI','OP','ARB','SUI','TON','TRX',
  'SHIB','PEPE','NEAR','FTM','ALGO','VET','SAND','MANA','AXS','CRV',
  'AAVE','COMP','MKR','SNX','YFI','EGLD','FLOW','HBAR','RUNE','FIL','ICP',
]);
const FOREX_QUOTES = new Set(['USD','EUR','GBP','JPY','CHF','AUD','NZD','CAD','SEK','NOK','DKK','HKD','SGD','CNY','MXN','ZAR','TRY','PLN','CZK','HUF']);
const INDEX_MAP = {
  'DAX':'^GDAXI','GER40':'^GDAXI','GER30':'^GDAXI',
  'SP500':'^GSPC','SPX':'^GSPC','US500':'^GSPC',
  'NASDAQ':'^IXIC','NAS100':'^NDX','NDX':'^NDX',
  'DOW':'^DJI','US30':'^DJI','DJIA':'^DJI','DJ30':'^DJI',
  'FTSE':'^FTSE','FTSE100':'^FTSE','UK100':'^FTSE',
  'NIKKEI':'^N225','JP225':'^N225',
  'CAC':'^FCHI','CAC40':'^FCHI','FR40':'^FCHI',
  'VIX':'^VIX',
  'OIL':'CL=F','USOIL':'CL=F','WTI':'CL=F','CRUDE':'CL=F',
  'BRENT':'BZ=F','BRENTOIL':'BZ=F','UKOIL':'BZ=F',
  'NATGAS':'NG=F','GAS':'NG=F',
  'GOLD':'GC=F','XAUUSD':'GC=F',
  'SILVER':'SI=F','XAGUSD':'SI=F',
  'COPPER':'HG=F',
  'WHEAT':'ZW=F','CORN':'ZC=F',
};

function detectAsset(raw) {
  const s = raw.toUpperCase().replace(/[\s/\\-]/g, '');
  const rawUp = raw.toUpperCase().trim();
  if (INDEX_MAP[rawUp]) return { type: 'yahoo', ticker: INDEX_MAP[rawUp] };
  if (INDEX_MAP[s]) return { type: 'yahoo', ticker: INDEX_MAP[s] };
  for (const base of CRYPTO_BASES) {
    if (s === base || s === `${base}USDT` || s === `${base}USD` || s === `${base}EUR`) return { type: 'crypto', base };
  }
  if (s === 'XAUUSD' || s === 'GOLD') return { type: 'yahoo', ticker: 'GC=F' };
  if (s === 'XAGUSD' || s === 'SILVER') return { type: 'yahoo', ticker: 'SI=F' };
  if (s.length === 6 && /^[A-Z]{6}$/.test(s)) {
    const from = s.slice(0, 3), to = s.slice(3);
    if (FOREX_QUOTES.has(from) && FOREX_QUOTES.has(to)) return { type: 'forex', from, to };
  }
  const parts = raw.split(/[/\\]/).map(x => x.trim().toUpperCase());
  if (parts.length === 2 && FOREX_QUOTES.has(parts[0]) && FOREX_QUOTES.has(parts[1])) return { type: 'forex', from: parts[0], to: parts[1] };
  return { type: 'yahoo', ticker: rawUp };
}

// ── Fetcher ──────────────────────────────────────────────────────────────────
async function fetchPrice(raw) {
  const asset = detectAsset(raw);
  if (asset.type === 'crypto') {
    for (const sym of [`${asset.base}USDT`, `${asset.base}BUSD`, `${asset.base}USD`]) {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`, { signal: AbortSignal.timeout(5000) });
        if (!r.ok) continue;
        const d = await r.json();
        if (!d.lastPrice) continue;
        return { price: parseFloat(d.lastPrice), change24h: parseFloat(d.priceChangePercent), high: parseFloat(d.highPrice), low: parseFloat(d.lowPrice), source: 'Binance', currency: 'USD', asset };
      } catch { /* next */ }
    }
    const cgMap = { BTC:'bitcoin',ETH:'ethereum',SOL:'solana',BNB:'binancecoin',XRP:'ripple',ADA:'cardano',DOGE:'dogecoin',AVAX:'avalanche-2',LINK:'chainlink',DOT:'polkadot' };
    const cgId = cgMap[asset.base];
    if (cgId) {
      const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd&include_24hr_change=true`, { signal: AbortSignal.timeout(7000) });
      if (r.ok) { const d = await r.json(); if (d[cgId]?.usd) return { price: d[cgId].usd, change24h: d[cgId].usd_24h_change ?? null, source: 'CoinGecko', currency: 'USD', asset }; }
    }
    throw new Error('Crypto unavailable');
  }
  if (asset.type === 'forex') {
    try {
      const r = await fetch(`https://api.frankfurter.app/latest?from=${asset.from}&to=${asset.to}`, { signal: AbortSignal.timeout(5000) });
      if (r.ok) { const d = await r.json(); if (d.rates?.[asset.to]) return { price: d.rates[asset.to], change24h: null, source: 'ECB', currency: asset.to, asset }; }
    } catch { /* fallback */ }
    const r2 = await fetch(`https://api.exchangerate-api.com/v4/latest/${asset.from}`, { signal: AbortSignal.timeout(5000) });
    if (!r2.ok) throw new Error('Forex unavailable');
    const d2 = await r2.json();
    if (!d2.rates?.[asset.to]) throw new Error('No rate');
    return { price: d2.rates[asset.to], change24h: null, source: 'ExchangeRate', currency: asset.to, asset };
  }
  if (asset.type === 'yahoo') {
    const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(asset.ticker)}?interval=1d&range=1d`;
    const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(yUrl)}`, { signal: AbortSignal.timeout(9000) });
    if (!r.ok) throw new Error('Proxy error');
    const data = JSON.parse((await r.json()).contents);
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) throw new Error('No data');
    const change24h = meta.previousClose ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100 : null;
    return { price: meta.regularMarketPrice, change24h, high: meta.regularMarketDayHigh ?? null, low: meta.regularMarketDayLow ?? null, source: 'Yahoo', currency: meta.currency || 'USD', asset };
  }
  throw new Error('Unknown asset');
}

async function fetchChartData(raw) {
  const asset = detectAsset(raw);
  if (asset.type === 'crypto') {
    for (const sym of [`${asset.base}USDT`, `${asset.base}BUSD`]) {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=1h&limit=24`, { signal: AbortSignal.timeout(6000) });
        if (!r.ok) continue;
        const klines = await r.json();
        if (!Array.isArray(klines) || !klines.length) continue;
        return klines.map(k => ({ time: new Date(k[0]).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }), price: parseFloat(k[4]) }));
      } catch { /* next */ }
    }
  }
  const ticker = asset.type === 'yahoo' ? asset.ticker : asset.type === 'forex' ? `${asset.from}${asset.to}=X` : null;
  if (ticker) {
    try {
      const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1h&range=1d`;
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(yUrl)}`, { signal: AbortSignal.timeout(10000) });
      if (r.ok) {
        const result = JSON.parse((await r.json()).contents)?.chart?.result?.[0];
        const ts = result?.timestamp, closes = result?.indicators?.quote?.[0]?.close;
        if (ts && closes) return ts.map((t, i) => ({ time: new Date(t * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }), price: closes[i] ?? null })).filter(d => d.price !== null);
      }
    } catch { /* no chart */ }
  }
  return [];
}

function formatPrice(price, asset) {
  if (price == null) return '—';
  const t = asset?.type;
  if (t === 'forex') return (asset.from?.includes('JPY') || asset.to?.includes('JPY')) ? price.toFixed(3) : price.toFixed(5);
  if (t === 'crypto') {
    if (price > 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (price > 1) return price.toFixed(2);
    return price.toFixed(6);
  }
  if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(2);
}

function formatTick(v, asset) {
  if (!v) return '';
  if (asset?.type === 'forex') return v.toFixed(4);
  if (asset?.type === 'crypto' && v > 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (v > 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return v.toFixed(2);
}

// ── Komponente ───────────────────────────────────────────────────────────────
export default function LivePriceChart({ pair, darkMode }) {
  const [priceData, setPriceData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [priceChange, setPriceChange] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [priceError, setPriceError] = useState(false);
  const [asset, setAsset] = useState(null);
  const priceRef = useRef(null);
  const chartRef = useRef(null);

  const bg = darkMode ? 'bg-zinc-950' : 'bg-white';
  const border = darkMode ? 'border-zinc-800' : 'border-zinc-200';
  const text = darkMode ? 'text-white' : 'text-zinc-900';
  const textSub = darkMode ? 'text-zinc-400' : 'text-zinc-500';
  const textDim = darkMode ? 'text-zinc-600' : 'text-zinc-400';
  const divider = darkMode ? 'border-zinc-800/60' : 'border-zinc-100';

  const loadPrice = async () => {
    if (!pair) return;
    try {
      const result = await fetchPrice(pair);
      setPriceData(result);
      setAsset(result.asset);
      setPriceError(false);
    } catch { setPriceError(true); }
    finally { setLoadingPrice(false); }
  };

  const loadChart = async () => {
    if (!pair) return;
    try {
      const data = await fetchChartData(pair);
      if (data.length > 1) setPriceChange(((data[data.length - 1].price - data[0].price) / data[0].price) * 100);
      setChartData(data);
    } catch { /* silent */ }
    finally { setLoadingChart(false); }
  };

  useEffect(() => {
    if (!pair) return;
    setLoadingPrice(true); setLoadingChart(true);
    setPriceData(null); setPriceError(false); setChartData([]);
    loadPrice(); loadChart();
    clearInterval(priceRef.current); clearInterval(chartRef.current);
    priceRef.current = setInterval(loadPrice, 10000);
    chartRef.current = setInterval(loadChart, 60000);
    return () => { clearInterval(priceRef.current); clearInterval(chartRef.current); };
  }, [pair]);

  const change = priceData?.change24h ?? priceChange;
  const isPos = change >= 0;
  const chartColor = isPos ? '#14b8a6' : '#f43f5e';
  const safeId = pair?.replace(/[^a-zA-Z0-9]/g, '') || 'chart';

  return (
    <div className={cn("rounded-2xl border-2 overflow-hidden", bg, border)}>
      {/* ── Single row: price LEFT | chart RIGHT ── */}
      <div className="flex flex-col sm:flex-row">

        {/* ── LEFT: Price Panel ───────────────────── */}
        <div className={cn("flex flex-col justify-between p-4 sm:p-5 sm:w-48 md:w-56 flex-shrink-0", `border-b sm:border-b-0 sm:border-r`, divider)}>
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                <span className={cn("text-[10px] tracking-widest font-bold", text)}>LIVE</span>
              </div>
              <button onClick={loadPrice} className={cn("p-1 rounded transition-colors", textDim, "hover:text-teal-500")}>
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className={cn("text-[10px] font-mono mb-2", textSub)}>{pair}</div>

            {/* Price */}
            {loadingPrice ? (
              <div className="space-y-2 animate-pulse">
                <div className={cn("h-7 rounded w-full", darkMode ? 'bg-zinc-800' : 'bg-zinc-100')} />
                <div className={cn("h-3 rounded w-2/3", darkMode ? 'bg-zinc-800' : 'bg-zinc-100')} />
              </div>
            ) : priceError || !priceData ? (
              <div className="flex items-center gap-1.5 text-rose-500">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[10px]">Keine Daten</span>
              </div>
            ) : (
              <>
                <div className={cn("text-xl sm:text-2xl font-light tabular-nums leading-none mb-1", text)}>
                  {formatPrice(priceData.price, asset)}
                </div>
                <div className={cn("text-[10px] mb-2", textDim)}>{priceData.currency}</div>
                {priceData.change24h !== null && priceData.change24h !== undefined && (
                  <div className={cn("flex items-center gap-1 text-xs font-bold", isPos ? 'text-teal-500' : 'text-rose-500')}>
                    {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPos ? '+' : ''}{priceData.change24h.toFixed(2)}%
                    <span className={cn("text-[9px] font-normal", textDim)}>24H</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* H/L + Source */}
          {priceData && (priceData.high || priceData.low) && (
            <div className={cn("mt-3 pt-3 border-t grid grid-cols-2 gap-1.5", divider)}>
              {priceData.high && (
                <div>
                  <div className={cn("text-[9px]", textDim)}>HIGH</div>
                  <div className={cn("text-[10px] font-mono", text)}>{formatPrice(priceData.high, asset)}</div>
                </div>
              )}
              {priceData.low && (
                <div>
                  <div className={cn("text-[9px]", textDim)}>LOW</div>
                  <div className={cn("text-[10px] font-mono", text)}>{formatPrice(priceData.low, asset)}</div>
                </div>
              )}
            </div>
          )}

          <div className={cn("mt-3 flex items-center gap-1 text-[9px]", textDim)}>
            <div className="w-1 h-1 bg-teal-500 rounded-full animate-pulse" />
            {priceData?.source || '—'} · 10s
          </div>
        </div>

        {/* ── RIGHT: Chart Panel ──────────────────── */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[10px] tracking-widest font-bold", text)}>24H CHART</span>
            </div>
            <div className={cn("flex items-center gap-1 text-xs font-bold", isPos ? 'text-teal-500' : 'text-rose-500')}>
              {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPos ? '+' : ''}{(priceData?.change24h ?? priceChange).toFixed(2)}%
            </div>
          </div>

          {loadingChart ? (
            <div className="flex-1 min-h-[120px] flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex-1 min-h-[120px] flex items-center justify-center">
              <div className={cn("flex items-center gap-2", textDim)}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-[11px]">Keine Chart-Daten</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[120px] sm:min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`g-${safeId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#18181b' : '#ffffff',
                      border: `1px solid ${darkMode ? '#27272a' : '#e4e4e7'}`,
                      borderRadius: '8px',
                      fontSize: '11px',
                      padding: '6px 10px',
                    }}
                    labelStyle={{ color: darkMode ? '#a1a1aa' : '#71717a', fontSize: '10px' }}
                    formatter={(v) => [formatPrice(v, asset), 'Preis']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={1.5}
                    fill={`url(#g-${safeId})`}
                    animationDuration={300}
                    connectNulls
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className={cn("mt-2 flex items-center justify-between text-[9px]", textDim)}>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-teal-500 rounded-full animate-pulse" />
              Chart · 1min
            </div>
            <span>1H Intervall</span>
          </div>
        </div>
      </div>
    </div>
  );
}