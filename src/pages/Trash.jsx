import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Home, Trash2, RotateCcw, X, ArrowLeft, Archive, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    queryKey: ['deletedTrades'],
    queryFn: async () => {
      const all = await base44.entities.TradeChecklist.list('-deleted_date', 100);
      return all.filter(t => t.deleted === true);
    },
    refetchInterval: 5000,
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => base44.entities.TradeChecklist.update(id, { deleted: false, deleted_date: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deletedTrades'] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TradeChecklist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deletedTrades'] });
    },
  });

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200',
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

      <main className="max-w-6xl mx-auto px-2 sm:px-3 md:px-6 py-3 sm:py-4 md:py-6 lg:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}>
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className={cn("w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center", darkMode ? "bg-zinc-900" : "bg-zinc-100")}>
                <Archive className={cn("w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7", theme.text)} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-widest mb-1">PAPIERKORB</h1>
                <p className={`${theme.textMuted} text-xs sm:text-sm tracking-wider`}>
                  {deletedTrades.length} {deletedTrades.length === 1 ? 'gelöschter Trade' : 'gelöschte Trades'}
                </p>
              </div>
            </div>
            {deletedTrades.length > 0 && (
              <Button 
                onClick={() => {
                  if (window.confirm(`Alle ${deletedTrades.length} Trades permanent löschen? Dies kann nicht rückgängig gemacht werden!`)) {
                    Promise.all(deletedTrades.map(t => permanentDeleteMutation.mutateAsync(t.id)));
                  }
                }}
                variant="destructive" 
                className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                Alle löschen
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center ${theme.bgSecondary}`}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4" />
              <p className={`${theme.textMuted} text-sm`}>Lädt...</p>
            </div>
          ) : deletedTrades.length === 0 ? (
            <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl p-8 sm:p-12 md:p-16 text-center ${theme.bgSecondary}`}>
              <Archive className={`w-12 h-12 sm:w-16 sm:h-16 ${theme.textMuted} mx-auto mb-4`} />
              <p className={`${theme.text} text-base sm:text-lg mb-2`}>Papierkorb ist leer</p>
              <p className={`${theme.textMuted} text-xs sm:text-sm`}>Gelöschte Trades werden hier angezeigt</p>
            </div>
          ) : (
            <div className={`border-2 ${theme.border} rounded-xl sm:rounded-2xl overflow-hidden ${theme.bgSecondary}`}>
              <div className={`divide-y ${darkMode ? 'divide-zinc-800/30' : 'divide-zinc-200'}`}>
                {deletedTrades.map((trade) => (
                  <div key={trade.id} className={`p-3 sm:p-4 md:p-5 lg:p-6 ${darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-100'} transition-colors`}>
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg sm:rounded-xl border-2 flex-shrink-0 ${
                          trade.outcome === 'win' ? 'bg-teal-600 text-white border-teal-600' :
                          trade.outcome === 'loss' ? 'bg-rose-600 text-white border-rose-600' :
                          trade.outcome === 'breakeven' ? 'bg-zinc-600 text-white border-zinc-600' :
                          trade.direction === 'long' ? 'border-teal-600 text-teal-600' : 'border-rose-600 text-rose-600'
                        }`}>
                          {trade.direction === 'long' ? (
                            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-base sm:text-lg md:text-xl font-bold tracking-wider ${theme.text} mb-0.5 sm:mb-1`}>
                            {trade.pair || 'Unbekannt'}
                          </div>
                          <div className={`text-[10px] sm:text-xs ${theme.textMuted} flex flex-wrap items-center gap-1 sm:gap-2`}>
                            <span>Erstellt: {format(new Date(trade.created_date), 'dd.MM.yy')}</span>
                            <span>•</span>
                            <span>Gelöscht: {format(new Date(trade.deleted_date), 'dd.MM.yy HH:mm')}</span>
                          </div>
                          {trade.notes && (
                            <div className={`text-xs ${theme.textMuted} mt-1 sm:mt-2 line-clamp-1`}>
                              {trade.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                        <Button 
                          onClick={() => restoreMutation.mutate(trade.id)} 
                          className="bg-teal-600 text-white hover:bg-teal-700 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 border-2 border-teal-600"
                        >
                          <RotateCcw className="w-3.5 h-3.5 sm:mr-1.5" />
                          <span className="hidden sm:inline">Wiederherstellen</span>
                        </Button>
                        <Button 
                          onClick={() => {
                            if (window.confirm('Trade permanent löschen? Dies kann nicht rückgängig gemacht werden!')) {
                              permanentDeleteMutation.mutate(trade.id);
                            }
                          }}
                          variant="outline"
                          className={`h-8 sm:h-9 px-2 sm:px-3 border-2 ${theme.border} hover:bg-rose-600 hover:text-white hover:border-rose-600`}
                        >
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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