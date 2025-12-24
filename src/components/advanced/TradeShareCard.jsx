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
        className="bg-black text-white p-6 sm:p-8 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl">
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

        <div className="relative z-10">
          {/* Header mit Logo */}
          <div className="border-b border-white/10 pb-5 mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              alt="ZNPCV"
              className="h-10 sm:h-12 w-auto mb-4"
            />
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight mb-1">{trade.pair}</div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar className="w-3 h-3" />
                  {trade.trade_date && format(new Date(trade.trade_date), 'dd.MM.yyyy')}
                </div>
              </div>
              <div className={cn("px-4 py-2 rounded-lg border",
                trade.direction === 'long' ? "bg-white/5 border-white/20" : "bg-white/5 border-white/20")}>
                <div className="flex items-center gap-1.5">
                  {trade.direction === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm font-black tracking-wider">{trade.direction === 'long' ? 'LONG' : 'SHORT'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Score */}
          <div className="text-center mb-6">
            <div className="text-6xl sm:text-7xl font-black mb-2 tracking-tighter">{scores.total}%</div>
            <div className="text-sm text-zinc-500 tracking-widest">ANALYSE SCORE</div>
          </div>

          {/* Trade Levels - Kompakt */}
          {trade.entry_price && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="border border-white/10 rounded-lg p-3 bg-white/5">
                <div className="text-[9px] text-zinc-500 mb-1.5 tracking-widest">ENTRY</div>
                <div className="font-mono text-sm font-bold">{trade.entry_price}</div>
              </div>
              {trade.stop_loss && (
                <div className="border border-white/10 rounded-lg p-3 bg-white/5">
                  <div className="text-[9px] text-zinc-500 mb-1.5 tracking-widest">STOP LOSS</div>
                  <div className="font-mono text-sm font-bold">{trade.stop_loss}</div>
                </div>
              )}
              {trade.take_profit && (
                <div className="border border-white/10 rounded-lg p-3 bg-white/5">
                  <div className="text-[9px] text-zinc-500 mb-1.5 tracking-widest">TAKE PROFIT</div>
                  <div className="font-mono text-sm font-bold">{trade.take_profit}</div>
                </div>
              )}
            </div>
          )}

          {/* Confluence */}
          {hasConfluence && (
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 mb-6">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider">CONFLUENCE W • D • 4H</span>
            </div>
          )}

          {/* RR wenn vorhanden */}
          {rr && (
            <div className="text-center mb-6 px-4 py-3 border border-white/10 rounded-lg bg-white/5">
              <div className="text-[10px] text-zinc-500 mb-1 tracking-widest">RISK:REWARD</div>
              <div className="text-2xl font-black">1:{rr}</div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-5 border-t border-white/10">
            <div className="text-[10px] text-zinc-600 tracking-widest">ZNPCV TRADE JOURNAL</div>
            <div className="text-[10px] text-zinc-600 font-mono">{new Date().getFullYear()}</div>
          </div>
        </div>
      </motion.div>
    </div>);

}