/**
 * ZNPCV Checkliste — $99 Lifetime
 * Eigenständiges, freies Checklisten-Framework.
 * Enthält KEINE proprietären Strategie-Inhalte, keine ZNPCV-Strategie-Logik, keine Presets aus der Strategie.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Check, X, ChevronDown, ChevronUp, Save, Loader2,
  FileText, BarChart3, AlertTriangle, CheckCircle2, XCircle, Copy,
  History, Trash2, Edit2, MoreHorizontal, Download, Printer,
  BookOpen, Layers, RefreshCw, Archive, Search, Filter,
  TrendingUp, TrendingDown, Minus, Star
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useLanguage, DarkModeToggle, LanguageToggle } from '@/components/LanguageContext';
import { useProductAccess } from '@/lib/useProductAccess';
import ProductPaywall from '@/components/ProductPaywall';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import AccountButton from '@/components/AccountButton';
import LivePriceTag from '@/components/checklist/LivePriceTag';

// ─── TEMPLATES ────────────────────────────────────────────────────────────────
const TEMPLATES = {
  pretrade: {
    label: 'Pre-Trade',
    icon: '🎯',
    description: 'Vollständige Vorbereitung vor dem Einstieg',
    sections: [
      {
        title: 'Markt & Kontext',
        weight: 30,
        items: [
          { label: 'Übergeordneter Trend klar definiert', type: 'check', critical: true },
          { label: 'Marktstruktur erkennbar und intakt', type: 'check' },
          { label: 'Aktuelle Handelssession geeignet', type: 'check' },
          { label: 'Wichtige Nachrichten-Events geprüft', type: 'check', critical: true },
        ],
      },
      {
        title: 'Setup & Idee',
        weight: 25,
        items: [
          { label: 'Einstiegszone klar definiert', type: 'check', critical: true },
          { label: 'Preisstruktur unterstützt die Idee', type: 'check' },
          { label: 'Bestätigungssignal vorhanden', type: 'check' },
          { label: 'Auslöser eindeutig identifiziert', type: 'check' },
        ],
      },
      {
        title: 'Risikomanagement',
        weight: 35,
        items: [
          { label: 'Stop Loss gesetzt und begründet', type: 'check', critical: true },
          { label: 'Take Profit / Ziel definiert', type: 'check', critical: true },
          { label: 'Risiko-Ertrags-Verhältnis akzeptabel', type: 'check', critical: true },
          { label: 'Positionsgröße berechnet', type: 'check', critical: true },
          { label: 'Max. Tages-Risiko nicht überschritten', type: 'check' },
        ],
      },
      {
        title: 'Abschlusskontrolle',
        weight: 10,
        items: [
          { label: 'Handelsplan vollständig und schriftlich', type: 'check' },
          { label: 'Keine emotionale Verzerrung feststellbar', type: 'check', critical: true },
          { label: 'Entscheidung ist rational begründet', type: 'check' },
        ],
      },
    ],
  },
  daytrading: {
    label: 'Day Trading',
    icon: '⚡',
    description: 'Schnelle Intraday-Entscheidungen',
    sections: [
      {
        title: 'Session-Check',
        weight: 20,
        items: [
          { label: 'Hauptsession aktiv (London / NY)', type: 'check', critical: true },
          { label: 'Keine großen Events in der nächsten Stunde', type: 'check', critical: true },
          { label: 'Liquidität ausreichend', type: 'check' },
        ],
      },
      {
        title: 'Intraday-Struktur',
        weight: 30,
        items: [
          { label: 'Intraday-Trend klar erkennbar', type: 'check', critical: true },
          { label: 'Relevante Preisniveaus markiert', type: 'check' },
          { label: 'Kein Gegenwind durch höheren Timeframe', type: 'check' },
        ],
      },
      {
        title: 'Einstieg & Timing',
        weight: 30,
        items: [
          { label: 'Einstiegspunkt konkret und eng', type: 'check', critical: true },
          { label: 'Ausstiegspunkte (SL/TP) sofort gesetzt', type: 'check', critical: true },
          { label: 'Handelsplan in unter 30 Sekunden klar', type: 'check' },
        ],
      },
      {
        title: 'Selbstkontrolle',
        weight: 20,
        items: [
          { label: 'Keine Revanche nach vorherigem Verlust', type: 'check', critical: true },
          { label: 'Tageslimit nicht überschritten', type: 'check', critical: true },
          { label: 'Kein FOMO-Trade', type: 'check', critical: true },
        ],
      },
    ],
  },
  swing: {
    label: 'Swing Trading',
    icon: '📈',
    description: 'Mehrere Tage bis Wochen haltende Positionen',
    sections: [
      {
        title: 'Makro & Übergeordnet',
        weight: 25,
        items: [
          { label: 'Wöchentlicher Trend klar definiert', type: 'check', critical: true },
          { label: 'Täglicher Trend im Einklang', type: 'check' },
          { label: 'Keine gegenläufigen Makro-Faktoren', type: 'check' },
          { label: 'Relevante Wirtschaftsdaten dieser Woche geprüft', type: 'check' },
        ],
      },
      {
        title: 'Technische Ausgangslage',
        weight: 35,
        items: [
          { label: 'Klare Unterstützungs- oder Widerstandszone', type: 'check', critical: true },
          { label: 'Preisbewegung zeigt Struktur', type: 'check' },
          { label: 'Keine unkontrollierte Volatilität', type: 'check' },
          { label: 'Setup von mindestens zwei Timeframes bestätigt', type: 'check', critical: true },
        ],
      },
      {
        title: 'Positionierung',
        weight: 25,
        items: [
          { label: 'Stop Loss unter/über strukturelles Level', type: 'check', critical: true },
          { label: 'Take Profit am nächsten signifikanten Level', type: 'check', critical: true },
          { label: 'R:R mindestens 1:2', type: 'check', critical: true },
          { label: 'Positionsgröße für mehrtägige Bewegung angepasst', type: 'check' },
        ],
      },
      {
        title: 'Geduld & Disziplin',
        weight: 15,
        items: [
          { label: 'Warte auf bestätigten Einstieg', type: 'check', critical: true },
          { label: 'Plan für Haltedauer festgelegt', type: 'check' },
          { label: 'Mentale Bereitschaft für Drawdown vorhanden', type: 'check' },
        ],
      },
    ],
  },
  riskreview: {
    label: 'Risk Review',
    icon: '🛡️',
    description: 'Risikoüberprüfung vor dem Einstieg',
    sections: [
      {
        title: 'Kapitalschutz',
        weight: 40,
        items: [
          { label: 'Maximales Verlustlimit für diesen Trade definiert', type: 'check', critical: true },
          { label: 'Monatliches Gesamtrisiko noch im Rahmen', type: 'check', critical: true },
          { label: 'Tages-Drawdown-Limit nicht erreicht', type: 'check', critical: true },
          { label: 'Offene Positionen berücksichtigt', type: 'check' },
        ],
      },
      {
        title: 'Trade-Parameter',
        weight: 35,
        items: [
          { label: 'Stop Loss technisch sinnvoll platziert', type: 'check', critical: true },
          { label: 'Lotgröße exakt berechnet', type: 'check', critical: true },
          { label: 'Potenzielle Slippage berücksichtigt', type: 'check' },
          { label: 'Korrelationen mit offenen Trades geprüft', type: 'check' },
        ],
      },
      {
        title: 'Marktbedingungen',
        weight: 15,
        items: [
          { label: 'Liquidität ausreichend', type: 'check' },
          { label: 'Keine bevorstehenden Hochrisiko-Events', type: 'check', critical: true },
          { label: 'Volatilität im normalen Bereich', type: 'check' },
        ],
      },
      {
        title: 'Mentaler Zustand',
        weight: 10,
        items: [
          { label: 'Kein Trading nach Verlusten aus Emotion', type: 'check', critical: true },
          { label: 'Verlustbereitschaft akzeptiert', type: 'check', critical: true },
        ],
      },
    ],
  },
  sessionreview: {
    label: 'Session Review',
    icon: '📋',
    description: 'Nachbetrachtung einer abgeschlossenen Session',
    sections: [
      {
        title: 'Ergebnis',
        weight: 25,
        items: [
          { label: 'Alle Trades dokumentiert', type: 'check', critical: true },
          { label: 'P&L festgehalten', type: 'check' },
          { label: 'Beste und schlechteste Entscheidung notiert', type: 'check' },
        ],
      },
      {
        title: 'Regelkonformität',
        weight: 35,
        items: [
          { label: 'Alle Trades entsprachen dem Plan', type: 'check', critical: true },
          { label: 'Kein impulsiver Trade durchgeführt', type: 'check', critical: true },
          { label: 'Stop Loss nie manuell bewegt', type: 'check', critical: true },
          { label: 'Positionsgrößen regelkonform', type: 'check' },
        ],
      },
      {
        title: 'Lernpunkte',
        weight: 25,
        items: [
          { label: 'Verbesserungspotenzial identifiziert', type: 'check' },
          { label: 'Fehler analysiert (nicht bewertet)', type: 'check' },
          { label: 'Erfolgreiche Entscheidungen festgehalten', type: 'check' },
        ],
      },
      {
        title: 'Vorbereitung Folgetag',
        weight: 15,
        items: [
          { label: 'Plan für morgen grob skizziert', type: 'check' },
          { label: 'Wichtige Levels für morgen markiert', type: 'check' },
          { label: 'Emotional neutral — kein unerledigter Druck', type: 'check', critical: true },
        ],
      },
    ],
  },
  blank: {
    label: 'Leer',
    icon: '✏️',
    description: 'Leere Vorlage — vollständig individuell',
    sections: [
      {
        title: 'Meine Kriterien',
        weight: 100,
        items: [],
      },
    ],
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function buildSections(template) {
  return template.sections.map((s, si) => ({
    id: `s_${si}_${Date.now()}`,
    title: s.title,
    weight: s.weight,
    items: s.items.map((item, ii) => ({
      id: `i_${si}_${ii}_${Date.now()}`,
      label: item.label,
      type: item.type || 'check',
      checked: false,
      critical: item.critical || false,
      note: '',
      rating: 0,
    })),
  }));
}

function computeResult(sections) {
  const allItems = sections.flatMap(s => s.items);
  const total = allItems.length;
  if (total === 0) return { score: 0, status: 'empty', criticalMissing: 0, openCount: 0 };

  const checked = allItems.filter(i => i.checked).length;
  const criticalMissing = allItems.filter(i => i.critical && !i.checked).length;
  const openCount = total - checked;
  const score = Math.round((checked / total) * 100);

  let status = 'nogo';
  if (criticalMissing > 0) status = 'nogo';
  else if (score >= 85) status = 'go';
  else if (score >= 65) status = 'caution';
  else status = 'nogo';

  return { score, status, criticalMissing, openCount };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FreeChecklistPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const { loading: accessLoading, hasChecklistAccess, isAuthenticated } = useProductAccess();

  const [view, setView] = useState('history'); // 'history' | 'editor' | 'select_template'
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Editor state
  const [editingId, setEditingId] = useState(null);
  const [instrument, setInstrument] = useState('');
  const [direction, setDirection] = useState('');
  const [tradeDate, setTradeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sections, setSections] = useState([]);
  const [notes, setNotes] = useState('');
  const [learnings, setLearnings] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [collapsed, setCollapsed] = useState({});

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    borderCard: darkMode ? 'border-zinc-800' : 'border-zinc-300',
    input: darkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400',
    navBg: darkMode ? 'bg-zinc-900/50' : 'bg-zinc-50',
  };

  // ── Load history ──
  useEffect(() => {
    if (!accessLoading && isAuthenticated && hasChecklistAccess) {
      loadHistory();
    }
  }, [accessLoading, isAuthenticated, hasChecklistAccess]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const all = await base44.entities.TradeChecklist.list('-created_date', 50);
      // Only free-checklist entries: those with free_checklist flag or no strategy fields set
      const entries = all.filter(e => !e.deleted && e.free_checklist === true);
      setHistory(entries);
    } catch { setHistory([]); }
    finally { setHistoryLoading(false); }
  };

  // ── Start new checklist ──
  const startNew = (templateKey) => {
    const tpl = TEMPLATES[templateKey];
    setSections(buildSections(tpl));
    setInstrument('');
    setDirection('');
    setTradeDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    setLearnings('');
    setEditingId(null);
    setActiveSection(null);
    setCollapsed({});
    setSaveError(null);
    setView('editor');
  };

  // ── Open existing ──
  const openEntry = (entry) => {
    const stored = JSON.parse(entry.notes_json || '{}');
    setSections(stored.sections || []);
    setInstrument(entry.pair || '');
    setDirection(entry.direction || '');
    setTradeDate(entry.trade_date || format(new Date(), 'yyyy-MM-dd'));
    setNotes(stored.notes || '');
    setLearnings(stored.learnings || '');
    setEditingId(entry.id);
    setCollapsed({});
    setSaveError(null);
    setView('editor');
  };

  // ── Duplicate ──
  const duplicateEntry = async (entry) => {
    try {
      const stored = JSON.parse(entry.notes_json || '{}');
      const newSections = (stored.sections || []).map(s => ({
        ...s,
        id: `s_dup_${Date.now()}_${Math.random()}`,
        items: s.items.map(i => ({ ...i, id: `i_dup_${Date.now()}_${Math.random()}`, checked: false })),
      }));
      await base44.entities.TradeChecklist.create({
        pair: entry.pair,
        direction: entry.direction,
        trade_date: format(new Date(), 'yyyy-MM-dd'),
        status: 'in_progress',
        completion_percentage: 0,
        free_checklist: true,
        notes_json: JSON.stringify({ sections: newSections, notes: '', learnings: '' }),
      });
      await loadHistory();
    } catch {}
  };

  // ── Soft delete ──
  const deleteEntry = async (id) => {
    try {
      await base44.entities.TradeChecklist.update(id, { deleted: true, deleted_date: new Date().toISOString() });
      setHistory(prev => prev.filter(e => e.id !== id));
    } catch {}
  };

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const result = computeResult(sections);
      const payload = {
        pair: instrument.toUpperCase().trim() || 'N/A',
        direction: direction || undefined,
        trade_date: tradeDate,
        status: result.status === 'go' ? 'ready_to_trade' : 'in_progress',
        completion_percentage: result.score,
        free_checklist: true,
        notes_json: JSON.stringify({ sections, notes, learnings }),
      };
      if (editingId) {
        await base44.entities.TradeChecklist.update(editingId, payload);
      } else {
        const created = await base44.entities.TradeChecklist.create(payload);
        setEditingId(created.id);
      }
      await loadHistory();
      setSaveError(null);
    } catch (e) {
      setSaveError('Speichern fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setSaving(false);
    }
  };

  // ── Section helpers ──
  const toggleItem = (sectionId, itemId) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) }
        : s
    ));
  };

  const addSection = () => {
    const id = `s_new_${Date.now()}`;
    setSections(prev => [...prev, { id, title: 'Neue Sektion', weight: 20, items: [] }]);
    setActiveSection(id);
  };

  const updateSectionTitle = (id, title) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  };

  const removeSection = (id) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const addItem = (sectionId) => {
    const id = `i_new_${Date.now()}`;
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: [...s.items, { id, label: '', type: 'check', checked: false, critical: false, note: '', rating: 0, isEditing: true }] }
        : s
    ));
  };

  const updateItem = (sectionId, itemId, updates) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
        : s
    ));
  };

  const removeItem = (sectionId, itemId) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
    ));
  };

  const toggleCollapse = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Access guard (after all hooks) ──
  if (accessLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) { base44.auth.redirectToLogin(); return null; }
  if (!hasChecklistAccess) return <ProductPaywall darkMode={darkMode} mode="checklist" />;

  const result = computeResult(sections);

  // ── Filter history ──
  const filteredHistory = history.filter(e => {
    const matchSearch = !searchQuery || (e.pair || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'all'
      || (filterStatus === 'go' && e.status === 'ready_to_trade')
      || (filterStatus === 'nogo' && e.status === 'in_progress');
    return matchSearch && matchFilter;
  });

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>

      {/* HEADER */}
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3 relative">
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button
                onClick={() => view === 'editor' || view === 'select_template' ? setView('history') : navigate(createPageUrl('Home'))}
                className={`p-2 rounded-lg border-2 transition-all ${darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400'}`}
              >
                <ArrowLeft className={`w-4 h-4 ${theme.text}`} />
              </button>
            </div>

            <button onClick={() => navigate(createPageUrl('Home'))} className="absolute left-1/2 -translate-x-1/2">
              <img
                src={darkMode
                  ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
                  : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
                }
                alt="ZNPCV"
                className="h-8 sm:h-10 md:h-12 w-auto hover:opacity-80 transition-opacity cursor-pointer"
              />
            </button>

            <div className="flex items-center gap-2">
              <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] tracking-widest font-bold ${theme.textMuted} ${theme.border}`}>
                <Layers className="w-3 h-3" />
                CHECKLISTE
              </div>
              <LanguageToggle />
              <AccountButton />
            </div>
          </div>
        </div>
        {saveError && (
          <div className="bg-rose-600 text-white text-xs font-bold tracking-wider text-center py-1.5 px-4">
            {saveError}
          </div>
        )}
      </header>

      {/* ── VIEW: TEMPLATE SELECTION ── */}
      <AnimatePresence mode="wait">
        {view === 'select_template' && (
          <motion.div key="tpl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
            <div className="text-center mb-8">
              <h1 className={`text-xl sm:text-2xl tracking-widest font-light mb-2 ${theme.text}`}>VORLAGE WÄHLEN</h1>
              <p className={`text-xs sm:text-sm font-sans ${theme.textMuted}`}>
                Starte mit einer Vorlage oder baue deine Checkliste von Grund auf.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => startNew(key)}
                  className={cn(
                    'text-left p-4 sm:p-5 rounded-2xl border-2 transition-all group hover:border-emerald-600',
                    darkMode ? 'border-zinc-800 bg-zinc-900 hover:bg-zinc-900' : 'border-zinc-200 bg-zinc-50 hover:bg-white'
                  )}
                >
                  <div className="text-2xl mb-3">{tpl.icon}</div>
                  <div className={`text-sm tracking-widest font-bold mb-1 group-hover:text-emerald-600 transition-colors ${theme.text}`}>{tpl.label.toUpperCase()}</div>
                  <div className={`text-[11px] font-sans leading-relaxed ${theme.textMuted}`}>{tpl.description}</div>
                  {key !== 'blank' && (
                    <div className={`mt-3 text-[10px] tracking-wider ${theme.textMuted}`}>
                      {tpl.sections.reduce((a, s) => a + s.items.length, 0)} Kriterien · {tpl.sections.length} Sektionen
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── VIEW: HISTORY ── */}
        {view === 'history' && (
          <motion.div key="hist" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">

            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h1 className={`text-xl sm:text-2xl tracking-widest font-light ${theme.text}`}>MEINE CHECKLISTEN</h1>
                <p className={`text-[11px] font-sans ${theme.textMuted} mt-0.5`}>Persönliches Checklisten-Framework</p>
              </div>
              <button
                onClick={() => setView('select_template')}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold tracking-widest transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">NEUE CHECKLISTE</span>
                <span className="sm:hidden">NEU</span>
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-2 mb-4">
              <div className={`flex-1 flex items-center gap-2 px-3 py-2 border-2 rounded-xl ${theme.borderCard} ${darkMode ? 'bg-zinc-900' : 'bg-zinc-50'}`}>
                <Search className={`w-3.5 h-3.5 flex-shrink-0 ${theme.textMuted}`} />
                <input
                  type="text"
                  placeholder="Instrument suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`flex-1 bg-transparent text-xs font-sans outline-none ${theme.text} placeholder:${theme.textMuted}`}
                />
              </div>
              <div className="flex gap-1.5">
                {[
                  { v: 'all', label: 'ALLE' },
                  { v: 'go', label: 'GO' },
                  { v: 'nogo', label: 'NO GO' },
                ].map(f => (
                  <button
                    key={f.v}
                    onClick={() => setFilterStatus(f.v)}
                    className={cn(
                      'px-2.5 py-2 rounded-xl border-2 text-[10px] font-bold tracking-wider transition-all',
                      filterStatus === f.v
                        ? darkMode ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900'
                        : `${theme.borderCard} ${theme.textMuted}`
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className={`text-center py-16 border-2 border-dashed rounded-2xl ${theme.border}`}>
                <BookOpen className={`w-10 h-10 mx-auto mb-4 ${theme.textMuted}`} />
                <p className={`text-sm font-sans ${theme.textMuted} mb-4`}>
                  {history.length === 0 ? 'Noch keine Checklisten erstellt.' : 'Keine Ergebnisse für diese Filter.'}
                </p>
                {history.length === 0 && (
                  <button
                    onClick={() => setView('select_template')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold tracking-widest transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    ERSTE CHECKLISTE ERSTELLEN
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredHistory.map((entry) => {
                  const stored = JSON.parse(entry.notes_json || '{}');
                  const isGo = entry.status === 'ready_to_trade';
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'border-2 rounded-xl overflow-hidden group',
                        isGo
                          ? darkMode ? 'border-emerald-700/40' : 'border-emerald-600/30'
                          : `${theme.border}`
                      )}
                    >
                      <div
                        className={cn(
                          'p-4 cursor-pointer transition-colors',
                          darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-50'
                        )}
                        onClick={() => openEntry(entry)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border-2',
                              isGo
                                ? 'bg-emerald-700 border-emerald-700 text-white'
                                : darkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400' : 'border-zinc-300 bg-zinc-100 text-zinc-500'
                            )}>
                              {isGo ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <div className={`text-sm font-bold tracking-wider ${theme.text} truncate`}>
                                {entry.pair || 'OHNE INSTRUMENT'}
                              </div>
                              <div className={`text-[10px] font-sans ${theme.textMuted} flex items-center gap-2`}>
                                <span>{entry.trade_date || format(new Date(entry.created_date), 'yyyy-MM-dd')}</span>
                                {entry.direction && (
                                  <>
                                    <span>·</span>
                                    <span className={entry.direction === 'long' ? 'text-emerald-600' : 'text-rose-500'}>
                                      {entry.direction === 'long' ? '↑ LONG' : '↓ SHORT'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className={cn(
                              'px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider',
                              isGo
                                ? 'bg-emerald-700 text-white'
                                : darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'
                            )}>
                              {isGo ? 'GO' : `${entry.completion_percentage || 0}%`}
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); duplicateEntry(entry); }}
                              className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${darkMode ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-zinc-200 text-zinc-400'}`}
                              title="Duplizieren"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                              className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${darkMode ? 'hover:bg-zinc-800 text-rose-600' : 'hover:bg-zinc-200 text-rose-500'}`}
                              title="Löschen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── VIEW: EDITOR ── */}
        {view === 'editor' && (
          <motion.div key="editor" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Score Bar */}
            <div className={`${theme.navBg} border-b ${theme.border}`}>
              <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all',
                    result.status === 'go'
                      ? 'bg-emerald-700 border-emerald-700 text-white'
                      : result.status === 'caution'
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : result.status === 'empty'
                      ? darkMode ? 'border-zinc-700 text-zinc-500' : 'border-zinc-300 text-zinc-400'
                      : 'bg-rose-600 border-rose-600 text-white'
                  )}>
                    {result.status === 'go' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                      result.status === 'caution' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                      result.status === 'empty' ? <Minus className="w-3.5 h-3.5" /> :
                      <XCircle className="w-3.5 h-3.5" />}
                    <span>{result.status === 'go' ? 'GO' : result.status === 'caution' ? 'PRÜFEN' : result.status === 'empty' ? '—' : 'NO GO'}</span>
                  </div>
                  <span className={`text-sm font-bold ${theme.text}`}>{result.score}%</span>
                  {result.criticalMissing > 0 && (
                    <span className="text-[10px] text-rose-500 font-sans">
                      {result.criticalMissing} kritisch offen
                    </span>
                  )}
                </div>
                <div className={`flex-1 h-1.5 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'} max-w-xs overflow-hidden`}>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      result.status === 'go' ? 'bg-emerald-700' : result.status === 'caution' ? 'bg-amber-500' : 'bg-rose-600'
                    )}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView('select_template')}
                    className={`p-2 rounded-lg border ${theme.border} text-[10px] font-bold tracking-wider transition-all ${theme.textMuted} hover:${theme.text} flex items-center gap-1.5`}
                    title="Neue Vorlage laden"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold tracking-widest transition-all border-2',
                      'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700',
                      saving && 'opacity-60 cursor-not-allowed'
                    )}
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{saving ? 'SPEICHERN...' : 'SPEICHERN'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-6 space-y-4">

              {/* Meta */}
              <div className={`border-2 ${theme.borderCard} rounded-xl p-4 space-y-3`}>
                <h3 className={`text-[10px] tracking-widest font-bold ${theme.textMuted} flex items-center gap-2`}>
                  <FileText className="w-3.5 h-3.5" /> DETAILS
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className={`text-[10px] tracking-wider ${theme.textMuted} mb-1 block`}>INSTRUMENT</label>
                    <input
                      type="text"
                      value={instrument}
                      onChange={(e) => setInstrument(e.target.value.slice(0, 20))}
                      placeholder="z. B. EUR/USD"
                      className={`w-full h-9 px-3 rounded-lg border-2 text-sm font-mono tracking-wider outline-none ${theme.input}`}
                    />
                    <LivePriceTag instrument={instrument} darkMode={darkMode} />
                  </div>
                  <div>
                    <label className={`text-[10px] tracking-wider ${theme.textMuted} mb-1 block`}>DATUM</label>
                    <input
                      type="date"
                      value={tradeDate}
                      onChange={(e) => setTradeDate(e.target.value)}
                      className={`w-full h-9 px-3 rounded-lg border-2 text-sm font-sans outline-none ${theme.input}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`text-[10px] tracking-wider ${theme.textMuted} mb-1 block`}>RICHTUNG</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { v: 'long', label: 'LONG ↑', color: 'emerald' },
                        { v: 'short', label: 'SHORT ↓', color: 'rose' },
                        { v: '', label: 'KEINE', color: 'neutral' },
                      ].map(d => (
                        <button
                          key={d.v}
                          onClick={() => setDirection(d.v)}
                          className={cn(
                            'h-9 rounded-lg border-2 text-[10px] font-bold tracking-wider transition-all',
                            direction === d.v
                              ? d.color === 'emerald' ? 'bg-emerald-700 border-emerald-700 text-white'
                                : d.color === 'rose' ? 'bg-rose-600 border-rose-600 text-white'
                                : darkMode ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-zinc-300 border-zinc-400 text-zinc-900'
                              : `${theme.borderCard} ${theme.textMuted}`
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                {sections.map((section) => {
                  const sectionChecked = section.items.filter(i => i.checked).length;
                  const sectionTotal = section.items.length;
                  const sectionPct = sectionTotal > 0 ? Math.round((sectionChecked / sectionTotal) * 100) : 0;
                  const isCollapsed = collapsed[section.id];

                  return (
                    <div key={section.id} className={`border-2 rounded-xl overflow-hidden ${theme.borderCard}`}>
                      {/* Section Header */}
                      <div
                        className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${darkMode ? 'bg-zinc-900/50 hover:bg-zinc-900' : 'bg-zinc-50 hover:bg-zinc-100'}`}
                        onClick={() => toggleCollapse(section.id)}
                      >
                        <div className={`w-1.5 h-5 rounded-full flex-shrink-0 ${sectionPct === 100 ? 'bg-emerald-700' : 'bg-zinc-500'}`} />
                        {activeSection === section.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                            onBlur={() => setActiveSection(null)}
                            onClick={(e) => e.stopPropagation()}
                            className={`flex-1 bg-transparent border-b ${theme.border} text-sm font-bold tracking-wider outline-none ${theme.text}`}
                          />
                        ) : (
                          <span
                            className={`flex-1 text-sm tracking-wider font-bold ${theme.text}`}
                            onDoubleClick={(e) => { e.stopPropagation(); setActiveSection(section.id); }}
                          >
                            {section.title}
                          </span>
                        )}
                        <span className={`text-[10px] font-sans ${theme.textMuted}`}>{sectionChecked}/{sectionTotal}</span>
                        <div className={`w-12 h-1 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'} overflow-hidden flex-shrink-0`}>
                          <div className={`h-full rounded-full transition-all ${sectionPct === 100 ? 'bg-emerald-700' : 'bg-zinc-500'}`} style={{ width: `${sectionPct}%` }} />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                          className={`p-1 rounded flex-shrink-0 ${darkMode ? 'hover:bg-zinc-700 text-zinc-600' : 'hover:bg-zinc-200 text-zinc-400'}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {isCollapsed ? <ChevronDown className={`w-4 h-4 ${theme.textMuted} flex-shrink-0`} /> : <ChevronUp className={`w-4 h-4 ${theme.textMuted} flex-shrink-0`} />}
                      </div>

                      {/* Items */}
                      {!isCollapsed && (
                        <div className={`p-3 space-y-1.5 ${darkMode ? 'bg-black/20' : 'bg-white'}`}>
                          {section.items.map((item) => (
                            <div key={item.id} className="flex items-start gap-2.5 group/item">
                              <button
                                onClick={() => toggleItem(section.id, item.id)}
                                className={cn(
                                  'w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                                  item.checked
                                    ? 'bg-emerald-700 border-emerald-700'
                                    : item.critical
                                    ? darkMode ? 'border-amber-600 hover:border-amber-500' : 'border-amber-500 hover:border-amber-400'
                                    : darkMode ? 'border-zinc-600 hover:border-zinc-500' : 'border-zinc-300 hover:border-zinc-400'
                                )}
                              >
                                {item.checked && <Check className="w-3 h-3 text-white" />}
                              </button>

                              <div className="flex-1 min-w-0">
                                {item.isEditing ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    defaultValue={item.label}
                                    placeholder="Kriterium beschreiben..."
                                    onBlur={(e) => updateItem(section.id, item.id, { label: e.target.value, isEditing: false })}
                                    onKeyDown={(e) => { if (e.key === 'Enter') updateItem(section.id, item.id, { label: e.target.value, isEditing: false }); }}
                                    className={`w-full bg-transparent border-b ${theme.border} text-sm font-sans outline-none pb-0.5 ${theme.text}`}
                                  />
                                ) : (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={cn('text-sm font-sans', theme.text, item.checked && 'line-through opacity-40')}
                                      onDoubleClick={() => updateItem(section.id, item.id, { isEditing: true })}
                                    >
                                      {item.label || <span className={theme.textMuted}>Kriterium eingeben…</span>}
                                    </span>
                                    {item.critical && (
                                      <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${darkMode ? 'bg-amber-600/20 text-amber-500' : 'bg-amber-100 text-amber-700'}`}>
                                        KRITISCH
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                  onClick={() => updateItem(section.id, item.id, { critical: !item.critical })}
                                  className={`p-1 rounded transition-colors ${item.critical ? 'text-amber-500' : theme.textMuted}`}
                                  title="Als kritisch markieren"
                                >
                                  <Star className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => updateItem(section.id, item.id, { isEditing: true })}
                                  className={`p-1 rounded ${darkMode ? 'hover:bg-zinc-700 text-zinc-500' : 'hover:bg-zinc-100 text-zinc-400'}`}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeItem(section.id, item.id)}
                                  className={`p-1 rounded ${darkMode ? 'hover:bg-zinc-700 text-zinc-600' : 'hover:bg-zinc-100 text-zinc-400'}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={() => addItem(section.id)}
                            className={`flex items-center gap-2 text-[11px] font-sans mt-2 transition-colors ${theme.textMuted} hover:text-emerald-600`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Kriterium hinzufügen
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Section */}
              <button
                onClick={addSection}
                className={cn(
                  'w-full h-11 rounded-xl border-2 border-dashed text-[11px] font-bold tracking-wider transition-all flex items-center justify-center gap-2',
                  darkMode
                    ? 'border-zinc-700 text-zinc-500 hover:border-emerald-700 hover:text-emerald-700'
                    : 'border-zinc-300 text-zinc-400 hover:border-emerald-700 hover:text-emerald-700'
                )}
              >
                <Plus className="w-4 h-4" />
                SEKTION HINZUFÜGEN
              </button>

              {/* GO / NO-GO Card */}
              <div className={cn(
                'border-2 rounded-xl p-5 text-center',
                result.status === 'go'
                  ? 'bg-emerald-700 border-emerald-700'
                  : result.status === 'caution'
                  ? 'bg-amber-500 border-amber-500'
                  : result.status === 'empty'
                  ? `${theme.borderCard} ${darkMode ? 'bg-zinc-900' : 'bg-zinc-50'}`
                  : 'bg-rose-600 border-rose-600'
              )}>
                <div className={cn('text-4xl font-light tracking-widest mb-1',
                  result.status === 'empty' ? theme.textMuted : 'text-white'
                )}>
                  {result.status === 'go' ? 'GO' : result.status === 'caution' ? 'PRÜFEN' : result.status === 'empty' ? '—' : 'NO GO'}
                </div>
                <div className={cn('text-lg font-light mb-2', result.status === 'empty' ? theme.textMuted : 'text-white/80')}>
                  {result.score}% · {result.openCount} offen
                </div>
                {result.criticalMissing > 0 && (
                  <div className="text-xs text-white/80 font-sans">
                    {result.criticalMissing} kritische Kriterien nicht erfüllt
                  </div>
                )}
                {result.status === 'go' && (
                  <div className="text-xs text-white/80 font-sans mt-1">
                    Alle Kriterien erfüllt — Entscheidung liegt bei dir.
                  </div>
                )}
              </div>

              {/* Notes & Learnings */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className={`border-2 ${theme.borderCard} rounded-xl p-4`}>
                  <label className={`text-[10px] tracking-wider font-bold ${theme.textMuted} mb-2 block`}>NOTIZEN</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 2000))}
                    placeholder="Beobachtungen, Begründungen, Kontext..."
                    rows={5}
                    className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-sans outline-none resize-none transition-all ${theme.input}`}
                  />
                  <div className={`text-[10px] font-sans ${theme.textMuted} text-right mt-1`}>{notes.length}/2000</div>
                </div>
                <div className={`border-2 ${theme.borderCard} rounded-xl p-4`}>
                  <label className={`text-[10px] tracking-wider font-bold ${theme.textMuted} mb-2 block`}>LEARNINGS</label>
                  <textarea
                    value={learnings}
                    onChange={(e) => setLearnings(e.target.value.slice(0, 2000))}
                    placeholder="Was habe ich gelernt? Was würde ich anders machen?"
                    rows={5}
                    className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-sans outline-none resize-none transition-all ${theme.input}`}
                  />
                  <div className={`text-[10px] font-sans ${theme.textMuted} text-right mt-1`}>{learnings.length}/2000</div>
                </div>
              </div>

              {/* Save + Back */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setView('history')}
                  className={cn(
                    'h-12 rounded-xl border-2 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2',
                    darkMode ? 'border-zinc-700 text-zinc-400 hover:border-zinc-600' : 'border-zinc-300 text-zinc-500 hover:border-zinc-400'
                  )}
                >
                  <History className="w-4 h-4" />
                  VERLAUF
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    'h-12 rounded-xl border-2 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2',
                    'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700',
                    saving && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'SPEICHERN...' : 'SPEICHERN'}
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}