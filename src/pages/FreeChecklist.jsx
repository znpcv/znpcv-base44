/**
 * ZNPCV Checkliste — $99 Lifetime
 * Eigenständiges, freies Checklisten-Framework.
 * Enthält KEINE proprietären Strategie-Inhalte, keine ZNPCV-Strategie-Logik, keine Presets aus der Strategie.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Check, X, ChevronDown, ChevronUp, Save, Loader2,
  FileText, BarChart3, AlertTriangle, CheckCircle2, XCircle,
  Copy, History, Trash2, Edit2, Download, Printer,
  BookOpen, Layers, RefreshCw, Search, Shield,
  TrendingUp, TrendingDown, Minus, AlertOctagon,
  ClipboardCheck, Target, DollarSign, Brain, Archive,
  ChevronRight, Eye, Slash
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

// ─── DECISION STATUS OPTIONS ──────────────────────────────────────────────────
const DECISION_STATUS = [
  { value: 'go',         label: 'GO',              color: 'emerald' },
  { value: 'nogo',       label: 'NO GO',           color: 'rose' },
  { value: 'observe',    label: 'BEOBACHTEN',      color: 'amber' },
  { value: 'not_ready',  label: 'NOCH NICHT REIF', color: 'zinc' },
  { value: 'rejected',   label: 'VERWORFEN',       color: 'slate' },
  { value: 'review',     label: 'REVIEW NÖTIG',    color: 'blue' },
];

// ─── TEMPLATES ────────────────────────────────────────────────────────────────
const TEMPLATES = {
  pretrade: {
    label: 'Pre-Trade',
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
        title: 'Ausschlussgründe',
        weight: 0,
        isExclusion: true,
        items: [
          { label: 'Hochrisiko-Event in der nächsten Stunde', type: 'exclusion', critical: true },
          { label: 'Widersprüchliche Signale über Timeframes', type: 'exclusion', critical: true },
          { label: 'Emotionale Verzerrung feststellbar', type: 'exclusion', critical: true },
        ],
      },
      {
        title: 'Abschlusskontrolle',
        weight: 10,
        items: [
          { label: 'Handelsplan vollständig und schriftlich', type: 'check' },
          { label: 'Entscheidung ist rational begründet', type: 'check' },
        ],
      },
    ],
  },
  daytrading: {
    label: 'Day Trading',
    description: 'Schnelle Intraday-Entscheidungen strukturiert bewerten',
    sections: [
      {
        title: 'Session-Check',
        weight: 20,
        items: [
          { label: 'Hauptsession aktiv', type: 'check', critical: true },
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
          { label: 'Ausstiegspunkte sofort definiert', type: 'check', critical: true },
          { label: 'Handelsplan in unter 30 Sekunden klar', type: 'check' },
        ],
      },
      {
        title: 'Ausschlussgründe',
        weight: 0,
        isExclusion: true,
        items: [
          { label: 'Revanche nach vorherigem Verlust', type: 'exclusion', critical: true },
          { label: 'Tageslimit überschritten', type: 'exclusion', critical: true },
          { label: 'FOMO als Auslöser erkennbar', type: 'exclusion', critical: true },
        ],
      },
      {
        title: 'Selbstkontrolle',
        weight: 20,
        items: [
          { label: 'Mentaler Zustand stabil', type: 'check', critical: true },
          { label: 'Keine offenen Verlustemotionen', type: 'check' },
        ],
      },
    ],
  },
  swing: {
    label: 'Swing Trading',
    description: 'Mehrere Tage bis Wochen haltende Positionen',
    sections: [
      {
        title: 'Makro & Kontext',
        weight: 25,
        items: [
          { label: 'Übergeordneter Trend klar definiert', type: 'check', critical: true },
          { label: 'Kurzfristiger Trend im Einklang', type: 'check' },
          { label: 'Relevante Wirtschaftsdaten dieser Woche geprüft', type: 'check' },
        ],
      },
      {
        title: 'Technische Ausgangslage',
        weight: 35,
        items: [
          { label: 'Klare Unterstützungs- oder Widerstandszone', type: 'check', critical: true },
          { label: 'Preisbewegung zeigt klare Struktur', type: 'check' },
          { label: 'Keine unkontrollierte Volatilität', type: 'check' },
          { label: 'Setup von mindestens zwei Zeitebenen bestätigt', type: 'check', critical: true },
        ],
      },
      {
        title: 'Positionierung',
        weight: 25,
        items: [
          { label: 'Stop Loss unter/über strukturelles Level', type: 'check', critical: true },
          { label: 'Take Profit am nächsten relevanten Level', type: 'check', critical: true },
          { label: 'Risiko-Ertrags-Verhältnis mindestens 1:2', type: 'check', critical: true },
          { label: 'Positionsgröße für mehrtägige Bewegung angepasst', type: 'check' },
        ],
      },
      {
        title: 'Ausschlussgründe',
        weight: 0,
        isExclusion: true,
        items: [
          { label: 'Gegenläufige Makro-Faktoren erkennbar', type: 'exclusion', critical: true },
          { label: 'Setup nicht von zweitem Timeframe bestätigt', type: 'exclusion', critical: true },
        ],
      },
      {
        title: 'Disziplin & Plan',
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
    description: 'Systematische Risikoüberprüfung vor dem Einstieg',
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
          { label: 'Positionsgröße exakt berechnet', type: 'check', critical: true },
          { label: 'Potenzielle Slippage berücksichtigt', type: 'check' },
          { label: 'Korrelationen mit offenen Positionen geprüft', type: 'check' },
        ],
      },
      {
        title: 'Ausschlussgründe',
        weight: 0,
        isExclusion: true,
        items: [
          { label: 'Bevorstehende Hochrisiko-Events innerhalb 1h', type: 'exclusion', critical: true },
          { label: 'Drawdown-Limit bereits erreicht', type: 'exclusion', critical: true },
          { label: 'Überhebelte Gesamtposition erkennbar', type: 'exclusion', critical: true },
        ],
      },
      {
        title: 'Mentaler Zustand',
        weight: 10,
        items: [
          { label: 'Kein Trading aus emotionalem Druck', type: 'check', critical: true },
          { label: 'Verlustbereitschaft akzeptiert', type: 'check', critical: true },
        ],
      },
    ],
  },
  sessionreview: {
    label: 'Session Review',
    description: 'Strukturierte Nachbetrachtung einer abgeschlossenen Session',
    sections: [
      {
        title: 'Ergebnis',
        weight: 25,
        items: [
          { label: 'Alle Positionen dokumentiert', type: 'check', critical: true },
          { label: 'P&L festgehalten', type: 'check' },
          { label: 'Beste und schlechteste Entscheidung notiert', type: 'check' },
        ],
      },
      {
        title: 'Regelkonformität',
        weight: 35,
        items: [
          { label: 'Alle Entscheidungen entsprachen dem Plan', type: 'check', critical: true },
          { label: 'Kein impulsiver Einstieg durchgeführt', type: 'check', critical: true },
          { label: 'Stop Loss nie manuell ohne Begründung bewegt', type: 'check', critical: true },
          { label: 'Positionsgrößen regelkonform', type: 'check' },
        ],
      },
      {
        title: 'Lernpunkte',
        weight: 25,
        items: [
          { label: 'Verbesserungspotenzial identifiziert', type: 'check' },
          { label: 'Fehler analysiert', type: 'check' },
          { label: 'Erfolgreiche Entscheidungen festgehalten', type: 'check' },
        ],
      },
      {
        title: 'Vorbereitung Folgetag',
        weight: 15,
        items: [
          { label: 'Plan für morgen grob skizziert', type: 'check' },
          { label: 'Emotional neutral abgeschlossen', type: 'check', critical: true },
        ],
      },
    ],
  },
  blank: {
    label: 'Leer',
    description: 'Leere Vorlage — vollständig individuell konfigurierbar',
    sections: [
      {
        title: 'Kriterien',
        weight: 70,
        items: [],
      },
      {
        title: 'Ausschlussgründe',
        weight: 0,
        isExclusion: true,
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
    isExclusion: s.isExclusion || false,
    items: s.items.map((item, ii) => ({
      id: `i_${si}_${ii}_${Date.now()}`,
      label: item.label,
      type: item.type || 'check',
      checked: false,
      critical: item.critical || false,
      note: '',
    })),
  }));
}

function computeResult(sections) {
  const normalSections = sections.filter(s => !s.isExclusion);
  const exclusionSections = sections.filter(s => s.isExclusion);

  const allItems = normalSections.flatMap(s => s.items);
  const total = allItems.length;
  if (total === 0) return { score: 0, status: 'empty', criticalMissing: 0, openCount: 0, activeExclusions: 0 };

  const checked = allItems.filter(i => i.checked).length;
  const criticalMissing = allItems.filter(i => i.critical && !i.checked).length;
  const openCount = total - checked;
  const score = Math.round((checked / total) * 100);

  // Active exclusions = checked exclusion items (= red flags present)
  const activeExclusions = exclusionSections.flatMap(s => s.items).filter(i => i.checked).length;

  let status = 'nogo';
  if (activeExclusions > 0) status = 'nogo';
  else if (criticalMissing > 0) status = 'nogo';
  else if (score >= 85) status = 'go';
  else if (score >= 65) status = 'caution';
  else status = 'nogo';

  return { score, status, criticalMissing, openCount, activeExclusions };
}

function getStatusColor(value, darkMode) {
  switch (value) {
    case 'go':        return 'bg-emerald-700 border-emerald-700 text-white';
    case 'nogo':      return 'bg-rose-600 border-rose-600 text-white';
    case 'observe':   return 'bg-amber-500 border-amber-500 text-white';
    case 'not_ready': return darkMode ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-zinc-200 border-zinc-300 text-zinc-700';
    case 'rejected':  return darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-300 border-slate-400 text-slate-800';
    case 'review':    return 'bg-blue-600 border-blue-600 text-white';
    default:          return darkMode ? 'border-zinc-700 text-zinc-500' : 'border-zinc-300 text-zinc-400';
  }
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
  const [decisionStatus, setDecisionStatus] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [riskNotes, setRiskNotes] = useState('');
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

  useEffect(() => {
    if (!accessLoading && isAuthenticated && hasChecklistAccess) {
      loadHistory();
    }
  }, [accessLoading, isAuthenticated, hasChecklistAccess]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const all = await base44.entities.TradeChecklist.list('-created_date', 50);
      const entries = all.filter(e => !e.deleted && e.free_checklist === true);
      setHistory(entries);
    } catch { setHistory([]); }
    finally { setHistoryLoading(false); }
  };

  const startNew = (templateKey) => {
    const tpl = TEMPLATES[templateKey];
    setSections(buildSections(tpl));
    setInstrument('');
    setDirection('');
    setTradeDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    setLearnings('');
    setDecisionStatus('');
    setDecisionReason('');
    setRiskNotes('');
    setEditingId(null);
    setActiveSection(null);
    setCollapsed({});
    setSaveError(null);
    setView('editor');
  };

  const openEntry = (entry) => {
    const stored = JSON.parse(entry.notes_json || '{}');
    setSections(stored.sections || []);
    setInstrument(entry.pair || '');
    setDirection(entry.direction || '');
    setTradeDate(entry.trade_date || format(new Date(), 'yyyy-MM-dd'));
    setNotes(stored.notes || '');
    setLearnings(stored.learnings || '');
    setDecisionStatus(stored.decisionStatus || '');
    setDecisionReason(stored.decisionReason || '');
    setRiskNotes(stored.riskNotes || '');
    setEditingId(entry.id);
    setCollapsed({});
    setSaveError(null);
    setView('editor');
  };

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
        notes_json: JSON.stringify({ sections: newSections, notes: '', learnings: '', decisionStatus: '', decisionReason: '', riskNotes: '' }),
      });
      await loadHistory();
    } catch {}
  };

  const deleteEntry = async (id) => {
    try {
      await base44.entities.TradeChecklist.update(id, { deleted: true, deleted_date: new Date().toISOString() });
      setHistory(prev => prev.filter(e => e.id !== id));
    } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const result = computeResult(sections);
      const finalStatus = decisionStatus || (result.status === 'go' ? 'go' : result.status === 'caution' ? 'observe' : 'nogo');
      const payload = {
        pair: instrument.toUpperCase().trim() || 'N/A',
        direction: direction || undefined,
        trade_date: tradeDate,
        status: finalStatus === 'go' ? 'ready_to_trade' : 'in_progress',
        completion_percentage: result.score,
        free_checklist: true,
        notes_json: JSON.stringify({ sections, notes, learnings, decisionStatus, decisionReason, riskNotes }),
      };
      if (editingId) {
        await base44.entities.TradeChecklist.update(editingId, payload);
      } else {
        const created = await base44.entities.TradeChecklist.create(payload);
        setEditingId(created.id);
      }
      await loadHistory();
      setSaveError(null);
    } catch {
      setSaveError('Speichern fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = (sectionId, itemId) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) }
        : s
    ));
  };

  const addSection = (isExclusion = false) => {
    const id = `s_new_${Date.now()}`;
    setSections(prev => [...prev, {
      id,
      title: isExclusion ? 'Ausschlussgründe' : 'Neue Sektion',
      weight: isExclusion ? 0 : 20,
      isExclusion,
      items: []
    }]);
    setActiveSection(id);
  };

  const updateSectionTitle = (id, title) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  };

  const removeSection = (id) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const addItem = (sectionId, isExclusionSection = false) => {
    const id = `i_new_${Date.now()}`;
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: [...s.items, { id, label: '', type: isExclusionSection ? 'exclusion' : 'check', checked: false, critical: isExclusionSection, note: '', isEditing: true }] }
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

  const filteredHistory = history.filter(e => {
    const stored = JSON.parse(e.notes_json || '{}');
    const ds = stored.decisionStatus || '';
    const matchSearch = !searchQuery || (e.pair || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'all'
      || (filterStatus === 'go' && e.status === 'ready_to_trade')
      || (filterStatus === 'nogo' && e.status === 'in_progress' && ds === 'nogo')
      || (filterStatus === 'observe' && ds === 'observe')
      || (filterStatus === 'rejected' && ds === 'rejected');
    return matchSearch && matchFilter;
  });

  // ─── RENDER ─────────────────────────────────────────────────────────────────
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
                <ClipboardCheck className="w-3 h-3" />
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

      <AnimatePresence mode="wait">

        {/* ── VIEW: TEMPLATE SELECTION ── */}
        {view === 'select_template' && (
          <motion.div key="tpl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
            <div className="text-center mb-8">
              <h1 className={`text-xl sm:text-2xl tracking-widest font-light mb-2 ${theme.text}`}>VORLAGE WÄHLEN</h1>
              <p className={`text-xs sm:text-sm font-sans ${theme.textMuted}`}>
                Starte mit einer strukturierten Vorlage oder erstelle dein Framework von Grund auf.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(TEMPLATES).map(([key, tpl]) => {
                const totalItems = tpl.sections.filter(s => !s.isExclusion).reduce((a, s) => a + s.items.length, 0);
                const exclusionItems = tpl.sections.filter(s => s.isExclusion).reduce((a, s) => a + s.items.length, 0);
                return (
                  <button
                    key={key}
                    onClick={() => startNew(key)}
                    className={cn(
                      'text-left p-4 sm:p-5 rounded-2xl border-2 transition-all group hover:border-emerald-600',
                      darkMode ? 'border-zinc-800 bg-zinc-900 hover:bg-zinc-900' : 'border-zinc-200 bg-zinc-50 hover:bg-white'
                    )}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center mb-3 border-2',
                      darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-200 border-zinc-300'
                    )}>
                      <ClipboardCheck className={`w-4 h-4 ${theme.textSecondary}`} />
                    </div>
                    <div className={`text-sm tracking-widest font-bold mb-1 group-hover:text-emerald-600 transition-colors ${theme.text}`}>{tpl.label.toUpperCase()}</div>
                    <div className={`text-[11px] font-sans leading-relaxed ${theme.textMuted}`}>{tpl.description}</div>
                    {key !== 'blank' && (
                      <div className={`mt-3 text-[10px] tracking-wider ${theme.textMuted} flex items-center gap-3`}>
                        <span>{totalItems} Kriterien</span>
                        {exclusionItems > 0 && <span className="text-rose-500">{exclusionItems} Ausschlussgründe</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── VIEW: HISTORY ── */}
        {view === 'history' && (
          <motion.div key="hist" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">

            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h1 className={`text-xl sm:text-2xl tracking-widest font-light ${theme.text}`}>ANALYSE-FRAMEWORK</h1>
                <p className={`text-[11px] font-sans ${theme.textMuted} mt-0.5`}>Persönliches Entscheidungs-Framework · ZNPCV Checkliste</p>
              </div>
              <button
                onClick={() => setView('select_template')}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold tracking-widest transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">NEUE ANALYSE</span>
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
                  className={`flex-1 bg-transparent text-xs font-sans outline-none ${theme.text}`}
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto">
                {[
                  { v: 'all', label: 'ALLE' },
                  { v: 'go', label: 'GO' },
                  { v: 'observe', label: 'BEOB.' },
                  { v: 'nogo', label: 'NO GO' },
                  { v: 'rejected', label: 'VERWORF.' },
                ].map(f => (
                  <button
                    key={f.v}
                    onClick={() => setFilterStatus(f.v)}
                    className={cn(
                      'px-2.5 py-2 rounded-xl border-2 text-[10px] font-bold tracking-wider transition-all whitespace-nowrap',
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
                <p className={`text-sm font-sans ${theme.textMuted} mb-1`}>
                  {history.length === 0 ? 'Noch keine Analysen erstellt.' : 'Keine Einträge für diese Filter.'}
                </p>
                <p className={`text-xs font-sans ${theme.textMuted} mb-5`}>
                  {history.length === 0 ? 'Starte mit einer Vorlage oder erstelle dein eigenes Framework.' : ''}
                </p>
                {history.length === 0 && (
                  <button
                    onClick={() => setView('select_template')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold tracking-widest transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    ERSTE ANALYSE ERSTELLEN
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredHistory.map((entry) => {
                  const stored = JSON.parse(entry.notes_json || '{}');
                  const ds = stored.decisionStatus || (entry.status === 'ready_to_trade' ? 'go' : '');
                  const dsObj = DECISION_STATUS.find(d => d.value === ds);
                  const isGo = ds === 'go' || entry.status === 'ready_to_trade';
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'border-2 rounded-xl overflow-hidden group',
                        isGo
                          ? darkMode ? 'border-emerald-700/40' : 'border-emerald-600/30'
                          : ds === 'rejected' || ds === 'nogo'
                          ? darkMode ? 'border-rose-700/30' : 'border-rose-300'
                          : `${theme.border}`
                      )}
                    >
                      <div
                        className={cn('p-4 cursor-pointer transition-colors', darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-50')}
                        onClick={() => openEntry(entry)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border-2',
                              isGo ? 'bg-emerald-700 border-emerald-700 text-white'
                                : ds === 'nogo' || ds === 'rejected' ? 'bg-rose-600 border-rose-600 text-white'
                                : ds === 'observe' ? 'bg-amber-500 border-amber-500 text-white'
                                : darkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400' : 'border-zinc-300 bg-zinc-100 text-zinc-500'
                            )}>
                              {isGo ? <CheckCircle2 className="w-4 h-4" />
                                : ds === 'nogo' || ds === 'rejected' ? <XCircle className="w-4 h-4" />
                                : ds === 'observe' ? <Eye className="w-4 h-4" />
                                : <FileText className="w-4 h-4" />}
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
                                      {entry.direction === 'long' ? 'LONG' : 'SHORT'}
                                    </span>
                                  </>
                                )}
                                {stored.decisionReason && (
                                  <>
                                    <span>·</span>
                                    <span className="truncate max-w-[100px]">{stored.decisionReason.slice(0, 40)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className={cn(
                              'px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider border-2',
                              dsObj ? getStatusColor(ds, darkMode) : darkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400' : 'border-zinc-300 bg-zinc-100 text-zinc-600'
                            )}>
                              {dsObj ? dsObj.label : `${entry.completion_percentage || 0}%`}
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
                              title="Archivieren"
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
                    result.status === 'go' ? 'bg-emerald-700 border-emerald-700 text-white'
                      : result.status === 'caution' ? 'bg-amber-500 border-amber-500 text-white'
                      : result.status === 'empty' ? darkMode ? 'border-zinc-700 text-zinc-500' : 'border-zinc-300 text-zinc-400'
                      : 'bg-rose-600 border-rose-600 text-white'
                  )}>
                    {result.status === 'go' ? <CheckCircle2 className="w-3.5 h-3.5" />
                      : result.status === 'caution' ? <AlertTriangle className="w-3.5 h-3.5" />
                      : result.status === 'empty' ? <Minus className="w-3.5 h-3.5" />
                      : <XCircle className="w-3.5 h-3.5" />}
                    <span>{result.status === 'go' ? 'GO' : result.status === 'caution' ? 'PRÜFEN' : result.status === 'empty' ? '—' : 'NO GO'}</span>
                  </div>
                  <span className={`text-sm font-bold ${theme.text}`}>{result.score}%</span>
                  {result.criticalMissing > 0 && (
                    <span className="text-[10px] text-rose-500 font-sans">{result.criticalMissing} Pflicht offen</span>
                  )}
                  {result.activeExclusions > 0 && (
                    <span className="text-[10px] text-rose-500 font-bold tracking-wider">{result.activeExclusions} AUSSCHLUSS</span>
                  )}
                </div>
                <div className={`flex-1 h-1.5 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'} max-w-xs overflow-hidden`}>
                  <div
                    className={cn('h-full rounded-full transition-all duration-500',
                      result.status === 'go' ? 'bg-emerald-700' : result.status === 'caution' ? 'bg-amber-500' : 'bg-rose-600'
                    )}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView('select_template')}
                    className={`p-2 rounded-lg border ${theme.border} transition-all ${theme.textMuted} flex items-center gap-1.5`}
                    title="Vorlage wechseln"
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

              {/* ── BLOCK 1: META ── */}
              <div className={`border-2 ${theme.borderCard} rounded-xl p-4 space-y-3`}>
                <h3 className={`text-[10px] tracking-widest font-bold ${theme.textMuted} flex items-center gap-2`}>
                  <FileText className="w-3.5 h-3.5" /> SETUP-DETAILS
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
                        { v: 'long', label: 'LONG', color: 'emerald' },
                        { v: 'short', label: 'SHORT', color: 'rose' },
                        { v: '', label: 'NEUTRAL', color: 'neutral' },
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

              {/* ── BLOCK 2: SECTIONS (Criteria + Exclusions interleaved) ── */}
              <div className="space-y-3">
                {sections.map((section) => {
                  const isExclusion = section.isExclusion;
                  const sectionChecked = section.items.filter(i => i.checked).length;
                  const sectionTotal = section.items.length;
                  const sectionPct = sectionTotal > 0 ? Math.round((sectionChecked / sectionTotal) * 100) : 0;
                  const isCollapsed = collapsed[section.id];
                  const hasActiveExclusions = isExclusion && sectionChecked > 0;

                  return (
                    <div key={section.id} className={cn(
                      'border-2 rounded-xl overflow-hidden',
                      isExclusion
                        ? hasActiveExclusions
                          ? 'border-rose-600'
                          : darkMode ? 'border-zinc-700' : 'border-zinc-300'
                        : theme.borderCard
                    )}>
                      {/* Section Header */}
                      <div
                        className={cn(
                          'flex items-center gap-3 p-3.5 cursor-pointer transition-colors',
                          isExclusion
                            ? hasActiveExclusions
                              ? darkMode ? 'bg-rose-900/20 hover:bg-rose-900/30' : 'bg-rose-50 hover:bg-rose-100'
                              : darkMode ? 'bg-zinc-900/50 hover:bg-zinc-900' : 'bg-zinc-50 hover:bg-zinc-100'
                            : darkMode ? 'bg-zinc-900/50 hover:bg-zinc-900' : 'bg-zinc-50 hover:bg-zinc-100'
                        )}
                        onClick={() => toggleCollapse(section.id)}
                      >
                        {isExclusion
                          ? <AlertOctagon className={cn('w-4 h-4 flex-shrink-0', hasActiveExclusions ? 'text-rose-500' : theme.textMuted)} />
                          : <div className={`w-1.5 h-5 rounded-full flex-shrink-0 ${sectionPct === 100 ? 'bg-emerald-700' : darkMode ? 'bg-zinc-600' : 'bg-zinc-400'}`} />
                        }
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
                            className={cn('flex-1 text-sm tracking-wider font-bold',
                              isExclusion
                                ? hasActiveExclusions ? 'text-rose-500' : theme.textSecondary
                                : theme.text
                            )}
                            onDoubleClick={(e) => { e.stopPropagation(); setActiveSection(section.id); }}
                          >
                            {section.title}
                            {isExclusion && (
                              <span className={`ml-2 text-[9px] tracking-widest ${theme.textMuted}`}>AUSSCHLUSSGRÜNDE</span>
                            )}
                          </span>
                        )}
                        {!isExclusion && (
                          <span className={`text-[10px] font-sans ${theme.textMuted}`}>{sectionChecked}/{sectionTotal}</span>
                        )}
                        {isExclusion && sectionTotal > 0 && (
                          <span className={cn('text-[10px] font-bold tracking-wider', hasActiveExclusions ? 'text-rose-500' : theme.textMuted)}>
                            {hasActiveExclusions ? `${sectionChecked} AKTIV` : 'KEINE'}
                          </span>
                        )}
                        {!isExclusion && (
                          <div className={`w-12 h-1 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'} overflow-hidden flex-shrink-0`}>
                            <div className={`h-full rounded-full transition-all ${sectionPct === 100 ? 'bg-emerald-700' : darkMode ? 'bg-zinc-500' : 'bg-zinc-400'}`} style={{ width: `${sectionPct}%` }} />
                          </div>
                        )}
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
                          {isExclusion && sectionTotal === 0 && (
                            <p className={`text-[11px] font-sans ${theme.textMuted} pb-1`}>
                              Definiere Gründe, die diese Analyse sofort disqualifizieren. Ein aktiv gesetzter Ausschlussgrund verhindert die GO-Freigabe.
                            </p>
                          )}
                          {section.items.map((item) => (
                            <div key={item.id} className="flex items-start gap-2.5 group/item">
                              <button
                                onClick={() => toggleItem(section.id, item.id)}
                                className={cn(
                                  'w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                                  isExclusion
                                    ? item.checked
                                      ? 'bg-rose-600 border-rose-600'
                                      : darkMode ? 'border-zinc-600 hover:border-rose-500' : 'border-zinc-300 hover:border-rose-400'
                                    : item.checked
                                    ? 'bg-emerald-700 border-emerald-700'
                                    : item.critical
                                    ? darkMode ? 'border-amber-600 hover:border-amber-500' : 'border-amber-500 hover:border-amber-400'
                                    : darkMode ? 'border-zinc-600 hover:border-zinc-500' : 'border-zinc-300 hover:border-zinc-400'
                                )}
                              >
                                {item.checked && (
                                  isExclusion
                                    ? <X className="w-3 h-3 text-white" />
                                    : <Check className="w-3 h-3 text-white" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                {item.isEditing ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    defaultValue={item.label}
                                    placeholder={isExclusion ? 'Ausschlussgrund beschreiben...' : 'Kriterium beschreiben...'}
                                    onBlur={(e) => updateItem(section.id, item.id, { label: e.target.value, isEditing: false })}
                                    onKeyDown={(e) => { if (e.key === 'Enter') updateItem(section.id, item.id, { label: e.target.value, isEditing: false }); }}
                                    className={`w-full bg-transparent border-b ${theme.border} text-sm font-sans outline-none pb-0.5 ${theme.text}`}
                                  />
                                ) : (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={cn('text-sm font-sans',
                                        isExclusion
                                          ? item.checked ? 'text-rose-500 font-bold' : theme.text
                                          : cn(theme.text, item.checked && 'line-through opacity-40')
                                      )}
                                      onDoubleClick={() => updateItem(section.id, item.id, { isEditing: true })}
                                    >
                                      {item.label || <span className={theme.textMuted}>{isExclusion ? 'Ausschlussgrund eingeben...' : 'Kriterium eingeben...'}</span>}
                                    </span>
                                    {!isExclusion && item.critical && (
                                      <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${darkMode ? 'bg-amber-600/20 text-amber-500' : 'bg-amber-100 text-amber-700'}`}>
                                        PFLICHT
                                      </span>
                                    )}
                                    {isExclusion && item.checked && (
                                      <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-600/20 text-rose-500">
                                        AKTIV
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0">
                                {!isExclusion && (
                                  <button
                                    onClick={() => updateItem(section.id, item.id, { critical: !item.critical })}
                                    className={cn('p-1 rounded transition-colors text-[9px] font-bold',
                                      item.critical ? 'text-amber-500' : theme.textMuted
                                    )}
                                    title="Als Pflichtkriterium markieren"
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                  </button>
                                )}
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
                            onClick={() => addItem(section.id, isExclusion)}
                            className={cn('flex items-center gap-2 text-[11px] font-sans mt-2 transition-colors',
                              isExclusion
                                ? `${theme.textMuted} hover:text-rose-500`
                                : `${theme.textMuted} hover:text-emerald-600`
                            )}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {isExclusion ? 'Ausschlussgrund hinzufügen' : 'Kriterium hinzufügen'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Section Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addSection(false)}
                  className={cn(
                    'h-10 rounded-xl border-2 border-dashed text-[11px] font-bold tracking-wider transition-all flex items-center justify-center gap-2',
                    darkMode ? 'border-zinc-700 text-zinc-500 hover:border-emerald-700 hover:text-emerald-700'
                      : 'border-zinc-300 text-zinc-400 hover:border-emerald-700 hover:text-emerald-700'
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  SEKTION
                </button>
                <button
                  onClick={() => addSection(true)}
                  className={cn(
                    'h-10 rounded-xl border-2 border-dashed text-[11px] font-bold tracking-wider transition-all flex items-center justify-center gap-2',
                    darkMode ? 'border-zinc-700 text-zinc-500 hover:border-rose-600 hover:text-rose-500'
                      : 'border-zinc-300 text-zinc-400 hover:border-rose-500 hover:text-rose-500'
                  )}
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  AUSSCHLUSSGRÜNDE
                </button>
              </div>

              {/* ── BLOCK 3: RISK ── */}
              <div className={`border-2 ${theme.borderCard} rounded-xl p-4`}>
                <h3 className={`text-[10px] tracking-widest font-bold ${theme.textMuted} flex items-center gap-2 mb-3`}>
                  <DollarSign className="w-3.5 h-3.5" /> RISIKO-PARAMETER
                </h3>
                <textarea
                  value={riskNotes}
                  onChange={(e) => setRiskNotes(e.target.value.slice(0, 1000))}
                  placeholder="Positionsgröße, Stop-Level, Risiko-Betrag, max. Verlust, Chance-Risiko-Verhältnis, Toleranzen..."
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-sans outline-none resize-none transition-all ${theme.input}`}
                />
                <div className={`text-[10px] font-sans ${theme.textMuted} text-right mt-1`}>{riskNotes.length}/1000</div>
              </div>

              {/* ── BLOCK 4: DECISION STATUS ── */}
              <div className={`border-2 ${theme.borderCard} rounded-xl p-4`}>
                <h3 className={`text-[10px] tracking-widest font-bold ${theme.textMuted} flex items-center gap-2 mb-3`}>
                  <Target className="w-3.5 h-3.5" /> ENTSCHEIDUNGSSTATUS
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {DECISION_STATUS.map(ds => (
                    <button
                      key={ds.value}
                      onClick={() => setDecisionStatus(decisionStatus === ds.value ? '' : ds.value)}
                      className={cn(
                        'h-9 rounded-lg border-2 text-[10px] font-bold tracking-wider transition-all',
                        decisionStatus === ds.value
                          ? getStatusColor(ds.value, darkMode)
                          : `${theme.borderCard} ${theme.textMuted}`
                      )}
                    >
                      {ds.label}
                    </button>
                  ))}
                </div>
                <div>
                  <label className={`text-[10px] tracking-wider ${theme.textMuted} mb-1.5 block`}>ENTSCHEIDUNGSBEGRÜNDUNG</label>
                  <textarea
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value.slice(0, 500))}
                    placeholder="Kernargument für oder gegen die Freigabe — wichtigste Bestätigung, wichtigste Unsicherheit..."
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-sans outline-none resize-none transition-all ${theme.input}`}
                  />
                  <div className={`text-[10px] font-sans ${theme.textMuted} text-right mt-1`}>{decisionReason.length}/500</div>
                </div>
              </div>

              {/* ── BLOCK 5: AUTOMATED GO/NOGO CARD ── */}
              <div className={cn(
                'border-2 rounded-xl p-5 text-center',
                result.activeExclusions > 0 ? 'bg-rose-600 border-rose-600'
                  : result.status === 'go' ? 'bg-emerald-700 border-emerald-700'
                  : result.status === 'caution' ? 'bg-amber-500 border-amber-500'
                  : result.status === 'empty' ? `${theme.borderCard} ${darkMode ? 'bg-zinc-900' : 'bg-zinc-50'}`
                  : 'bg-rose-600 border-rose-600'
              )}>
                <div className={cn('text-3xl font-light tracking-widest mb-1',
                  result.status === 'empty' ? theme.textMuted : 'text-white'
                )}>
                  {result.activeExclusions > 0 ? 'NO GO'
                    : result.status === 'go' ? 'GO'
                    : result.status === 'caution' ? 'PRÜFEN'
                    : result.status === 'empty' ? '—'
                    : 'NO GO'}
                </div>
                <div className={cn('text-base font-light mb-2', result.status === 'empty' ? theme.textMuted : 'text-white/80')}>
                  {result.score}% Kriterien erfüllt
                  {result.openCount > 0 && ` · ${result.openCount} offen`}
                </div>
                {result.activeExclusions > 0 && (
                  <div className="text-xs text-white/80 font-sans font-bold">
                    {result.activeExclusions} Ausschlussgrund{result.activeExclusions > 1 ? 'e' : ''} aktiv — Freigabe blockiert
                  </div>
                )}
                {result.criticalMissing > 0 && result.activeExclusions === 0 && (
                  <div className="text-xs text-white/80 font-sans">
                    {result.criticalMissing} Pflichtkriterium{result.criticalMissing > 1 ? 'en' : ''} nicht erfüllt
                  </div>
                )}
                {result.status === 'go' && result.activeExclusions === 0 && (
                  <div className="text-xs text-white/80 font-sans mt-1">
                    Alle Kriterien erfüllt — Entscheidung liegt bei dir.
                  </div>
                )}
              </div>

              {/* ── BLOCK 6: NOTES & LEARNINGS ── */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className={`border-2 ${theme.borderCard} rounded-xl p-4`}>
                  <label className={`text-[10px] tracking-wider font-bold ${theme.textMuted} mb-2 block flex items-center gap-2`}>
                    <Brain className="w-3 h-3" /> NOTIZEN
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 2000))}
                    placeholder="Kontext, Beobachtungen, Begründungen..."
                    rows={5}
                    className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-sans outline-none resize-none transition-all ${theme.input}`}
                  />
                  <div className={`text-[10px] font-sans ${theme.textMuted} text-right mt-1`}>{notes.length}/2000</div>
                </div>
                <div className={`border-2 ${theme.borderCard} rounded-xl p-4`}>
                  <label className={`text-[10px] tracking-wider font-bold ${theme.textMuted} mb-2 block flex items-center gap-2`}>
                    <BookOpen className="w-3 h-3" /> REVIEW & LEARNINGS
                  </label>
                  <textarea
                    value={learnings}
                    onChange={(e) => setLearnings(e.target.value.slice(0, 2000))}
                    placeholder="Ergebnis, Plan eingehalten?, Abweichungen, Fehler, wichtigste Erkenntnis, Verbesserungspunkt..."
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