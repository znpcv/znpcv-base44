import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, TrendingUp, TrendingDown, Target, Shield, Award, Layers, Copy, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';

export default function TradeShareCard({ trade, darkMode }) {
  const cardRef = useRef(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculateScores = () => {
    const w = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + (trade.w_candlestick ? 10 : 0) + 
      (trade.w_psp_rejection ? 10 : 0) + (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + 
      (trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0);
    const d = (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + (trade.d_candlestick ? 10 : 0) + 
      (trade.d_psp_rejection ? 10 : 0) + (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + 
      (trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0);
    const h = (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + (trade.h4_psp_rejection ? 5 : 0) + 
      (trade.h4_swing ? 5 : 0) + (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0);
    const e = (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + 
      (trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);
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
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `ZNPCV Trade - ${trade.pair}`,
            text: `${trade.pair} ${trade.direction?.toUpperCase()} - Score: ${scores.total}%`
          });
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
          new ClipboardItem({ 'image/png': blob })
        ]);
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
        <div className="flex gap-1.5">
          <Button onClick={handleDownload} variant="outline" className={cn("h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs border-2", darkMode ? "border-zinc-800" : "border-zinc-200")}>
            <Download className="w-3 h-3 sm:mr-1.5" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button onClick={handleCopyImage} variant="outline" className={cn("h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs border-2", darkMode ? "border-zinc-800" : "border-zinc-200")}>
            {copied ? <Check className="w-3 h-3 text-teal-500 sm:mr-1.5" /> : <Copy className="w-3 h-3 sm:mr-1.5" />}
            <span className="hidden sm:inline">{copied ? 'Kopiert!' : 'Kopieren'}</span>
          </Button>
          <Button onClick={handleShare} className={cn("h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-bold border-2",
            darkMode ? "bg-white text-black border-white" : "bg-zinc-900 text-white border-zinc-900")}>
            <Share2 className="w-3 h-3 sm:mr-1.5" />
            <span className="hidden sm:inline">Teilen</span>
          </Button>
        </div>
      </div>

      <div ref={cardRef} className="bg-black text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-zinc-800 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-600 to-blue-600 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-wider mb-1 sm:mb-1.5">{trade.pair}</div>
              <div className={cn("inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold",
                trade.direction === 'long' ? "bg-teal-600" : "bg-rose-600")}>
                {trade.direction === 'long' ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                {trade.direction === 'long' ? 'LONG' : 'SHORT'}
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-3xl sm:text-4xl font-black mb-1 bg-gradient-to-r bg-clip-text text-transparent", getGradeColor(scores.total))}>
                {scores.total}%
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-500 tracking-wider">SCORE</div>
            </div>
          </div>

          {/* Confluence Badge */}
          {hasConfluence && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-teal-600/20 border border-teal-600/30 rounded-lg mb-3 sm:mb-4">
              <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-teal-400" />
              <div>
                <div className="text-teal-400 font-bold text-[10px] sm:text-xs">FULL CONFLUENCE</div>
                <div className="text-zinc-400 text-[9px] sm:text-[10px]">W•D•4H {trade.w_trend?.toUpperCase()}</div>
              </div>
            </div>
          )}

          {/* Scores Grid */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 sm:mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 sm:p-2.5 text-center">
              <div className="text-base sm:text-lg font-bold text-white mb-0.5">{scores.w}</div>
              <div className="text-[8px] sm:text-[9px] text-zinc-500 tracking-wider">W</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 sm:p-2.5 text-center">
              <div className="text-base sm:text-lg font-bold text-white mb-0.5">{scores.d}</div>
              <div className="text-[8px] sm:text-[9px] text-zinc-500 tracking-wider">D</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 sm:p-2.5 text-center">
              <div className="text-base sm:text-lg font-bold text-white mb-0.5">{scores.h}</div>
              <div className="text-[8px] sm:text-[9px] text-zinc-500 tracking-wider">4H</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 sm:p-2.5 text-center">
              <div className="text-base sm:text-lg font-bold text-white mb-0.5">{scores.e}</div>
              <div className="text-[8px] sm:text-[9px] text-zinc-500 tracking-wider">E</div>
            </div>
          </div>

          {/* Trade Levels - Compact */}
          {trade.entry_price && (
            <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-zinc-500 tracking-wider">ENTRY</span>
                <span className="font-mono font-bold text-white">{trade.entry_price}</span>
              </div>
              {trade.stop_loss && (
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-zinc-500 tracking-wider">SL</span>
                  <span className="font-mono font-bold text-rose-500">{trade.stop_loss}</span>
                </div>
              )}
              {trade.take_profit && (
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-zinc-500 tracking-wider">TP</span>
                  <span className="font-mono font-bold text-teal-500">{trade.take_profit}</span>
                </div>
              )}
              {rr && (
                <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1.5 sm:pt-2 border-t border-zinc-800">
                  <span className="text-zinc-500 tracking-wider">R:R</span>
                  <span className={cn("font-bold", parseFloat(rr) >= 2.5 ? "text-teal-500" : "text-amber-500")}>1:{rr}</span>
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {trade.outcome && trade.actual_pnl && (
            <div className={cn("px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl mb-4 sm:mb-6 border-2",
              trade.outcome === 'win' ? "bg-teal-600 border-teal-500" :
              trade.outcome === 'loss' ? "bg-rose-600 border-rose-500" :
              "bg-zinc-700 border-zinc-600")}>
              <div className="flex items-center justify-between">
                <div className="text-[10px] sm:text-xs font-bold tracking-wider">RESULT</div>
                <div className="text-lg sm:text-xl font-black">{parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}</div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-zinc-800">
            <div>
              <div className="text-[9px] sm:text-[10px] text-zinc-600 tracking-wider">ZNPCV</div>
              <div className="text-[8px] sm:text-[9px] text-zinc-700">Ultimate Trading Checklist</div>
            </div>
            {scores.total >= 85 && (
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-zinc-900 rounded-full border border-zinc-800">
                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-teal-500" />
                <span className="text-[9px] sm:text-[10px] font-bold text-teal-500">A+ TRADE</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}