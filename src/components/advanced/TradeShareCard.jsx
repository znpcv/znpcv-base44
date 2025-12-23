import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, TrendingUp, TrendingDown, Target, Shield, Award, Layers, Copy, Check, X, Zap, Activity, BarChart3, Percent, Calendar, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export default function TradeShareCard({ trade, darkMode }) {
  const cardRef = useRef(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(true);

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
        <div className="flex items-center gap-2 sm:gap-3">
          <h3 className={cn("text-xs sm:text-sm tracking-widest flex items-center gap-2", darkMode ? "text-white" : "text-zinc-900")}>
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            TEILEN
          </h3>
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className={cn("px-2 sm:px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold border-2 transition-all flex items-center gap-1",
              advancedMode 
                ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white border-teal-600" 
                : darkMode ? "border-zinc-800 text-zinc-400 hover:border-zinc-700" : "border-zinc-300 text-zinc-600 hover:border-zinc-400")}>
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">{advancedMode ? 'ADVANCED' : 'BASIC'}</span>
          </button>
        </div>
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
          {/* Premium Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-3xl sm:text-4xl font-black tracking-tight">{trade.pair}</div>
                <div className={cn("inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black shadow-lg",
                  trade.direction === 'long' ? "bg-gradient-to-r from-teal-600 to-emerald-600" : "bg-gradient-to-r from-rose-600 to-red-600")}>
                  {trade.direction === 'long' ? <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  {trade.direction === 'long' ? 'LONG' : 'SHORT'}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <Calendar className="w-3 h-3" />
                {format(new Date(trade.created_date), 'dd.MM.yyyy')}
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-4xl sm:text-5xl font-black mb-1 bg-gradient-to-br bg-clip-text text-transparent leading-none", getGradeColor(scores.total))}>
                {scores.total}
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-500 tracking-widest font-bold">ZNPCV SCORE</div>
              {scores.total >= 85 && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-teal-600/20 border border-teal-600/40 rounded-md">
                  <Award className="w-2.5 h-2.5 text-teal-500" />
                  <span className="text-[9px] text-teal-500 font-bold">A+ TRADE</span>
                </div>
              )}
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

          {/* Advanced Score Breakdown */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-5">
            {[
              { label: 'W', value: scores.w, max: 60, icon: Activity },
              { label: 'D', value: scores.d, max: 60, icon: BarChart3 },
              { label: '4H', value: scores.h, max: 35, icon: TrendingUp },
              { label: 'E', value: scores.e, max: 25, icon: Target }
            ].map((item, idx) => (
              <div key={item.label} className="relative group">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 sm:p-3 text-center overflow-hidden relative">
                  {/* Progress Bar Background */}
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-600/10 to-transparent" style={{
                    height: `${(item.value / item.max) * 100}%`,
                    bottom: 0
                  }} />
                  
                  <div className="relative z-10">
                    <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto mb-1 text-zinc-600" />
                    <div className="text-lg sm:text-xl font-black text-white mb-0.5">{item.value}</div>
                    <div className="text-[8px] sm:text-[9px] text-zinc-500 tracking-wider font-bold">{item.label}</div>
                    <div className="text-[7px] sm:text-[8px] text-zinc-600 mt-0.5">/{item.max}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Advanced Trade Levels */}
          {advancedMode && trade.entry_price && (
            <div className="mb-5">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2.5">
                  <div className="text-[9px] text-zinc-500 mb-1 tracking-wider flex items-center gap-1">
                    <Target className="w-2.5 h-2.5" />
                    ENTRY
                  </div>
                  <div className="font-mono text-sm sm:text-base font-bold text-white">{trade.entry_price}</div>
                </div>
                {rr && (
                  <div className={cn("bg-zinc-900/80 border rounded-lg p-2.5",
                    parseFloat(rr) >= 2.5 ? "border-teal-600/50 bg-teal-600/10" : "border-amber-600/50 bg-amber-600/10")}>
                    <div className="text-[9px] text-zinc-500 mb-1 tracking-wider flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" />
                      R:R
                    </div>
                    <div className={cn("font-bold text-sm sm:text-base", parseFloat(rr) >= 2.5 ? "text-teal-400" : "text-amber-400")}>
                      1:{rr}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {trade.stop_loss && (
                  <div className="bg-rose-600/10 border border-rose-600/30 rounded-lg p-2.5">
                    <div className="text-[9px] text-rose-400 mb-1 tracking-wider">SL</div>
                    <div className="font-mono text-sm font-bold text-rose-400">{trade.stop_loss}</div>
                  </div>
                )}
                {trade.take_profit && (
                  <div className="bg-teal-600/10 border border-teal-600/30 rounded-lg p-2.5">
                    <div className="text-[9px] text-teal-400 mb-1 tracking-wider">TP</div>
                    <div className="font-mono text-sm font-bold text-teal-400">{trade.take_profit}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Basic Trade Levels */}
          {!advancedMode && trade.entry_price && (
            <div className="space-y-1.5 mb-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 tracking-wider">ENTRY</span>
                <span className="font-mono font-bold text-white">{trade.entry_price}</span>
              </div>
              {trade.stop_loss && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 tracking-wider">SL</span>
                  <span className="font-mono font-bold text-rose-500">{trade.stop_loss}</span>
                </div>
              )}
              {trade.take_profit && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 tracking-wider">TP</span>
                  <span className="font-mono font-bold text-teal-500">{trade.take_profit}</span>
                </div>
              )}
              {rr && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                  <span className="text-zinc-500 tracking-wider">R:R</span>
                  <span className={cn("font-bold", parseFloat(rr) >= 2.5 ? "text-teal-500" : "text-amber-500")}>1:{rr}</span>
                </div>
              )}
            </div>
          )}

          {/* Advanced Stats Grid */}
          {advancedMode && (
            <div className="grid grid-cols-2 gap-2 mb-5">
              {trade.risk_percent && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <Percent className="w-3 h-3 text-amber-500" />
                    <div className="text-[9px] text-zinc-500 tracking-wider">RISK</div>
                  </div>
                  <div className="text-base font-bold text-amber-400">{trade.risk_percent}%</div>
                </div>
              )}
              {trade.leverage && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="w-3 h-3 text-purple-500" />
                    <div className="text-[9px] text-zinc-500 tracking-wider">LEVERAGE</div>
                  </div>
                  <div className="text-base font-bold text-purple-400">1:{trade.leverage}</div>
                </div>
              )}
            </div>
          )}

          {/* Result - Enhanced */}
          {trade.outcome && trade.actual_pnl && (
            <div className={cn("relative px-4 py-4 rounded-xl mb-5 border-2 overflow-hidden",
              trade.outcome === 'win' ? "bg-gradient-to-br from-teal-600 to-emerald-600 border-teal-500" :
              trade.outcome === 'loss' ? "bg-gradient-to-br from-rose-600 to-red-600 border-rose-500" :
              "bg-gradient-to-br from-zinc-700 to-zinc-800 border-zinc-600")}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest mb-1 opacity-90">RESULT</div>
                    <div className="text-2xl sm:text-3xl font-black">{parseFloat(trade.actual_pnl) > 0 ? '+' : ''}${trade.actual_pnl}</div>
                  </div>
                  {trade.exit_date && advancedMode && (
                    <div className="text-right">
                      <div className="text-[9px] opacity-70 mb-0.5">EXIT</div>
                      <div className="text-[10px] font-mono">{format(new Date(trade.exit_date), 'dd.MM.yy')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Footer with QR Code placeholder */}
          {advancedMode && (
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <div className="text-black font-black text-xs">ZN</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black tracking-wider">ZNPCV</div>
                      <div className="text-[8px] text-zinc-600">Pro Trading System</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] text-zinc-600 mb-0.5">CERTIFIED TRADE</div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                    <span className="text-[9px] text-zinc-500 font-mono">{trade.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Basic Footer */}
          {!advancedMode && (
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <div>
                <div className="text-[9px] text-zinc-600 tracking-wider">ZNPCV</div>
                <div className="text-[8px] text-zinc-700">Ultimate Trading Checklist</div>
              </div>
              <div className="text-[8px] text-zinc-600 font-mono">{new Date().getFullYear()}</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}