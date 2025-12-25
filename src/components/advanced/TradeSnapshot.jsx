import React, { useRef, useState } from 'react';
import { Share2, Download, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export default function TradeSnapshot({ trade, darkMode }) {
  const cardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  const score = (trade.w_at_aoi ? 10 : 0) + (trade.w_ema_touch ? 5 : 0) + (trade.w_candlestick ? 10 : 0) + 
    (trade.w_psp_rejection ? 10 : 0) + (trade.w_round_level ? 5 : 0) + (trade.w_swing ? 10 : 0) + 
    (trade.w_pattern && trade.w_pattern !== 'none' ? 10 : 0) +
    (trade.d_at_aoi ? 10 : 0) + (trade.d_ema_touch ? 5 : 0) + (trade.d_candlestick ? 10 : 0) + 
    (trade.d_psp_rejection ? 10 : 0) + (trade.d_round_level ? 5 : 0) + (trade.d_swing ? 5 : 0) + 
    (trade.d_pattern && trade.d_pattern !== 'none' ? 10 : 0) +
    (trade.h4_at_aoi ? 5 : 0) + (trade.h4_candlestick ? 10 : 0) + (trade.h4_psp_rejection ? 5 : 0) + 
    (trade.h4_swing ? 5 : 0) + (trade.h4_pattern && trade.h4_pattern !== 'none' ? 10 : 0) +
    (trade.entry_sos ? 10 : 0) + (trade.entry_engulfing ? 10 : 0) + 
    (trade.entry_pattern && trade.entry_pattern !== 'none' ? 5 : 0);

  const isLong = trade.direction === 'long';
  const rr = trade.entry_price && trade.stop_loss && trade.take_profit ? 
    (Math.abs(parseFloat(trade.take_profit) - parseFloat(trade.entry_price)) / 
     Math.abs(parseFloat(trade.entry_price) - parseFloat(trade.stop_loss))).toFixed(1) : null;

  const captureAndShare = async () => {
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: darkMode ? '#000000' : '#FFFFFF',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `ZNPCV_${trade.pair}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `ZNPCV - ${trade.pair}`,
            text: `${isLong ? 'LONG' : 'SHORT'} Setup | Score: ${score}%`
          });
        } else {
          const link = document.createElement('a');
          link.download = `ZNPCV_${trade.pair}_${format(new Date(), 'ddMMyyyy')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
        setIsSharing(false);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Share error:', error);
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={captureAndShare}
        disabled={isSharing}
        className={cn(
          "w-full h-12 text-base font-black tracking-wider mb-6",
          darkMode 
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700" 
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        )}
      >
        <Share2 className="w-5 h-5 mr-2" />
        {isSharing ? 'WIRD ERSTELLT...' : 'SOCIAL MEDIA EXPORT'}
        <Sparkles className="w-5 h-5 ml-2" />
      </Button>

      <div
        ref={cardRef}
        className={cn(
          "w-full mx-auto rounded-2xl overflow-hidden shadow-2xl relative",
          darkMode ? "bg-black" : "bg-white"
        )}
        style={{ maxWidth: '600px' }}
      >
        {/* Gradient Overlay Top */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-1.5",
          isLong ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" : "bg-gradient-to-r from-rose-500 via-pink-500 to-red-500"
        )} />

        <div className="relative px-8 py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div className="flex-1">
              <div className={cn(
                "text-[10px] font-bold tracking-[0.4em] mb-3",
                darkMode ? "text-zinc-700" : "text-zinc-400"
              )}>
                ZNPCV TRADE
              </div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-black tracking-tight">
                  {trade.pair}
                </h1>
                <div className={cn(
                  "px-4 py-1 rounded-full text-xs font-black",
                  isLong 
                    ? "bg-emerald-500 text-white" 
                    : "bg-rose-500 text-white"
                )}>
                  {isLong ? '↑ LONG' : '↓ SHORT'}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-6">
              <div className="text-5xl font-black tracking-tighter leading-none">
                {score}
              </div>
              <div className={cn(
                "text-[9px] font-bold tracking-[0.4em] mt-2",
                darkMode ? "text-zinc-700" : "text-zinc-500"
              )}>
                SCORE
              </div>
            </div>
          </div>

          {/* Trade Levels */}
          <div className="space-y-3 mb-8">
            {trade.entry_price && (
              <div className={cn(
                "flex items-center justify-between px-5 py-3 rounded-xl border",
                darkMode ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <span className={cn(
                  "text-xs font-bold tracking-[0.25em]",
                  darkMode ? "text-zinc-600" : "text-zinc-500"
                )}>
                  ENTRY
                </span>
                <span className="text-2xl font-black font-mono">
                  {trade.entry_price}
                </span>
              </div>
            )}

            {trade.stop_loss && (
              <div className={cn(
                "flex items-center justify-between px-5 py-3 rounded-xl border",
                darkMode ? "bg-rose-950/20 border-rose-900/50" : "bg-rose-50 border-rose-200"
              )}>
                <span className="text-xs font-bold tracking-[0.25em] text-rose-500">
                  SL
                </span>
                <span className="text-2xl font-black font-mono text-rose-500">
                  {trade.stop_loss}
                </span>
              </div>
            )}

            {trade.take_profit && (
              <div className={cn(
                "flex items-center justify-between px-5 py-3 rounded-xl border",
                darkMode ? "bg-emerald-950/20 border-emerald-900/50" : "bg-emerald-50 border-emerald-200"
              )}>
                <span className="text-xs font-bold tracking-[0.25em] text-emerald-500">
                  TP
                </span>
                <span className="text-2xl font-black font-mono text-emerald-500">
                  {trade.take_profit}
                </span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-8">
            {rr && (
              <div className={cn(
                "px-3 py-4 rounded-xl text-center border",
                darkMode ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="text-xl font-black mb-1.5">
                  1:{rr}
                </div>
                <div className={cn(
                  "text-[9px] font-bold tracking-[0.2em]",
                  darkMode ? "text-zinc-700" : "text-zinc-500"
                )}>
                  R:R
                </div>
              </div>
            )}
            {trade.risk_percent && (
              <div className={cn(
                "px-3 py-4 rounded-xl text-center border",
                darkMode ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="text-xl font-black mb-1.5">
                  {trade.risk_percent}%
                </div>
                <div className={cn(
                  "text-[9px] font-bold tracking-[0.2em]",
                  darkMode ? "text-zinc-700" : "text-zinc-500"
                )}>
                  RISK
                </div>
              </div>
            )}
            {trade.leverage && (
              <div className={cn(
                "px-3 py-4 rounded-xl text-center border",
                darkMode ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="text-xl font-black mb-1.5">
                  1:{trade.leverage}
                </div>
                <div className={cn(
                  "text-[9px] font-bold tracking-[0.2em]",
                  darkMode ? "text-zinc-700" : "text-zinc-500"
                )}>
                  LEV
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={cn(
            "flex items-center justify-between pt-6 border-t",
            darkMode ? "border-zinc-900" : "border-zinc-200"
          )}>
            <img
              src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV"
              className="h-8 opacity-60"
            />
            <div className={cn(
              "text-xs font-mono font-bold",
              darkMode ? "text-zinc-700" : "text-zinc-500"
            )}>
              {trade.trade_date && format(new Date(trade.trade_date), 'dd.MM.yyyy')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}