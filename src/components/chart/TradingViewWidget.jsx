import React, { useEffect, useRef, useCallback, useState } from 'react';
import { RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

const TIMEOUT_MS = 8000;
const DEBOUNCE_MS = 400;
const MIN_REINIT_MS = 800;

export default function TradingViewWidget({ symbol, interval, darkMode }) {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);
  const timeoutRef = useRef(null);
  const debounceRef = useRef(null);
  const lastInitRef = useRef(0);
  const mountedRef = useRef(true);

  const [state, setState] = useState('loading'); // 'loading' | 'ready' | 'error'

  const cleanup = useCallback(() => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (containerRef.current) {
      // Keep outer div, wipe only inner TV container
      const inner = containerRef.current.querySelector('.tradingview-widget-container__widget');
      if (inner) inner.innerHTML = '';
      // Remove any lingering iframes
      containerRef.current.querySelectorAll('iframe').forEach(f => f.remove());
    }
  }, []);

  const initWidget = useCallback((sym, tf) => {
    if (!mountedRef.current || !containerRef.current) return;

    const now = Date.now();
    if (now - lastInitRef.current < MIN_REINIT_MS) return;
    lastInitRef.current = now;

    cleanup();
    if (mountedRef.current) setState('loading');

    // Timeout guard: 8s → error state
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current && state !== 'ready') {
        setState('error');
      }
    }, TIMEOUT_MS);

    const widgetContainer = containerRef.current.querySelector('.tradingview-widget-container__widget');
    if (!widgetContainer) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: sym,
      interval: tf,
      timezone: 'Europe/Berlin',
      theme: darkMode ? 'dark' : 'light',
      style: '1',
      locale: 'de_DE',
      backgroundColor: darkMode ? '#09090b' : '#ffffff',
      gridColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: true,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    });

    script.onload = () => {
      if (!mountedRef.current) return;
      clearTimeout(timeoutRef.current);
      // Small delay to let TV finish rendering
      setTimeout(() => {
        if (mountedRef.current) setState('ready');
      }, 400);
    };

    script.onerror = () => {
      if (!mountedRef.current) return;
      clearTimeout(timeoutRef.current);
      setState('error');
    };

    scriptRef.current = script;
    widgetContainer.appendChild(script);
  }, [darkMode, cleanup]);

  // Debounced symbol/interval updates
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      initWidget(symbol, interval);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [symbol, interval, darkMode, initWidget]);

  // Mount / unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  const handleRetry = () => {
    setState('loading');
    lastInitRef.current = 0; // reset throttle
    initWidget(symbol, interval);
  };

  return (
    <div className="relative w-full h-full" style={{ minHeight: '520px' }}>
      {/* TradingView container */}
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full h-full"
        style={{ minHeight: '520px', height: '100%' }}
      >
        <div className="tradingview-widget-container__widget w-full h-full" style={{ minHeight: '520px', height: '100%' }} />
      </div>

      {/* Loading overlay */}
      {state === 'loading' && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
          <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
          <span className={`text-sm tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>CHART WIRD GELADEN …</span>
        </div>
      )}

      {/* Error overlay */}
      {state === 'error' && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
          <AlertTriangle className={`w-10 h-10 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`} />
          <p className={`text-sm font-sans ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Chart aktuell nicht verfügbar.</p>
          <button
            onClick={handleRetry}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs tracking-widest font-bold border-2 transition-all ${
              darkMode
                ? 'border-zinc-700 text-white hover:bg-zinc-800'
                : 'border-zinc-300 text-black hover:bg-zinc-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            ERNEUT VERSUCHEN
          </button>
        </div>
      )}
    </div>
  );
}