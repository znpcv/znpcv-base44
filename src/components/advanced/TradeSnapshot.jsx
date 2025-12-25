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
          "w-full h-14 text-base font-black tracking-wider mb-8 border-2",
          darkMode 
            ? "bg-white text-black border-white hover:bg-zinc-100" 
            : "bg-black text-white border-black hover:bg-zinc-900"
        )}
      >
        <Share2 className="w-5 h-5 mr-2" />
        {isSharing ? 'WIRD ERSTELLT...' : 'FÜR SOCIAL MEDIA TEILEN'}
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

        <div className="relative px-10 py-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              }
              alt="ZNPCV"
              className="h-16 opacity-90"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black tracking-tight mb-4">
              {trade.pair}
            </h1>
            <div className="flex items-center justify-center gap-6">
              <div className={cn(
                "px-8 py-2.5 rounded-xl text-base font-black",
                isLong 
                  ? "bg-emerald-500 text-white" 
                  : "bg-rose-500 text-white"
              )}>
                {isLong ? '↑ LONG' : '↓ SHORT'}
              </div>
              <div className="text-center">
                <div className="text-6xl font-black tracking-tighter leading-none">
                  {score}
                </div>
                <div className={cn(
                  "text-xs font-bold tracking-[0.3em] mt-1",
                  darkMode ? "text-zinc-700" : "text-zinc-500"
                )}>
                  SCORE
                </div>
              </div>
            </div>
          </div>

          {/* Trade Levels */}
          <div className="space-y-4 mb-10">
            {trade.entry_price && (
              <div className={cn(
                "flex items-center justify-between px-6 py-4 rounded-xl border-2",
                darkMode ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <span className={cn(
                  "text-sm font-bold tracking-[0.3em]",
                  darkMode ? "text-zinc-600" : "text-zinc-500"
                )}>
                  ENTRY
                </span>
                <span className="text-3xl font-black font-mono">
                  {trade.entry_price}
                </span>
              </div>
            )}

            {trade.stop_loss && (
              <div className={cn(
                "flex items-center justify-between px-6 py-4 rounded-xl border-2",
                darkMode ? "bg-rose-950/20 border-rose-900/50" : "bg-rose-50 border-rose-200"
              )}>
                <span className="text-sm font-bold tracking-[0.3em] text-rose-500">
                  STOP LOSS
                </span>
                <span className="text-3xl font-black font-mono text-rose-500">
                  {trade.stop_loss}
                </span>
              </div>
            )}

            {trade.take_profit && (
              <div className={cn(
                "flex items-center justify-between px-6 py-4 rounded-xl border-2",
                darkMode ? "bg-emerald-950/20 border-emerald-900/50" : "bg-emerald-50 border-emerald-200"
              )}>
                <span className="text-sm font-bold tracking-[0.3em] text-emerald-500">
                  TAKE PROFIT
                </span>
                <span className="text-3xl font-black font-mono text-emerald-500">
                  {trade.take_profit}
                </span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {rr && (
              <div className={cn(
                "px-4 py-5 rounded-xl text-center border-2",
                darkMode ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="text-2xl font-black mb-2">
                  1:{rr}
                </div>
                <div className={cn(
                  "text-xs font-bold tracking-[0.2em]",
                  darkMode ? "text-zinc-700" : "text-zinc-500"
                )}>
                  R:R
                </div>
              </div>
            )}
            {trade.risk_percent && (
              <div className={cn(
                "px-4 py-5 rounded-xl text-center border-2",
                darkMode ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="text-2xl font-black mb-2">
                  {trade.risk_percent}%
                </div>
                <div className={cn(
                  "text-xs font-bold tracking-[0.2em]",
                  darkMode ? "text-zinc-700" : "text-zinc-500"
                )}>
                  RISK
                </div>
              </div>
            )}
            {trade.leverage && (
              <div className={cn(
                "px-4 py-5 rounded-xl text-center border-2",
                darkMode ? "bg-zinc-950/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="text-2xl font-black mb-2">
                  1:{trade.leverage}
                </div>
                <div className={cn(
                  "text-xs font-bold tracking-[0.2em]",
                  darkMode ? "text-zinc-700" : "text-zinc-500"
                )}>
                  LEV
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={cn(
            "flex items-center justify-center pt-10 mt-10 border-t-2",
            darkMode ? "border-zinc-900" : "border-zinc-200"
          )}>
            <div className={cn(
              "text-sm font-mono font-bold",
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