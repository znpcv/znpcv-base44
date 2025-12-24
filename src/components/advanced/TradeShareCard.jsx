import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, TrendingUp, TrendingDown, Target, Layers, Copy, Check, Calendar, X } from 'lucide-react';
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
    const canvas = await html2canvas(cardRef.current, { 
      backgroundColor: darkMode ? '#000000' : '#ffffff', 
      scale: 3 
    });
    const link = document.createElement('a');
    link.download = `ZNPCV_${trade.pair}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { 
      backgroundColor: darkMode ? '#000000' : '#ffffff', 
      scale: 3 
    });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `ZNPCV_${trade.pair}.png`, { type: 'image/png' });

      if (navigator.share) {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `ZNPCV Trade - ${trade.pair}`,
              text: `${trade.pair} ${trade.direction?.toUpperCase()} - Score: ${scores.total}% | ZNPCV Trade Journal`
            });
          } else {
            await navigator.share({
              title: `ZNPCV Trade - ${trade.pair}`,
              text: `${trade.pair} ${trade.direction?.toUpperCase()} - Score: ${scores.total}% | ZNPCV Trade Journal`,
              url: window.location.href
            });
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
            setShowShare(true);
          }
        }
      } else {
        setShowShare(true);
      }
    });
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { 
      backgroundColor: darkMode ? '#000000' : '#ffffff', 
      scale: 3 
    });
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



  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn("text-sm sm:text-base tracking-widest flex items-center gap-2 font-bold", darkMode ? "text-white" : "text-zinc-900")}>
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          TEILEN
        </h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleDownload}
            variant="outline"
            className={cn("h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-bold border-2 flex items-center gap-2 transition-all",
              darkMode ? "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700" : "bg-white text-black border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400")}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button 
            onClick={handleCopyImage}
            variant="outline"
            className={cn("h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-bold border-2 flex items-center gap-2 transition-all",
              darkMode ? "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700" : "bg-white text-black border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400")}>
            {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Kopiert!' : 'Kopieren'}</span>
          </Button>
          <Button 
            onClick={handleShare}
            className={cn("h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-bold border-2 flex items-center gap-2 transition-all shadow-lg",
              darkMode ? "bg-white text-black border-white hover:bg-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800")}>
            <Share2 className="w-4 h-4" />
            Auf Social Media teilen
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showShare && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setShowShare(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn("fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 rounded-2xl border-2 shadow-2xl",
                darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
              <button
                onClick={() => setShowShare(false)}
                className={cn("absolute top-4 right-4 p-2 rounded-lg transition-colors",
                  darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100")}>
                <X className="w-5 h-5" />
              </button>
              
              <h3 className={cn("text-xl font-bold mb-4", darkMode ? "text-white" : "text-black")}>
                Trade teilen
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownload}
                  className={cn("p-4 rounded-xl border-2 font-bold text-sm transition-all hover:scale-105",
                    darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-750" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}>
                  <Download className="w-6 h-6 mx-auto mb-2" />
                  Download
                </button>
                
                <button
                  onClick={handleCopyImage}
                  className={cn("p-4 rounded-xl border-2 font-bold text-sm transition-all hover:scale-105",
                    darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-750" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200")}>
                  {copied ? <Check className="w-6 h-6 mx-auto mb-2 text-emerald-700" /> : <Copy className="w-6 h-6 mx-auto mb-2" />}
                  {copied ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>
              
              <p className={cn("text-xs text-center mt-4", darkMode ? "text-zinc-500" : "text-zinc-600")}>
                Kopiere das Bild und teile es auf deinen Social Media Kanälen
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={cn("p-6 sm:p-8 rounded-2xl overflow-hidden relative shadow-2xl",
          darkMode ? "bg-black text-white" : "bg-white text-black")}>
        
        {/* Subtle Grid Pattern */}
        <div className={cn("absolute inset-0 opacity-[0.03]", darkMode ? "" : "opacity-[0.05]")} style={{
          backgroundImage: darkMode ? 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)' : 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

        <div className="relative z-10">
          {/* Header mit Logo */}
          <div className={cn("pb-5 mb-6", darkMode ? "border-b border-white/10" : "border-b border-black/10")}>
            <img 
              src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV"
              className="h-10 sm:h-12 w-auto mb-4"
            />
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{trade.pair}</div>
                <div className={cn("flex items-center gap-2 text-xs", darkMode ? "text-zinc-500" : "text-zinc-600")}>
                  <Calendar className="w-3 h-3" />
                  {trade.trade_date && format(new Date(trade.trade_date), 'dd.MM.yyyy')}
                </div>
              </div>
              <div className={cn("px-4 py-2 rounded-lg font-black tracking-wider",
                trade.direction === 'long' ? "bg-emerald-700 text-white" : "bg-rose-600 text-white")}>
                <div className="flex items-center gap-1.5">
                  {trade.direction === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm">{trade.direction === 'long' ? 'LONG' : 'SHORT'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Score */}
          <div className="text-center mb-6">
            <div className="text-6xl sm:text-7xl font-black mb-2 tracking-tighter">{scores.total}%</div>
            <div className={cn("text-sm tracking-widest", darkMode ? "text-zinc-500" : "text-zinc-600")}>ANALYSE SCORE</div>
          </div>

          {/* Trade Levels */}
          {trade.entry_price && (
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <span className={cn("text-xs tracking-wider", darkMode ? "text-zinc-500" : "text-zinc-600")}>ENTRY</span>
                <span className="font-mono text-lg font-bold">{trade.entry_price}</span>
              </div>
              {trade.stop_loss && (
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-wider text-rose-600">STOP LOSS</span>
                  <span className="font-mono text-lg font-bold text-rose-600">{trade.stop_loss}</span>
                </div>
              )}
              {trade.take_profit && (
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-wider text-emerald-700">TAKE PROFIT</span>
                  <span className="font-mono text-lg font-bold text-emerald-700">{trade.take_profit}</span>
                </div>
              )}
            </div>
          )}

          {/* Confluence & RR */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {hasConfluence && (
              <div className="flex items-center gap-2">
                <Layers className={cn("w-4 h-4", darkMode ? "text-white" : "text-black")} />
                <span className="text-xs font-bold tracking-wider">CONFLUENCE</span>
              </div>
            )}
            {rr && (
              <div className="flex items-center gap-2">
                <Target className={cn("w-4 h-4", darkMode ? "text-white" : "text-black")} />
                <span className="text-xs font-bold">R:R 1:{rr}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={cn("flex items-center justify-between pt-5", darkMode ? "border-t border-white/10" : "border-t border-black/10")}>
            <div className={cn("text-[10px] tracking-widest", darkMode ? "text-zinc-600" : "text-zinc-500")}>ZNPCV TRADE JOURNAL</div>
            <div className={cn("text-[10px] font-mono", darkMode ? "text-zinc-600" : "text-zinc-500")}>{new Date().getFullYear()}</div>
          </div>
        </div>
      </motion.div>
    </div>);

}