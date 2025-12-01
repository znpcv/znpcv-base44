import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  de: {
    // Header
    online: 'ONLINE',
    localTime: 'LOKALZEIT',
    
    // Home
    ultimateChecklist: 'ULTIMATE CHECKLIST',
    heroSubtitle: 'Die ultimative Trading-Checkliste die es je gegeben hat.',
    heroDesc: 'Professionelle Multi-Timeframe Analyse • Strukturierte Entscheidungsfindung • Maximale Disziplin',
    newAnalysis: 'NEUE ANALYSE STARTEN',
    newAnalysisDesc: 'Starte deine professionelle Multi-Timeframe Analyse mit der ultimativen ZNPCV Checkliste',
    startNow: 'Jetzt starten',
    dashboard: 'TRADING DASHBOARD',
    dashboardDesc: 'Übersicht deiner Analysen, Performance-Tracking und detaillierte Statistiken',
    openDashboard: 'Dashboard öffnen',
    
    // Market Sessions
    marketSessions: 'MARKET SESSIONS',
    open: 'OPEN',
    closed: 'CLOSED',
    
    // Assets
    forex: 'FOREX',
    crypto: 'KRYPTO',
    stocks: 'STOCKS',
    commodities: 'COMMODITIES',
    indices: 'INDICES',
    
    // Features
    preciseAnalysis: 'PRÄZISE ANALYSE',
    preciseAnalysisDesc: 'W-D-4H Confluence System für maximale Genauigkeit',
    riskManagement: 'RISIKO MANAGEMENT',
    riskManagementDesc: 'Integrierte R:R Bewertung und SL/TP Planung',
    performanceTracking: 'PERFORMANCE TRACKING',
    performanceTrackingDesc: 'Detaillierte Statistiken und Erfolgsquoten',
    
    // Footer
    sslEncrypted: 'SSL VERSCHLÜSSELT',
    gdprCompliant: 'DSGVO KONFORM',
    dataProtection: 'DATENSCHUTZ',
    worldwide: 'WELTWEIT VERFÜGBAR',
    legal: 'RECHTLICHES',
    imprint: 'Impressum',
    privacyPolicy: 'Datenschutzerklärung',
    terms: 'Nutzungsbedingungen',
    cookies: 'Cookie-Richtlinie',
    contact: 'KONTAKT',
    faqHelp: 'FAQ & Hilfe',
    footerDesc: 'Die ultimative Trading-Checkliste für professionelle Trader. Entwickelt für maximale Disziplin und konsistente Ergebnisse.',
    riskWarning: 'Trading birgt Risiken. Vergangene Ergebnisse sind keine Garantie für zukünftige Gewinne.',
    allRights: 'Alle Rechte vorbehalten.',
    
    // Checklist
    selectAsset: 'ASSET AUSWÄHLEN',
    selectAssetDesc: 'WELCHES PAAR WILLST DU TRADEN?',
    trendAnalysis: 'TREND ANALYSE',
    trendAnalysisDesc: 'PRÜFE ALLE 3 TIMEFRAMES',
    weekly: 'WEEKLY',
    daily: 'DAILY',
    fourHour: '4H',
    mainTrend: 'Haupttrend',
    midTerm: 'Mittelfristig',
    shortTerm: 'Kurzfristig',
    bullish: 'BULLISH',
    bearish: 'BEARISH',
    confluence: 'CONFLUENCE',
    noConfluence: 'KEINE CONFLUENCE',
    allTimeframes: 'Alle Timeframes sind',
    dailyH4Sync: 'DAILY & 4H SYNC',
    higherProbability: 'Höhere Wahrscheinlichkeit für erfolgreichen Trade!',
    
    // AOI
    aoi: 'AREA OF INTEREST',
    aoiDesc: 'AOI ZONE PRÜFEN',
    aoiDrawn: 'AOI EINGEZEICHNET',
    aoiDrawnDesc: 'Hast du deine Area of Interest im Chart markiert?',
    priceInAoi: 'PREIS IN AOI ANGEKOMMEN',
    priceInAoiDesc: 'Ist der aktuelle Preis in deiner AOI Box?',
    pricePosition: 'PREIS POSITION ZUM AOI',
    aboveAoi: 'ÜBER AOI',
    belowAoi: 'UNTER AOI',
    shortSetup: '= SHORT Setup',
    longSetup: '= LONG Setup',
    
    // Structure
    structureCheck: 'STRUKTUR CHECK',
    structureCheckDesc: 'PSS & EMA PRÜFEN',
    pssRejected: 'PSS ABGELEHNT',
    pssRejectedDesc: 'Previous Structure Support/Resistance wurde respektiert und abgelehnt',
    emaRespected: 'EMA RESPEKTIERT',
    emaRespectedDesc: 'Der Preis hat die EMA respektiert',
    structureConfirmed: 'STRUKTUR BESTÄTIGT',
    
    // Patterns
    patterns: 'CHART PATTERNS',
    patternsDesc: 'NUR UNSERE PATTERNS',
    headShoulders: 'HEAD & SHOULDERS',
    invHeadShoulders: 'INV. HEAD & SHOULDERS',
    doubleTop: 'DOUBLE TOP',
    doubleBottom: 'DOUBLE BOTTOM',
    patternIdentified: 'PATTERN ERKANNT',
    patternIdentifiedDesc: 'Eines unserer 4 Patterns ist im Chart sichtbar',
    patternConfirmed: 'PATTERN BESTÄTIGT',
    patternConfirmedDesc: 'Das Pattern ist vollständig und gültig',
    
    // Entry
    entryConfirmation: 'ENTRY BESTÄTIGUNG',
    entryConfirmationDesc: 'MSS & ENGULFING (30MIN - 1HR)',
    mssConfirmed: 'MSS / SOS BESTÄTIGT',
    mssConfirmedDesc: 'Market Structure Shift - Preis hat gedreht (Bullish → Bearish oder umgekehrt)',
    engulfingAfterPullback: 'ENGULFING NACH PULLBACK',
    engulfingQuestion: 'Wird die Kerze nach dem Pullback engulfed?',
    blueEngulfing: 'BLAUE ENGULFING',
    redEngulfing: 'ROTE ENGULFING',
    longEntry: '= LONG Entry',
    shortEntry: '= SHORT Entry',
    noEngulfing: 'KEINE ENGULFING',
    entrySignalConfirmed: 'ENTRY SIGNAL BESTÄTIGT',
    
    // Final
    finalCheck: 'FINALE PRÜFUNG',
    finalCheckDesc: 'WICHTIGE REGELN',
    importantRules: 'WICHTIGE REGELN',
    notBuyingResistance: 'NICHT BEIM WIDERSTAND KAUFEN',
    notBuyingResistanceDesc: 'Ich kaufe NICHT beim Widerstand (Resistance)',
    notSellingSupport: 'NICHT BEIM SUPPORT VERKAUFEN',
    notSellingSupportDesc: 'Ich verkaufe NICHT beim Support',
    summary: 'ZUSAMMENFASSUNG',
    pair: 'PAIR',
    trend: 'TREND',
    mixed: 'MIXED',
    inAoi: 'IM AOI',
    entry: 'ENTRY',
    notes: 'NOTIZEN',
    notesPlaceholder: 'Trade Notizen...',
    readyToTrade: 'READY TO TRADE',
    allConfirmed: 'Alle Bestätigungen erfüllt!',
    
    // Navigation
    back: 'ZURÜCK',
    next: 'WEITER',
    save: 'SPEICHERN',
    saving: 'SPEICHERN...',
    loading: 'LADEN...',
    
    // Dashboard
    tradingDashboard: 'TRADING DASHBOARD',
    overviewStats: 'ÜBERSICHT & PERFORMANCE',
    totalAnalyses: 'TOTAL ANALYSEN',
    readyToTradeShort: 'READY TO TRADE',
    inProgress: 'IN PROGRESS',
    withConfluence: 'MIT CONFLUENCE',
    activity30Days: 'AKTIVITÄT (30 TAGE)',
    lastAnalyses: 'LETZTE ANALYSEN',
    of: 'VON',
    noAnalyses: 'KEINE ANALYSEN',
    startFirstAnalysis: 'ERSTE ANALYSE STARTEN',
    direction: 'RICHTUNG',
    long: 'LONG',
    short: 'SHORT',
    calendar: 'KALENDER',
    avgCompletion: 'DURCHSCHNITTLICHE COMPLETION',
    
    // Quotes
    quote1: '"Plan your trade, trade your plan."',
    quote2: '"Die Disziplin entscheidet über Erfolg oder Misserfolg."',
    quote3: '"Wir kaufen nicht beim Widerstand, wir verkaufen nicht beim Support."',
    quote4: '"Geduld ist der Schlüssel zum Erfolg im Trading."',
    quote5: '"Risikomanagement ist wichtiger als Gewinnmaximierung."',
  },
  en: {
    // Header
    online: 'ONLINE',
    localTime: 'LOCAL TIME',
    
    // Home
    ultimateChecklist: 'ULTIMATE CHECKLIST',
    heroSubtitle: 'The ultimate trading checklist that has ever existed.',
    heroDesc: 'Professional Multi-Timeframe Analysis • Structured Decision Making • Maximum Discipline',
    newAnalysis: 'START NEW ANALYSIS',
    newAnalysisDesc: 'Start your professional multi-timeframe analysis with the ultimate ZNPCV checklist',
    startNow: 'Start now',
    dashboard: 'TRADING DASHBOARD',
    dashboardDesc: 'Overview of your analyses, performance tracking and detailed statistics',
    openDashboard: 'Open dashboard',
    
    // Market Sessions
    marketSessions: 'MARKET SESSIONS',
    open: 'OPEN',
    closed: 'CLOSED',
    
    // Assets
    forex: 'FOREX',
    crypto: 'CRYPTO',
    stocks: 'STOCKS',
    commodities: 'COMMODITIES',
    indices: 'INDICES',
    
    // Features
    preciseAnalysis: 'PRECISE ANALYSIS',
    preciseAnalysisDesc: 'W-D-4H Confluence System for maximum accuracy',
    riskManagement: 'RISK MANAGEMENT',
    riskManagementDesc: 'Integrated R:R evaluation and SL/TP planning',
    performanceTracking: 'PERFORMANCE TRACKING',
    performanceTrackingDesc: 'Detailed statistics and success rates',
    
    // Footer
    sslEncrypted: 'SSL ENCRYPTED',
    gdprCompliant: 'GDPR COMPLIANT',
    dataProtection: 'DATA PROTECTION',
    worldwide: 'WORLDWIDE AVAILABLE',
    legal: 'LEGAL',
    imprint: 'Imprint',
    privacyPolicy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie Policy',
    contact: 'CONTACT',
    faqHelp: 'FAQ & Help',
    footerDesc: 'The ultimate trading checklist for professional traders. Developed for maximum discipline and consistent results.',
    riskWarning: 'Trading involves risks. Past results are no guarantee of future profits.',
    allRights: 'All rights reserved.',
    
    // Checklist
    selectAsset: 'SELECT ASSET',
    selectAssetDesc: 'WHICH PAIR DO YOU WANT TO TRADE?',
    trendAnalysis: 'TREND ANALYSIS',
    trendAnalysisDesc: 'CHECK ALL 3 TIMEFRAMES',
    weekly: 'WEEKLY',
    daily: 'DAILY',
    fourHour: '4H',
    mainTrend: 'Main trend',
    midTerm: 'Mid-term',
    shortTerm: 'Short-term',
    bullish: 'BULLISH',
    bearish: 'BEARISH',
    confluence: 'CONFLUENCE',
    noConfluence: 'NO CONFLUENCE',
    allTimeframes: 'All timeframes are',
    dailyH4Sync: 'DAILY & 4H SYNC',
    higherProbability: 'Higher probability for a successful trade!',
    
    // AOI
    aoi: 'AREA OF INTEREST',
    aoiDesc: 'CHECK AOI ZONE',
    aoiDrawn: 'AOI DRAWN',
    aoiDrawnDesc: 'Have you marked your Area of Interest in the chart?',
    priceInAoi: 'PRICE REACHED AOI',
    priceInAoiDesc: 'Is the current price in your AOI box?',
    pricePosition: 'PRICE POSITION TO AOI',
    aboveAoi: 'ABOVE AOI',
    belowAoi: 'BELOW AOI',
    shortSetup: '= SHORT Setup',
    longSetup: '= LONG Setup',
    
    // Structure
    structureCheck: 'STRUCTURE CHECK',
    structureCheckDesc: 'CHECK PSS & EMA',
    pssRejected: 'PSS REJECTED',
    pssRejectedDesc: 'Previous Structure Support/Resistance was respected and rejected',
    emaRespected: 'EMA RESPECTED',
    emaRespectedDesc: 'Price has respected the EMA',
    structureConfirmed: 'STRUCTURE CONFIRMED',
    
    // Patterns
    patterns: 'CHART PATTERNS',
    patternsDesc: 'ONLY OUR PATTERNS',
    headShoulders: 'HEAD & SHOULDERS',
    invHeadShoulders: 'INV. HEAD & SHOULDERS',
    doubleTop: 'DOUBLE TOP',
    doubleBottom: 'DOUBLE BOTTOM',
    patternIdentified: 'PATTERN IDENTIFIED',
    patternIdentifiedDesc: 'One of our 4 patterns is visible in the chart',
    patternConfirmed: 'PATTERN CONFIRMED',
    patternConfirmedDesc: 'The pattern is complete and valid',
    
    // Entry
    entryConfirmation: 'ENTRY CONFIRMATION',
    entryConfirmationDesc: 'MSS & ENGULFING (30MIN - 1HR)',
    mssConfirmed: 'MSS / SOS CONFIRMED',
    mssConfirmedDesc: 'Market Structure Shift - Price has turned (Bullish → Bearish or vice versa)',
    engulfingAfterPullback: 'ENGULFING AFTER PULLBACK',
    engulfingQuestion: 'Is the candle after pullback being engulfed?',
    blueEngulfing: 'BLUE ENGULFING',
    redEngulfing: 'RED ENGULFING',
    longEntry: '= LONG Entry',
    shortEntry: '= SHORT Entry',
    noEngulfing: 'NO ENGULFING',
    entrySignalConfirmed: 'ENTRY SIGNAL CONFIRMED',
    
    // Final
    finalCheck: 'FINAL CHECK',
    finalCheckDesc: 'IMPORTANT RULES',
    importantRules: 'IMPORTANT RULES',
    notBuyingResistance: 'DO NOT BUY AT RESISTANCE',
    notBuyingResistanceDesc: 'I do NOT buy at resistance',
    notSellingSupport: 'DO NOT SELL AT SUPPORT',
    notSellingSupportDesc: 'I do NOT sell at support',
    summary: 'SUMMARY',
    pair: 'PAIR',
    trend: 'TREND',
    mixed: 'MIXED',
    inAoi: 'IN AOI',
    entry: 'ENTRY',
    notes: 'NOTES',
    notesPlaceholder: 'Trade notes...',
    readyToTrade: 'READY TO TRADE',
    allConfirmed: 'All confirmations fulfilled!',
    
    // Navigation
    back: 'BACK',
    next: 'NEXT',
    save: 'SAVE',
    saving: 'SAVING...',
    loading: 'LOADING...',
    
    // Dashboard
    tradingDashboard: 'TRADING DASHBOARD',
    overviewStats: 'OVERVIEW & PERFORMANCE',
    totalAnalyses: 'TOTAL ANALYSES',
    readyToTradeShort: 'READY TO TRADE',
    inProgress: 'IN PROGRESS',
    withConfluence: 'WITH CONFLUENCE',
    activity30Days: 'ACTIVITY (30 DAYS)',
    lastAnalyses: 'LATEST ANALYSES',
    of: 'OF',
    noAnalyses: 'NO ANALYSES',
    startFirstAnalysis: 'START FIRST ANALYSIS',
    direction: 'DIRECTION',
    long: 'LONG',
    short: 'SHORT',
    calendar: 'CALENDAR',
    avgCompletion: 'AVERAGE COMPLETION',
    
    // Quotes
    quote1: '"Plan your trade, trade your plan."',
    quote2: '"Discipline determines success or failure."',
    quote3: '"We don\'t buy at resistance, we don\'t sell at support."',
    quote4: '"Patience is the key to success in trading."',
    quote5: '"Risk management is more important than profit maximization."',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('znpcv_language') || 'de';
    }
    return 'de';
  });

  useEffect(() => {
    localStorage.setItem('znpcv_language', language);
  }, [language]);

  const t = (key) => translations[language][key] || key;
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'de' ? 'en' : 'de');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm tracking-wider"
    >
      <span className={language === 'de' ? 'text-white' : 'text-zinc-500'}>DE</span>
      <span className="text-zinc-600">/</span>
      <span className={language === 'en' ? 'text-white' : 'text-zinc-500'}>EN</span>
    </button>
  );
}