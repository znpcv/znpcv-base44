/**
 * FreeChecklist — eigenständige, freie Checklisten-Seite für checklist_lifetime_access ($99).
 * Enthält KEINE Strategie-Inhalte, keine ZNPCV-Regeln, keine Presets, kein Scoring aus der Strategie.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check, X, ChevronDown, ChevronUp, Save, Loader2, FileText, Target, Camera, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';
import { useProductAccess } from '@/lib/useProductAccess';
import ProductPaywall from '@/components/ProductPaywall';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const DEFAULT_SECTIONS = [
  {
    id: 'context',
    title: 'Marktkontext',
    items: [
      { id: 'trend', label: 'Übergeordneter Trend identifiziert', checked: false },
      { id: 'structure', label: 'Marktstruktur klar erkennbar', checked: false },
      { id: 'session', label: 'Handelssession aktiv', checked: false },
    ],
  },
  {
    id: 'setup',
    title: 'Setup-Kriterien',
    items: [
      { id: 'zone', label: 'Einstiegszone definiert', checked: false },
      { id: 'confirmation', label: 'Bestätigung vorhanden', checked: false },
      { id: 'catalyst', label: 'Auslöser identifiziert', checked: false },
    ],
  },
  {
    id: 'risk',
    title: 'Risikomanagement',
    items: [
      { id: 'sl', label: 'Stop Loss platziert', checked: false },
      { id: 'tp', label: 'Take Profit definiert', checked: false },
      { id: 'rr', label: 'R:R akzeptabel', checked: false },
      { id: 'size', label: 'Positionsgröße berechnet', checked: false },
    ],
  },
  {
    id: 'final',
    title: 'Abschlusskontrolle',
    items: [
      { id: 'plan', label: 'Handelsplan vollständig', checked: false },
      { id: 'emotion', label: 'Keine emotionale Verzerrung', checked: false },
      { id: 'news', label: 'Nachrichten-Events geprüft', checked: false },
    ],
  },
];

export default function FreeChecklistPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const { loading: accessLoading, hasChecklistAccess, isAuthenticated } = useProductAccess();

  const [pair, setPair] = useState('');
  const [direction, setDirection] = useState('');
  const [tradeDate, setTradeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [customSections, setCustomSections] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    bgSecondary: darkMode ? 'bg-zinc-950' : 'bg-zinc-100',
    bgCard: darkMode ? 'bg-zinc-900' : 'bg-zinc-50',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    textMuted: darkMode ? 'text-zinc-500' : 'text-zinc-500',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    input: darkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400',
  };

  // Access guard
  if (accessLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    base44.auth.redirectToLogin();
    return null;
  }

  if (!hasChecklistAccess) {
    return <ProductPaywall darkMode={darkMode} mode="checklist" />;
  }

  const allItems = [...sections, ...customSections].flatMap(s => s.items);
  const checkedCount = allItems.filter(i => i.checked).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const toggleItem = (sectionId, itemId) => {
    const update = (list) => list.map(s =>
      s.id === sectionId
        ? { ...s, items: s.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item) }
        : s
    );
    setSections(update);
    setCustomSections(update);
  };

  const toggleCollapse = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  const addCustomSection = () => {
    const id = `custom_${Date.now()}`;
    setCustomSections(prev => [...prev, { id, title: 'Eigene Sektion', items: [], isCustom: true, editing: true }]);
  };

  const addItemToSection = (sectionId) => {
    const itemId = `item_${Date.now()}`;
    const newItem = { id: itemId, label: '', checked: false, isNew: true };
    setCustomSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
    ));
  };

  const updateItemLabel = (sectionId, itemId, label) => {
    setCustomSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, items: s.items.map(item => item.id === itemId ? { ...item, label, isNew: false } : item) }
        : s
    ));
  };

  const removeItem = (sectionId, itemId) => {
    setCustomSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, items: s.items.filter(item => item.id !== itemId) } : s
    ));
  };

  const removeSection = (sectionId) => {
    setCustomSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const updateSectionTitle = (sectionId, title) => {
    setCustomSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, title, editing: false } : s
    ));
  };

  const handleSave = async () => {
    if (!pair) return;
    setSaving(true);
    try {
      await base44.entities.TradeChecklist.create({
        pair: pair.toUpperCase().trim(),
        direction: direction || undefined,
        trade_date: tradeDate,
        notes: notes.slice(0, 2000),
        entry_price: entryPrice || undefined,
        stop_loss: stopLoss || undefined,
        take_profit: takeProfit || undefined,
        completion_percentage: progress,
        status: progress === 100 ? 'ready_to_trade' : 'in_progress',
      });
      setSaved(true);
      setTimeout(() => { navigate(createPageUrl('Dashboard')); }, 1200);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (section, isCustom = false) => (
    <div key={section.id} className={`border-2 ${theme.border} rounded-xl overflow-hidden`}>
      <button
        onClick={() => toggleCollapse(section.id)}
        className={`w-full flex items-center justify-between p-4 ${darkMode ? 'bg-zinc-900/50 hover:bg-zinc-900' : 'bg-zinc-50 hover:bg-zinc-100'} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-5 rounded-full bg-emerald-700`} />
          <span className={`text-sm tracking-wider font-bold ${theme.text}`}>{section.title}</span>
          <span className={`text-[10px] font-sans ${theme.textMuted}`}>
            {section.items.filter(i => i.checked).length}/{section.items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCustom && (
            <button
              onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
              className={`p-1 rounded ${darkMode ? 'hover:bg-zinc-700 text-zinc-500' : 'hover:bg-zinc-200 text-zinc-400'}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {collapsed[section.id] ? <ChevronDown className={`w-4 h-4 ${theme.textMuted}`} /> : <ChevronUp className={`w-4 h-4 ${theme.textMuted}`} />}
        </div>
      </button>

      {!collapsed[section.id] && (
        <div className={`p-3 space-y-2 ${darkMode ? 'bg-black/20' : 'bg-white'}`}>
          {section.items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <button
                onClick={() => isCustom
                  ? setCustomSections(prev => prev.map(s => s.id === section.id
                    ? { ...s, items: s.items.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i) }
                    : s))
                  : toggleItem(section.id, item.id)
                }
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  item.checked
                    ? 'bg-emerald-700 border-emerald-700'
                    : darkMode ? 'border-zinc-600 hover:border-emerald-700' : 'border-zinc-300 hover:border-emerald-700'
                )}
              >
                {item.checked && <Check className="w-3 h-3 text-white" />}
              </button>
              {item.isNew ? (
                <input
                  autoFocus
                  type="text"
                  placeholder="Kriterium eingeben..."
                  onBlur={(e) => updateItemLabel(section.id, item.id, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') updateItemLabel(section.id, item.id, e.target.value); }}
                  className={`flex-1 text-sm font-sans bg-transparent border-b ${theme.border} outline-none pb-0.5 ${theme.text} placeholder:${theme.textMuted}`}
                />
              ) : (
                <span className={cn('text-sm font-sans flex-1', theme.text, item.checked && 'line-through opacity-50')}>{item.label}</span>
              )}
              {isCustom && !item.isNew && (
                <button
                  onClick={() => removeItem(section.id, item.id)}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-zinc-800 text-zinc-600' : 'hover:bg-zinc-100 text-zinc-400'}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {isCustom && (
            <button
              onClick={() => addItemToSection(section.id)}
              className={`flex items-center gap-2 text-xs font-sans ${theme.textMuted} hover:text-emerald-600 transition-colors mt-2`}
            >
              <Plus className="w-3.5 h-3.5" />
              Kriterium hinzufügen
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={() => navigate(createPageUrl('Home'))}
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
              className="h-8 sm:h-10 md:h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </button>

          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-lg border text-[10px] tracking-widest font-bold ${theme.textMuted} ${theme.border}`}>
              CHECKLISTE
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-6 space-y-4">
        {/* Progress Bar */}
        <div className={`border-2 ${theme.border} rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs tracking-wider ${theme.textMuted}`}>FORTSCHRITT</span>
            <span className={`text-sm font-bold ${progress >= 100 ? 'text-emerald-600' : theme.text}`}>{progress}%</span>
          </div>
          <div className={`h-1.5 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'} overflow-hidden`}>
            <div
              className="h-full rounded-full bg-emerald-700 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={`text-[10px] font-sans ${theme.textMuted} mt-1.5`}>
            {checkedCount} von {totalCount} Kriterien erfüllt
          </div>
        </div>

        {/* Trade-Details */}
        <div className={`border-2 ${theme.border} rounded-xl p-4 space-y-3`}>
          <h2 className={`text-xs tracking-widest font-bold ${theme.textMuted} flex items-center gap-2`}>
            <FileText className="w-3.5 h-3.5" /> TRADE-DETAILS
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-[10px] tracking-wider ${theme.textMuted} mb-1 block`}>INSTRUMENT</label>
              <input
                type="text"
                value={pair}
                onChange={(e) => setPair(e.target.value.slice(0, 20))}
                placeholder="z. B. EUR/USD"
                className={`w-full h-9 px-3 rounded-lg border-2 text-sm font-mono tracking-wider outline-none transition-all ${theme.input} ${darkMode ? 'focus:border-zinc-600' : 'focus:border-zinc-400'}`}
              />
            </div>
            <div>
              <label className={`text-[10px] tracking-wider ${theme.textMuted} mb-1 block`}>DATUM</label>
              <input
                type="date"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                className={`w-full h-9 px-3 rounded-lg border-2 text-sm font-sans outline-none transition-all ${theme.input} ${darkMode ? 'focus:border-zinc-600' : 'focus:border-zinc-400'}`}
              />
            </div>
          </div>

          <div>
            <label className={`text-[10px] tracking-wider ${theme.textMuted} mb-1 block`}>RICHTUNG</label>
            <div className="grid grid-cols-2 gap-2">
              {['long', 'short'].map(d => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={cn(
                    'h-9 rounded-lg border-2 text-xs font-bold tracking-widest transition-all',
                    direction === d
                      ? d === 'long'
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'bg-rose-600 border-rose-600 text-white'
                      : `${theme.border} ${theme.textMuted} hover:${d === 'long' ? 'border-emerald-700' : 'border-rose-600'}`
                  )}
                >
                  {d === 'long' ? 'LONG ↑' : 'SHORT ↓'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'EINSTIEG', value: entryPrice, set: setEntryPrice },
              { label: 'STOP LOSS', value: stopLoss, set: setStopLoss },
              { label: 'TAKE PROFIT', value: takeProfit, set: setTakeProfit },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className={`text-[9px] tracking-wider ${theme.textMuted} mb-1 block`}>{label}</label>
                <input
                  type="number"
                  step="0.00001"
                  value={value}
                  onChange={(e) => set(e.target.value.slice(0, 20))}
                  placeholder="0.00000"
                  className={`w-full h-9 px-2 rounded-lg border-2 text-xs font-mono text-center outline-none transition-all ${theme.input} ${darkMode ? 'focus:border-zinc-600' : 'focus:border-zinc-400'}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Default Sections */}
        {sections.map(s => renderSection(s, false))}

        {/* Custom Sections */}
        {customSections.map(s => renderSection(s, true))}

        {/* Add Section */}
        <button
          onClick={addCustomSection}
          className={cn(
            'w-full h-11 rounded-xl border-2 border-dashed text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2',
            darkMode
              ? 'border-zinc-700 text-zinc-500 hover:border-emerald-700 hover:text-emerald-700'
              : 'border-zinc-300 text-zinc-400 hover:border-emerald-700 hover:text-emerald-700'
          )}
        >
          <Plus className="w-4 h-4" />
          EIGENE SEKTION HINZUFÜGEN
        </button>

        {/* Notes */}
        <div className={`border-2 ${theme.border} rounded-xl p-4`}>
          <label className={`text-xs tracking-wider ${theme.textMuted} mb-2 block`}>NOTIZEN</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 2000))}
            placeholder="Beobachtungen, Begründungen, Lernpunkte..."
            rows={4}
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-sans outline-none resize-none transition-all ${theme.input} ${darkMode ? 'focus:border-zinc-600' : 'focus:border-zinc-400'}`}
          />
          <div className={`text-[10px] font-sans ${theme.textMuted} text-right mt-1`}>{notes.length}/2000</div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!pair || saving || saved}
          className={cn(
            'w-full h-12 rounded-xl font-bold tracking-widest text-sm border-2 transition-all flex items-center justify-center gap-2',
            saved
              ? 'bg-emerald-700 border-emerald-700 text-white'
              : !pair
              ? darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-100 border-zinc-300 text-zinc-400 cursor-not-allowed'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700'
          )}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> WIRD GESPEICHERT...</>
          ) : saved ? (
            <><Check className="w-4 h-4" /> GESPEICHERT</>
          ) : (
            <><Save className="w-4 h-4" /> TRADE SPEICHERN</>
          )}
        </button>

        {!pair && (
          <p className={`text-[10px] font-sans text-center ${theme.textMuted}`}>
            Bitte Instrument eingeben, um zu speichern.
          </p>
        )}
      </main>
    </div>
  );
}