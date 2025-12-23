import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import AssetSelector from '@/components/AssetSelector';

export default function TradeEditModal({ trade, onClose, onSave, isCreating, darkMode }) {
  const [formData, setFormData] = useState({
    pair: trade.pair || '',
    direction: trade.direction || '',
    outcome: trade.outcome || 'pending',
    actual_pnl: trade.actual_pnl || '',
    exit_date: trade.exit_date || '',
    notes: trade.notes || '',
    completion_percentage: trade.completion_percentage || 0,
    status: trade.status || 'in_progress'
  });

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200'
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className={`${theme.bg} border-2 ${theme.border} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto`}>

        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className={`text-lg sm:text-xl md:text-2xl tracking-widest ${theme.text}`}>
            {isCreating ? 'NEUER TRADE' : 'TRADE BEARBEITEN'}
          </h2>
          <button onClick={onClose} className={theme.textSecondary}>
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Pair Selection */}
          {isCreating &&
          <div>
              <label className={`block ${theme.textSecondary} text-xs sm:text-sm mb-2 tracking-wider`}>PAAR</label>
              <AssetSelector
              selectedPair={formData.pair}
              onSelect={(pair) => setFormData({ ...formData, pair })}
              darkMode={darkMode} />

            </div>
          }

          {/* Direction */}
          {isCreating &&
          <div>
              <label className={`block ${theme.textSecondary} text-xs sm:text-sm mb-2 tracking-wider`}>RICHTUNG</label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                onClick={() => setFormData({ ...formData, direction: 'long' })}
                className={cn("p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all text-xs sm:text-sm font-bold",
                formData.direction === 'long' ?
                'bg-teal-600 text-white border-teal-600' :
                `${theme.border} ${theme.text} hover:border-teal-600/50`)}>
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1" />
                  LONG
                </button>
                <button
                onClick={() => setFormData({ ...formData, direction: 'short' })}
                className={cn("p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all text-xs sm:text-sm font-bold",
                formData.direction === 'short' ?
                'bg-rose-600 text-white border-rose-600' :
                `${theme.border} ${theme.text} hover:border-rose-600/50`)}>
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1" />
                  SHORT
                </button>
              </div>
            </div>
          }

          {/* Outcome */}
          <div>
            <label className={`block ${theme.textSecondary} text-xs sm:text-sm mb-2 tracking-wider`}>ERGEBNIS</label>
            <Select value={formData.outcome} onValueChange={(v) => setFormData({ ...formData, outcome: v })}>
              <SelectTrigger className={`${theme.border} h-10 sm:h-11 text-sm`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="win">Win</SelectItem>
                <SelectItem value="loss">Loss</SelectItem>
                <SelectItem value="breakeven">Breakeven</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* P&L */}
          <div>
            <label className={`block ${theme.textSecondary} text-xs sm:text-sm mb-2 tracking-wider`}>P&L ($)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.actual_pnl}
              onChange={(e) => setFormData({ ...formData, actual_pnl: e.target.value })}
              placeholder="z.B. 250.50 oder -150.00"
              className={`${theme.border} h-10 sm:h-11 text-sm`} />

          </div>

          {/* Exit Date */}
          <div>
            <label className={`block ${theme.textSecondary} text-xs sm:text-sm mb-2 tracking-wider`}>AUSSTIEGSDATUM</label>
            <Input
              type="date"
              value={formData.exit_date}
              onChange={(e) => setFormData({ ...formData, exit_date: e.target.value })}
              className={`${theme.border} h-10 sm:h-11 text-sm`} />

          </div>

          {/* Notes */}
          <div>
            <label className={`block ${theme.textSecondary} text-xs sm:text-sm mb-2 tracking-wider`}>NOTIZEN</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Trade Notizen..."
              className={`${theme.border} min-h-[80px] sm:min-h-[100px] text-sm`} />

          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={onClose} variant="outline" className="bg-background text-slate-950 px-4 py-2 text-xs font-bold rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-sm hover:bg-accent hover:text-accent-foreground flex-1 h-10 sm:h-11 border-2 border-zinc-800 sm:text-sm">
              ABBRECHEN
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.pair || !formData.direction}
              className={`flex-1 h-10 sm:h-11 font-bold border-2 text-xs sm:text-sm ${darkMode ? 'bg-white text-black border-white hover:bg-zinc-100' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'}`}>
              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              SPEICHERN
            </Button>
          </div>
        </div>
      </motion.div>
    </div>);

}