import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown, ThumbsUp, MessageCircle, Eye, Award, Users, Share2, Filter, Clock, Target, ArrowUpRight, ArrowDownRight, Layers, ChevronRight, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { useLanguage, LanguageToggle, DarkModeToggle } from '@/components/LanguageContext';
import AccountButton from '@/components/AccountButton';

export default function CommunityPage() {
  const navigate = useNavigate();
  const { t, isRTL, darkMode } = useLanguage();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('trending');
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [commentText, setCommentText] = useState('');

  const { data: sharedTrades = [] } = useQuery({
    queryKey: ['sharedTrades'],
    queryFn: () => base44.entities.SharedTrade.list('-created_date', 50)
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments'],
    queryFn: () => base44.entities.TradeComment.list('-created_date', 200)
  });

  const { data: myLikes = [] } = useQuery({
    queryKey: ['myLikes'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.TradeLike.filter({ user_email: user.email });
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (tradeId) => {
      const user = await base44.auth.me();
      const existing = myLikes.find(l => l.shared_trade_id === tradeId);
      
      if (existing) {
        await base44.entities.TradeLike.delete(existing.id);
        await base44.entities.SharedTrade.update(tradeId, {
          likes: Math.max(0, (sharedTrades.find(t => t.id === tradeId)?.likes || 0) - 1)
        });
      } else {
        await base44.entities.TradeLike.create({
          shared_trade_id: tradeId,
          user_email: user.email
        });
        await base44.entities.SharedTrade.update(tradeId, {
          likes: (sharedTrades.find(t => t.id === tradeId)?.likes || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedTrades'] });
      queryClient.invalidateQueries({ queryKey: ['myLikes'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ tradeId, content }) => {
      const user = await base44.auth.me();
      await base44.entities.TradeComment.create({
        shared_trade_id: tradeId,
        author_name: user.full_name || 'Anonymous',
        content
      });
      await base44.entities.SharedTrade.update(tradeId, {
        comment_count: (sharedTrades.find(t => t.id === tradeId)?.comment_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['sharedTrades'] });
      setCommentText('');
    }
  });

  const viewMutation = useMutation({
    mutationFn: (tradeId) => {
      const trade = sharedTrades.find(t => t.id === tradeId);
      return base44.entities.SharedTrade.update(tradeId, {
        views: (trade?.views || 0) + 1
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sharedTrades'] })
  });

  const sortedTrades = useMemo(() => {
    let sorted = [...sharedTrades];
    if (filter === 'trending') {
      sorted.sort((a, b) => (b.likes + b.comment_count) - (a.likes + a.comment_count));
    } else if (filter === 'top') {
      sorted.sort((a, b) => b.completion_percentage - a.completion_percentage);
    } else if (filter === 'recent') {
      sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
    return sorted;
  }, [sharedTrades, filter]);

  const leaderboard = useMemo(() => {
    const authors = {};
    sharedTrades.forEach(trade => {
      if (!authors[trade.created_by]) {
        authors[trade.created_by] = {
          name: trade.author_name || 'Anonymous',
          trades: 0,
          avgScore: 0,
          totalScore: 0,
          totalLikes: 0
        };
      }
      authors[trade.created_by].trades += 1;
      authors[trade.created_by].totalScore += trade.completion_percentage || 0;
      authors[trade.created_by].totalLikes += trade.likes || 0;
    });

    return Object.values(authors)
      .map(author => ({
        ...author,
        avgScore: author.trades > 0 ? Math.round(author.totalScore / author.trades) : 0
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);
  }, [sharedTrades]);

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800/50' : 'border-zinc-200'
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button onClick={() => navigate(createPageUrl('Dashboard'))} className={`${theme.textSecondary} hover:${theme.text} transition-colors p-2`}>
                <Home className="w-5 h-5" />
              </button>
            </div>
            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img src={darkMode 
                ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
              } alt="ZNPCV" className="h-10 sm:h-12 w-auto" />
            </button>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <AccountButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className={`text-4xl tracking-widest mb-2 ${theme.text}`}>COMMUNITY</h1>
          <p className={`${theme.textMuted} tracking-wider flex items-center gap-2`}>
            <Users className="w-4 h-4" />
            Lernen Sie von den besten Analysen der Community
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'trending', label: 'TRENDING', icon: TrendingUp },
                { id: 'top', label: 'TOP SCORE', icon: Award },
                { id: 'recent', label: 'NEUESTE', icon: Clock }
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm tracking-wider transition-all whitespace-nowrap",
                    filter === f.id 
                      ? darkMode ? "bg-white text-black border-white" : "bg-zinc-900 text-white border-zinc-900"
                      : `${theme.border} ${theme.textSecondary} hover:${theme.text}`)}>
                  <f.icon className="w-4 h-4" />
                  {f.label}
                </button>
              ))}
            </div>

            {/* Trades */}
            <div className="space-y-4">
              {sortedTrades.map(trade => (
                <motion.div key={trade.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("border-2 rounded-2xl p-6 transition-all cursor-pointer",
                    `${theme.border} ${theme.bgSecondary} hover:border-emerald-700`)}>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border-2",
                        trade.direction === 'long' 
                          ? "bg-emerald-700/20 border-emerald-700 text-emerald-700" 
                          : "bg-rose-600/20 border-rose-600 text-rose-600")}>
                        {trade.direction === 'long' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className={`text-xl font-bold tracking-wider ${theme.text} mb-1`}>{trade.pair}</div>
                        <div className={`text-xs ${theme.textMuted} flex items-center gap-2`}>
                          <span>{trade.author_name}</span>
                          <span>•</span>
                          <span>{format(new Date(trade.created_date), 'dd.MM.yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className={cn("px-4 py-2 rounded-xl border-2 text-center",
                      trade.completion_percentage >= 85 
                        ? "bg-emerald-700/20 border-emerald-700" 
                        : "bg-amber-500/20 border-amber-500")}>
                      <div className={cn("text-2xl font-bold", 
                        trade.completion_percentage >= 85 ? "text-emerald-700" : "text-amber-500")}>
                        {trade.completion_percentage}%
                      </div>
                      <div className={`text-[10px] ${theme.textMuted} tracking-wider`}>SCORE</div>
                    </div>
                  </div>

                  {trade.notes && (
                    <p className={`${theme.textSecondary} text-sm mb-4 font-sans leading-relaxed`}>{trade.notes}</p>
                  )}

                  {/* Confluence */}
                  {trade.w_trend && trade.d_trend && trade.h4_trend && 
                   trade.w_trend === trade.d_trend && trade.d_trend === trade.h4_trend && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-700/10 border border-emerald-700/30 rounded-lg">
                      <Layers className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-700 tracking-wider">CONFLUENCE W•D•4H</span>
                    </div>
                  )}

                  {/* Screenshots */}
                  {trade.screenshots_before && trade.screenshots_before.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {trade.screenshots_before.slice(0, 3).map((url, idx) => (
                        <img key={idx} src={url} alt={`Setup ${idx + 1}`} 
                          className={`rounded-lg border ${theme.border} aspect-video object-cover`} />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-zinc-800/30">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      likeMutation.mutate(trade.id);
                    }} className="flex items-center gap-2 transition-colors group">
                      <ThumbsUp className={cn("w-5 h-5", 
                        myLikes?.some(l => l.shared_trade_id === trade.id) 
                          ? "text-emerald-700 fill-emerald-700" 
                          : `${theme.textMuted} group-hover:text-emerald-700`)} />
                      <span className={theme.textMuted}>{trade.likes || 0}</span>
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTrade(trade);
                      viewMutation.mutate(trade.id);
                    }} className="flex items-center gap-2 transition-colors group">
                      <MessageCircle className={`w-5 h-5 ${theme.textMuted} group-hover:text-emerald-700`} />
                      <span className={theme.textMuted}>{trade.comment_count || 0}</span>
                    </button>
                    <div className="flex items-center gap-2 ml-auto">
                      <Eye className={`w-4 h-4 ${theme.textMuted}`} />
                      <span className={theme.textMuted}>{trade.views || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg tracking-widest ${theme.text}`}>TOP ANALYSTEN</h3>
              </div>
              <div className="space-y-3">
                {leaderboard.map((author, idx) => (
                  <div key={idx} className={cn("flex items-center gap-3 p-3 rounded-xl transition-all",
                    darkMode ? "hover:bg-zinc-900" : "hover:bg-zinc-200")}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                      idx === 0 ? "bg-amber-500 text-white" :
                      idx === 1 ? "bg-zinc-400 text-white" :
                      idx === 2 ? "bg-amber-700 text-white" :
                      `${theme.bgSecondary} ${theme.textMuted}`)}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${theme.text} truncate`}>{author.name}</div>
                      <div className={`text-xs ${theme.textMuted}`}>{author.trades} Trades</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-700">{author.avgScore}%</div>
                      <div className={`text-[10px] ${theme.textMuted}`}>Ø Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`border-2 ${theme.border} rounded-2xl p-6 ${theme.bgSecondary}`}>
              <h3 className={`text-lg tracking-widest mb-4 ${theme.text}`}>COMMUNITY STATS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.textMuted}>Geteilte Analysen</span>
                  <span className={`font-bold ${theme.text}`}>{sharedTrades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textMuted}>Kommentare</span>
                  <span className={`font-bold ${theme.text}`}>{comments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textMuted}>Ø Score</span>
                  <span className="font-bold text-emerald-700">
                    {sharedTrades.length > 0 ? Math.round(sharedTrades.reduce((sum, t) => sum + (t.completion_percentage || 0), 0) / sharedTrades.length) : 0}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Comment Modal */}
      <AnimatePresence>
        {selectedTrade && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTrade(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className={`${darkMode ? 'bg-zinc-950' : 'bg-white'} rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
              
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className={`text-2xl font-bold tracking-wider ${theme.text} mb-1`}>{selectedTrade.pair}</h3>
                  <p className={`text-sm ${theme.textMuted}`}>{selectedTrade.author_name} • {format(new Date(selectedTrade.created_date), 'dd.MM.yyyy')}</p>
                </div>
                <button onClick={() => setSelectedTrade(null)} className={`${theme.textMuted} hover:${theme.text}`}>✕</button>
              </div>

              {/* Comments */}
              <div className="space-y-4 mb-6">
                {comments
                  .filter(c => c.shared_trade_id === selectedTrade.id)
                  .map(comment => (
                    <div key={comment.id} className={`p-4 rounded-xl ${theme.bgSecondary}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-300'} flex items-center justify-center text-sm font-bold`}>
                          {comment.author_name?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-bold ${theme.text} mb-1`}>{comment.author_name}</div>
                          <p className={`text-sm ${theme.textSecondary} font-sans`}>{comment.content}</p>
                          <div className={`text-xs ${theme.textMuted} mt-2`}>
                            {format(new Date(comment.created_date), 'dd.MM.yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Teilen Sie Ihre Gedanken..."
                  className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-300'} rounded-xl`} />
                <Button onClick={() => commentMutation.mutate({ tradeId: selectedTrade.id, content: commentText })}
                  disabled={!commentText.trim()}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-12">
                  Kommentar hinzufügen
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}