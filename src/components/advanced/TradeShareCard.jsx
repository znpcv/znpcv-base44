import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, TrendingUp, TrendingDown, Target, Layers, Copy, Check, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export default function TradeShareCard({ trade, darkMode }) {
  const cardRef = useRef(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculateScores = () => {
    const w = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + (trade.w_candlestick ? 10 : 0) + (
    trade.w_psp_rejection ? 10 : 0) + (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + (
    trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0);
    const d = (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + (trade.d_candlestick ? 10 : 0) + (
    trade.d_psp_rejection ? 10 : 0) + (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + (
    trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0);
    const h = (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + (trade.h4_psp_rejection ? 5 : 0) + (
    trade.h4_swing ? 5 : 0) + (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0);
    const e = (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + (
    trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);
    return { w, d, h, e, total: w + d + h + e };
  };

  const scores = calculateScores();
  const hasConfluence = trade.w_trend && trade.d_trend && trade.h4_trend &&
  trade.w_trend === trade.d_trend && trade.d_trend === trade.h4_trend;

  const calculateRR = () => {
    if (!trade.entry_price || !trade.stop_loss || !trade.take_profit) return null;
    const entry = parseFloat(trade.entry_price);
    const sl = parseFloat(trade.stop_loss);
    const tp = parseFloat(trade.take_profit);
    const isLong = trade.direction === 'long';
    const slDist = isLong ? entry - sl : sl - entry;
    const tpDist = isLong ? tp - entry : entry - tp;
    return slDist > 0 ? (tpDist / slDist).toFixed(2) : null;
  };

  const rr = calculateRR();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: '#000000', scale: 3 });
    const link = document.createElement('a');
    link.download = `ZNPCV_${trade.pair}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: '#000000', scale: 3 });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `ZNPCV_${trade.pair}.png`, { type: 'image/png' });

      if (navigator.share) {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `ZNPCV Trade - ${trade.pair}`,
              text: `${trade.pair} ${trade.direction?.toUpperCase()} - Score: ${scores.total}%`
            });
          } else {
            await navigator.share({
              title: `ZNPCV Trade - ${trade.pair}`,
              text: `${trade.pair} ${trade.direction?.toUpperCase()} - Score: ${scores.total}%`,
              url: window.location.href
            });
          }
        } catch (err) {
          if (err.name !== 'AbortError') console.error('Share failed:', err);
        }
      } else {
        setShowShare(true);
      }
    });
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: '#000000', scale: 3 });
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })]
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });
  };

  const getGradeColor = (score) => {
    if (score >= 100) return 'from-teal-600 to-emerald-600';
    if (score >= 90) return 'from-teal-500 to-teal-600';
    if (score >= 85) return 'from-blue-500 to-blue-600';
    return 'from-zinc-600 to-zinc-700';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className={cn("text-xs sm:text-sm tracking-widest flex items-center gap-2", darkMode ? "text-white" : "text-zinc-900")}>
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          TEILEN
        </h3>
        <Button onClick={async () => {
          await handleDownload();
          await handleShare();
        }} className={cn("h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-bold border-2 flex items-center gap-2",
        darkMode ? "bg-white text-black border-white hover:bg-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800")}>
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Teilen
        </Button>
      </div>

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-gradient-to-br from-zinc-950 to-black text-white p-5 sm:p-7 rounded-2xl border-2 border-zinc-800 overflow-hidden relative shadow-2xl">
        {/* Advanced Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-teal-600/20 to-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-600/10 to-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-600/5 to-cyan-600/5 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        <div className="relative z-10">
          {/* Header mit Logo */}
          <div className="flex items-center justify-between mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              alt="ZNPCV"
              className="h-8 sm:h-10 w-auto"
            />
            <div className="text-right">
              <div className={cn("text-4xl sm:text-5xl font-black bg-gradient-to-br bg-clip-text text-transparent", getGradeColor(scores.total))}>
                {scores.total}%
              </div>
              <div className="text-[9px] text-zinc-500 tracking-widest">SCORE</div>
            </div>
          </div>

          {/* Trade Info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl sm:text-4xl font-black tracking-tight">{trade.pair}</div>
            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black",
              trade.direction === 'long' ? "bg-emerald-700 text-white" : "bg-rose-600 text-white")}>
              {trade.direction === 'long' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trade.direction === 'long' ? 'LONG' : 'SHORT'}
            </div>
          </div>

          {/* Trade Levels */}
          {trade.entry_price && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-center">
                <div className="text-[9px] text-zinc-500 mb-1 tracking-wider">ENTRY</div>
                <div className="font-mono text-sm font-bold">{trade.entry_price}</div>
              </div>
              {trade.stop_loss && (
                <div className="bg-rose-600/10 border border-rose-600/30 rounded-lg p-3 text-center">
                  <div className="text-[9px] text-rose-400 mb-1 tracking-wider">SL</div>
                  <div className="font-mono text-sm font-bold text-rose-400">{trade.stop_loss}</div>
                </div>
              )}
              {trade.take_profit && (
                <div className="bg-emerald-700/10 border border-emerald-700/30 rounded-lg p-3 text-center">
                  <div className="text-[9px] text-emerald-400 mb-1 tracking-wider">TP</div>
                  <div className="font-mono text-sm font-bold text-emerald-400">{trade.take_profit}</div>
                </div>
              )}
            </div>
          )}

          {/* Confluence Badge */}
          {hasConfluence && (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-700/20 border border-emerald-700/30 mb-4">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">CONFLUENCE W•D•4H</span>
            </div>
          )}

          {/* Result */}
          {trade.outcome && trade.actual_pnl && (
            <div className={cn("px-4 py-3.5 rounded-xl mb-4 border-2",
              trade.outcome === 'win' ? "bg-emerald-700 border-emerald-600" :
              trade.outcome === 'loss' ? "bg-rose-600 border-rose-500" :
              "bg-zinc-700 border-zinc-600")}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold tracking-widest mb-1 opacity-80">P&L</div>
                  <div className="text-2xl sm:text-3xl font-black">{parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}</div>
                </div>
                {rr && (
                  <div className="text-right">
                    <div className="text-[9px] opacity-70">R:R</div>
                    <div className="text-lg font-bold">1:{rr}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-zinc-600">
            <div className="text-[10px] font-mono">
              {trade.trade_date && format(new Date(trade.trade_date), 'dd.MM.yyyy')}
            </div>
            <div className="text-[9px] tracking-wider">ZNPCV.COM</div>
          </div>
        </div>
      </motion.div>
    </div>);

}