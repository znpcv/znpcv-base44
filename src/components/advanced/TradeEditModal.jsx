import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

export default function TradeEditModal({ trade, onClose, onSave }) {
  const { darkMode } = useLanguage();
  const [formData, setFormData] = useState({
    outcome: trade.outcome || 'pending',
    actual_pnl: trade.actual_pnl || '',
    exit_date: trade.exit_date || '',
    entry_price: trade.entry_price || '',
    stop_loss: trade.stop_loss || '',
    take_profit: trade.take_profit || '',
    notes: trade.notes || '',
    account_size: trade.account_size || '',
    risk_percent: trade.risk_percent || '',
  });

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textMuted: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    input: darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const calculatePnL = () => {
    const entry = parseFloat(formData.entry_price);
    const exit = parseFloat(formData.stop_loss);
    const account = parseFloat(formData.account_size);
    const risk = parseFloat(formData.risk_percent);
    
    if (entry && exit && account && risk) {
      const riskAmount = account * (risk / 100);
      const pnl = formData.outcome === 'win' ? riskAmount * 2.5 : -riskAmount;
      setFormData({ ...formData, actual_pnl: pnl.toFixed(2) });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative ${theme.bg} rounded-2xl border-2 ${theme.border} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
        >
          <div className={`sticky top-0 ${theme.bg} border-b ${theme.border} p-4 sm:p-6 flex items-center justify-between z-10`}>
            <h2 className={`text-xl sm:text-2xl tracking-widest ${theme.text}`}>TRADE BEARBEITEN</h2>
            <button onClick={onClose} className={`${theme.textMuted} hover:${theme.text} transition-colors`}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {/* Outcome */}
            <div>
              <label className={`text-xs ${theme.textMuted} mb-2 block tracking-wider`}>ERGEBNIS</label>
              <div className="grid grid-cols-4 gap-2">
                {['win', 'loss', 'breakeven', 'pending'].map((outcome) => (
                  <button
                    key={outcome}
                    type="button"
                    onClick={() => setFormData({ ...formData, outcome })}
                    className={cn("py-2 rounded-lg text-xs font-bold transition-all border-2",
                      formData.outcome === outcome
                        ? outcome === 'win' ? 'bg-teal-600 text-white border-teal-600' :
                          outcome === 'loss' ? 'bg-rose-600 text-white border-rose-600' :
                          outcome === 'breakeven' ? 'bg-zinc-600 text-white border-zinc-600' :
                          'bg-blue-500 text-white border-blue-500'
                        : `${theme.input} hover:border-teal-600/50`)}
                  >
                    {outcome.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Trade Prices */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={`text-xs ${theme.textMuted} mb-2 block`}>ENTRY</label>
                <Input
                  type="number"
                  step="0.00001"
                  value={formData.entry_price}
                  onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                  className={theme.input}
                />
              </div>
              <div>
                <label className={`text-xs text-rose-600 mb-2 block`}>STOP LOSS</label>
                <Input
                  type="number"
                  step="0.00001"
                  value={formData.stop_loss}
                  onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                  className="bg-rose-600/10 border-rose-600/30"
                />
              </div>
              <div>
                <label className={`text-xs text-teal-600 mb-2 block`}>TAKE PROFIT</label>
                <Input
                  type="number"
                  step="0.00001"
                  value={formData.take_profit}
                  onChange={(e) => setFormData({ ...formData, take_profit: e.target.value })}
                  className="bg-teal-600/10 border-teal-600/30"
                />
              </div>
            </div>

            {/* Account & Risk */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-xs ${theme.textMuted} mb-2 block`}>ACCOUNT SIZE</label>
                <Input
                  type="number"
                  value={formData.account_size}
                  onChange={(e) => setFormData({ ...formData, account_size: e.target.value })}
                  placeholder="10000"
                  className={theme.input}
                />
              </div>
              <div>
                <label className={`text-xs ${theme.textMuted} mb-2 block`}>RISK %</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.risk_percent}
                  onChange={(e) => setFormData({ ...formData, risk_percent: e.target.value })}
                  placeholder="3"
                  className={theme.input}
                />
              </div>
            </div>

            {/* P&L */}
            <div>
              <label className={`text-xs ${theme.textMuted} mb-2 block flex items-center justify-between`}>
                <span>PROFIT/LOSS (USD)</span>
                <button type="button" onClick={calculatePnL} className="text-blue-400 text-[10px] hover:text-blue-300">
                  Auto-Berechnen
                </button>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.actual_pnl}
                onChange={(e) => setFormData({ ...formData, actual_pnl: e.target.value })}
                placeholder="0.00"
                className={theme.input}
              />
            </div>

            {/* Exit Date */}
            <div>
              <label className={`text-xs ${theme.textMuted} mb-2 block`}>EXIT DATUM</label>
              <Input
                type="date"
                value={formData.exit_date}
                onChange={(e) => setFormData({ ...formData, exit_date: e.target.value })}
                className={theme.input}
              />
            </div>

            {/* Notes */}
            <div>
              <label className={`text-xs ${theme.textMuted} mb-2 block`}>NOTIZEN</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Trade-Notizen, Beobachtungen..."
                className={`${theme.input} min-h-[100px]`}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                Abbrechen
              </Button>
              <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Speichern
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}