import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Home, Trash2, RotateCcw, X, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';

export default function TrashPage() {
  const navigate = useNavigate();
  const { t, darkMode } = useLanguage();
  const queryClient = useQueryClient();

  const { data: deletedTrades = [], isLoading } = useQuery({
    queryKey: ['deleted-trades'],
    queryFn: async () => {
      const all = await base44.entities.TradeChecklist.list('-deleted_date', 100);
      return all.filter(t => t.deleted === true);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => base44.entities.TradeChecklist.update(id, { deleted: false, deleted_date: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-trades'] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TradeChecklist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-trades'] });
    },
  });

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 relative">
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button onClick={() => navigate(createPageUrl('TradeHistory'))} className={`${theme.textSecondary} hover:${theme.text} p-2`}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              } alt="ZNPCV" className="h-10 sm:h-12 w-auto" />
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", darkMode ? "bg-zinc-900" : "bg-zinc-100")}>
              <Trash2 className={cn("w-6 h-6", theme.text)} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl tracking-widest">PAPIERKORB</h1>
              <p className={`${theme.textSecondary} text-sm`}>{deletedTrades.length} gelöschte Trades</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className={`animate-spin w-8 h-8 border-2 ${darkMode ? 'border-white' : 'border-black'} border-t-transparent rounded-full mx-auto`} />
            </div>
          ) : deletedTrades.length === 0 ? (
            <div className={cn("text-center py-12 border-2 rounded-2xl", theme.border, theme.bgSecondary)}>
              <Trash2 className={cn("w-16 h-16 mx-auto mb-4", theme.textSecondary)} />
              <p className={theme.textSecondary}>Papierkorb ist leer</p>
            </div>
          ) : (
            <div className={cn("border-2 rounded-2xl overflow-hidden", theme.border, theme.bgSecondary)}>
              <div className={cn("divide-y", darkMode ? "divide-zinc-800" : "divide-zinc-200")}>
                {deletedTrades.map((trade) => (
                  <div key={trade.id} className={cn("p-4 sm:p-5 transition-all", darkMode ? "hover:bg-zinc-900" : "hover:bg-zinc-100")}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-lg font-bold mb-1", theme.text)}>{trade.pair}</div>
                        <div className={cn("text-xs", theme.textSecondary)}>
                          Gelöscht: {format(new Date(trade.deleted_date), 'dd.MM.yyyy HH:mm')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => restoreMutation.mutate(trade.id)}
                          className={cn("h-9 px-3 text-xs font-bold border-2", 
                            darkMode ? "bg-teal-600 text-white border-teal-600" : "bg-teal-600 text-white border-teal-600")}>
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          Wiederherstellen
                        </Button>
                        <Button
                          onClick={() => {
                            if (window.confirm('Endgültig löschen?')) {
                              permanentDeleteMutation.mutate(trade.id);
                            }
                          }}
                          variant="outline"
                          className={cn("h-9 px-3 border-2", theme.border)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}