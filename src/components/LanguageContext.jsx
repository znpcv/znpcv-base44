import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  de: {
    // Header
    online: 'ONLINE',
    localTime: 'ORTSZEIT',
    
    // Home
    ultimateChecklist: 'ULTIMATIVE CHECKLISTE',
    heroSubtitle: 'Die ultimative Trading-Checkliste die es je gegeben hat.',
    heroDesc: 'Professionelle Multi-Timeframe Analyse • Strukturierte Entscheidungsfindung • Maximale Disziplin',
    newAnalysis: 'NEUE ANALYSE',
    newAnalysisDesc: 'Starte deine professionelle Multi-Timeframe Analyse mit der ultimativen ZNPCV Checkliste',
    startNow: 'Jetzt starten',
    dashboard: 'ÜBERSICHT',
    dashboardDesc: 'Übersicht deiner Analysen, Leistungsverfolgung und detaillierte Statistiken',
    openDashboard: 'Öffnen',
    
    // Market Sessions
    marketSessions: 'HANDELSSITZUNGEN',
    open: 'OFFEN',
    closed: 'GESCHLOSSEN',
    
    // Assets
    forex: 'DEVISEN',
    crypto: 'KRYPTO',
    stocks: 'AKTIEN',
    commodities: 'ROHSTOFFE',
    indices: 'INDIZES',
    
    // Features
    preciseAnalysis: 'PRÄZISE ANALYSE',
    preciseAnalysisDesc: 'W-D-4H Übereinstimmungssystem für maximale Genauigkeit',
    riskManagement: 'RISIKOMANAGEMENT',
    riskManagementDesc: 'Integrierte R:R Bewertung und SL/TP Planung',
    performanceTracking: 'LEISTUNGSVERFOLGUNG',
    performanceTrackingDesc: 'Detaillierte Statistiken und Erfolgsquoten',
    
    // Footer
    sslEncrypted: 'SSL VERSCHLÜSSELT',
    gdprCompliant: 'DSGVO KONFORM',
    dataProtection: 'DATENSCHUTZ',
    worldwide: 'WELTWEIT VERFÜGBAR',
    contact: 'KONTAKT',
    faqHelp: 'FAQ & HILFE',
    footerDesc: 'Die ultimative Trading-Checkliste für professionelle Trader. Entwickelt für maximale Disziplin und beständige Ergebnisse.',
    riskWarning: 'Trading birgt Risiken. Vergangene Ergebnisse sind keine Garantie für zukünftige Gewinne.',
    allRights: 'Alle Rechte vorbehalten.',
    
    // Checklist
    selectAsset: 'WÄHRUNGSPAAR',
    selectAssetDesc: 'WELCHES PAAR WILLST DU HANDELN?',
    trendAnalysis: 'TRENDANALYSE',
    trendAnalysisDesc: 'PRÜFE ALLE 3 ZEITRAHMEN',
    weekly: 'WÖCHENTLICH',
    daily: 'TÄGLICH',
    fourHour: '4 STUNDEN',
    mainTrend: 'Haupttrend',
    midTerm: 'Mittelfristig',
    shortTerm: 'Kurzfristig',
    bullish: 'BULLISH',
    bearish: 'BEARISH',
    confluence: 'ÜBEREINSTIMMUNG',
    noConfluence: 'KEINE ÜBEREINSTIMMUNG',
    allTimeframes: 'Alle Zeitrahmen zeigen',
    dailyH4Sync: 'TÄGLICH & 4H SYNCHRON',
    higherProbability: 'Höhere Wahrscheinlichkeit für erfolgreichen Trade!',
    confluenceTooltip: 'Übereinstimmung bedeutet, dass alle Zeitrahmen (Wöchentlich, Täglich, 4H) in die gleiche Richtung zeigen. Das erhöht die Erfolgswahrscheinlichkeit.',
    
    // AOI
    aoi: 'INTERESSENSBEREICH',
    aoiDesc: 'AOI ZONE PRÜFEN',
    aoiDrawn: 'AOI EINGEZEICHNET',
    aoiDrawnDesc: 'Hast du deinen Interessensbereich im Chart markiert?',
    priceInAoi: 'PREIS IM AOI',
    priceInAoiDesc: 'Ist der aktuelle Preis in deiner AOI Zone?',
    pricePosition: 'PREISPOSITION ZUM AOI',
    aboveAoi: 'ÜBER AOI',
    belowAoi: 'UNTER AOI',
    shortSetup: '= VERKAUF Setup',
    longSetup: '= KAUF Setup',
    
    // Structure
    structureCheck: 'STRUKTURPRÜFUNG',
    structureCheckDesc: 'PSS & EMA PRÜFEN',
    pssRejected: 'PSS ABGELEHNT',
    pssRejectedDesc: 'Vorherige Struktur (Support/Widerstand) wurde respektiert und abgelehnt',
    emaRespected: 'EMA RESPEKTIERT',
    emaRespectedDesc: 'Der Preis hat den gleitenden Durchschnitt respektiert',
    structureConfirmed: 'STRUKTUR BESTÄTIGT',
    
    // Patterns
    patterns: 'CHARTMUSTER',
    patternsDesc: 'NUR UNSERE MUSTER',
    headShoulders: 'KOPF-SCHULTER',
    invHeadShoulders: 'UMGEKEHRTE KOPF-SCHULTER',
    doubleTop: 'DOPPELHOCH',
    doubleBottom: 'DOPPELTIEF',
    patternIdentified: 'MUSTER ERKANNT',
    patternIdentifiedDesc: 'Eines unserer 4 Muster ist im Chart sichtbar',
    patternConfirmed: 'MUSTER BESTÄTIGT',
    patternConfirmedDesc: 'Das Muster ist vollständig und gültig',
    
    // Entry
    entryConfirmation: 'EINSTIEGSBESTÄTIGUNG',
    entryConfirmationDesc: 'MSS & ENGULFING (30MIN - 1STD)',
    mssConfirmed: 'MSS / SOS BESTÄTIGT',
    mssConfirmedDesc: 'Marktstrukturwechsel - Preis hat gedreht (Bullish → Bearish oder umgekehrt)',
    engulfingAfterPullback: 'ENGULFING NACH RÜCKSETZER',
    engulfingQuestion: 'Wird die Kerze nach dem Rücksetzer verschlungen?',
    blueEngulfing: 'BLAUE ENGULFING',
    redEngulfing: 'ROTE ENGULFING',
    longEntry: '= KAUF Einstieg',
    shortEntry: '= VERKAUF Einstieg',
    noEngulfing: 'KEINE ENGULFING',
    entrySignalConfirmed: 'EINSTIEGSSIGNAL BESTÄTIGT',
    
    // Final
    finalCheck: 'ABSCHLUSSPRÜFUNG',
    finalCheckDesc: 'WICHTIGE REGELN',
    importantRules: 'WICHTIGE REGELN',
    notBuyingResistance: 'NICHT BEIM WIDERSTAND KAUFEN',
    notBuyingResistanceDesc: 'Ich kaufe NICHT beim Widerstand',
    notSellingSupport: 'NICHT BEI UNTERSTÜTZUNG VERKAUFEN',
    notSellingSupportDesc: 'Ich verkaufe NICHT bei der Unterstützung',
    summary: 'ZUSAMMENFASSUNG',
    pair: 'PAAR',
    trend: 'TREND',
    mixed: 'GEMISCHT',
    inAoi: 'IM AOI',
    entry: 'EINSTIEG',
    notes: 'NOTIZEN',
    notesPlaceholder: 'Trade Notizen...',
    readyToTrade: 'BEREIT ZUM HANDELN',
    allConfirmed: 'Alle Bestätigungen erfüllt!',
    
    // Navigation
    back: 'ZURÜCK',
    next: 'WEITER',
    save: 'SPEICHERN',
    saving: 'SPEICHERN...',
    loading: 'LADEN...',
    
    // Dashboard
    tradingDashboard: 'HANDELSÜBERSICHT',
    overviewStats: 'ÜBERSICHT & LEISTUNG',
    totalAnalyses: 'ANALYSEN GESAMT',
    readyToTradeShort: 'BEREIT',
    inProgress: 'IN BEARBEITUNG',
    withConfluence: 'MIT ÜBEREINSTIMMUNG',
    activity30Days: 'AKTIVITÄT (30 TAGE)',
    lastAnalyses: 'LETZTE ANALYSEN',
    of: 'VON',
    noAnalyses: 'KEINE ANALYSEN',
    startFirstAnalysis: 'ERSTE ANALYSE STARTEN',
    direction: 'RICHTUNG',
    long: 'KAUF',
    short: 'VERKAUF',
    calendar: 'KALENDER',
    avgCompletion: 'DURCHSCHNITTLICHER FORTSCHRITT',
    
    // Quotes
    quote1: '"Plane deinen Trade, handle deinen Plan."',
    quote2: '"Disziplin entscheidet über Erfolg oder Misserfolg."',
    quote3: '"Wir kaufen nicht beim Widerstand, wir verkaufen nicht bei Unterstützung."',
    quote4: '"Geduld ist der Schlüssel zum Erfolg im Trading."',
    quote5: '"Risikomanagement ist wichtiger als Gewinnmaximierung."',
    
    // Warning
    warningTitle: 'WARNUNG - KEIN A+++ TRADE',
    warningDesc: 'Deine Checkliste ist unter 85%. Nach ZNPCV Standard solltest du nur A+++ Trades eingehen. Überprüfe alle Kriterien erneut oder überspringe diesen Trade.',
    warningButton: 'TRADE NICHT EINGEHEN',
    proceedAnyway: 'Trotzdem fortfahren',
    aPlusTradeOnly: 'NUR A+++ TRADES',
    
    // Additional translations
    features: 'FUNKTIONEN',
    featuresDesc: 'Professionelle Trading-Werkzeuge',
    znpcvStandard: 'ZNPCV STANDARD',
    stepChecklist: 'SCHRITT CHECKLISTE',
    chartPatterns: 'CHART MUSTER',
    tradingTools: 'DAS ULTIMATIVE TRADING-TOOL',
    philosophy: 'ZNPCV PHILOSOPHIE',
    disciplineQuote: 'Disziplin schlägt Talent. Jeden. Einzelnen. Tag.',
    
    // Risk Management
    accountSize: 'KONTOGRÖSSE',
    riskPercent: 'RISIKO %',
    entryPrice: 'EINSTIEGSPREIS',
    stopLoss: 'STOP LOSS',
    takeProfit: 'TAKE PROFIT',
    lotSizeCalc: 'LOT SIZE RECHNER',
    recommendedLotSize: 'EMPFOHLENE LOT SIZE',
    standardLots: 'Standard Lots',
    miniLots: 'MINI LOTS',
    microLots: 'MICRO LOTS',
    units: 'EINHEITEN',
    riskAmount: 'RISIKO $',
    slPips: 'SL PIPS',
    tpPips: 'TP PIPS',
    potentialProfit: 'POTENZIELLER GEWINN',
    rrRatio: 'R:R VERHÄLTNIS',
    quickRisk: 'SCHNELLE RISIKO-AUSWAHL',
    lotSizeInfo: 'Berechne deine exakte Lot Size basierend auf deinem Risiko. Gib Entry & Stop Loss ein, um die empfohlene Position zu sehen.',
    enterEntryAndSL: 'Gib Entry Preis und Stop Loss ein, um deine Lot Size zu berechnen',
    minRRWarning: 'ZNPCV empfiehlt mindestens 1:2.5 R:R Verhältnis',
    goodRR: 'Gutes Risk:Reward Verhältnis!',
    tradeLevels: 'TRADE LEVELS',
    
    // Checklist specific
    assetDirection: 'ASSET & RICHTUNG',
    selectPairDirection: 'Wähle dein Handelspaar und die Trade-Richtung',
    goldenRules: 'ZNPCV GOLDENE REGELN',
    longBuyRule: 'Wir kaufen IM AOI oder ÜBER dem AOI (Support)',
    shortSellRule: 'Wir verkaufen IM AOI oder UNTER dem AOI (Resistance)',
    neverBottomTop: 'NIE AM BODEN VERKAUFEN! NIE AM TOP KAUFEN!',
    selectDirection: 'WÄHLE DEINE RICHTUNG',
    buyInAoi: 'Kaufen im/über AOI',
    sellInAoi: 'Verkaufen im/unter AOI',
    weeklyAnalysis: 'WEEKLY ANALYSE',
    weeklyConfirm: 'Weekly Timeframe Confirmations (max 60%)',
    weeklyScore: 'WEEKLY SCORE',
    atAoiRejected: 'AT AOI / REJECTED',
    atAoiDesc: 'Preis ist am AOI ODER Preis lehnt AOI ab',
    touchingEma: 'TOUCHING / REJECTING EMA',
    touchingEmaDesc: 'Kerzen berühren ODER lehnen den EMA ab',
    candlestickRejection: 'CANDLESTICK REJECTION',
    candlestickDesc: 'Kerze zeigt klare Ablehnung (Pinbar, Doji, Hammer)',
    rejectionPsp: 'REJECTION FROM PSP',
    rejectionPspDesc: 'Ablehnung vom Previous Structure Point',
    roundLevel: 'ROUND PSYCH LEVEL',
    roundLevelDesc: 'Preis ist an ODER lehnt runde Zahl ab',
    swingHighLow: 'SWING HIGH / SWING LOW',
    swingDesc: 'Preis ist bei Swing High ODER Swing Low angekommen',
    patternWeekly: 'PATTERN (WEEKLY)',
    patternDesc: 'Double Top/Bottom, Normal/Inverted H&S',
    dailyAnalysis: 'DAILY ANALYSE',
    dailyConfirm: 'Daily Timeframe Confirmations (max 60%)',
    dailyScore: 'DAILY SCORE',
    h4Analysis: '4H ANALYSE',
    h4Confirm: 'Lower Timeframe Confirmation (max 35%)',
    h4Score: '4H SCORE',
    entryChecklist: 'ENTRY CHECKLIST',
    entryConfirm: 'Entry Confirmations (max 25%)',
    entryTimeframe: 'ENTRY TIMEFRAME',
    entryTimeframeDesc: '30 Minuten bis 1 Stunde (30min - 1H)',
    entryScoreLabel: 'ENTRY SCORE',
    mssShift: 'MSS - MARKET STRUCTURE SHIFT',
    mssDesc: 'Shift of Structure / Marktstruktur hat gewechselt (30min-1hr)',
    engulfingCandle: 'ENGULFING CANDLESTICK',
    engulfingDesc: 'Engulfing Kerze nach Pullback sichtbar (Reversal Confirmation)',
    patternIfAny: 'PATTERN (IF THERE IS ONE)',
    patternIfAnyDesc: 'Falls ein Pattern auf Entry TF sichtbar ist',
    entryTrigger: 'ENTRY TRIGGER TYP',
    pinbarRejection: 'PINBAR REJECTION',
    engulfing: 'ENGULFING',
    riskManagementTitle: 'RISK MANAGEMENT',
    riskManagementSubtitle: 'Position Sizing & Lot Size Calculator',
    finalCheckTitle: 'FINAL CHECK',
    finalCheckSubtitle: 'Letzte Bestätigung vor dem Trade',
    confirmRule: 'BESTÄTIGE DIE ZNPCV REGEL',
    buyInAboveAoi: 'ICH KAUFE IM ODER ÜBER DEM AOI',
    notBuyResistance: 'Ich kaufe NICHT am Widerstand / Top',
    sellInBelowAoi: 'ICH VERKAUFE IM ODER UNTER DEM AOI',
    notSellSupport: 'Ich verkaufe NICHT an der Unterstützung / Boden',
    selectDirFirst: 'Wähle zuerst eine Richtung im ersten Schritt',
    tradeSummary: 'TRADE ZUSAMMENFASSUNG',
    notesOptional: 'NOTIZEN (OPTIONAL)',
    notesPlaceholderLong: 'Trade Notizen, Beobachtungen...',
    readyToTradeLabel: 'BEREIT ZUM HANDELN',
    notRecommended: 'ZNPCV empfiehlt NICHT zu traden (min. 85%)',
    pointsBreakdown: 'PUNKTE BREAKDOWN',
    total: 'GESAMT',
    saveTrade: 'TRADE SPEICHERN',
    warningScore: 'Dein Score ist unter 85%. Nach ZNPCV Standard solltest du diesen Trade NICHT eingehen.',
    doNotEnter: 'TRADE NICHT EINGEHEN',
    saveAnyway: 'Trotzdem speichern',
    
    // Pattern names
    dblTop: 'DBL TOP',
    dblBtm: 'DBL BTM',
    hs: 'H&S',
    invHs: 'INV H&S',
    none: 'KEIN',
  },
  en: {
    // Header
    online: 'ONLINE',
    localTime: 'LOCAL TIME',
    
    // Home
    ultimateChecklist: 'ULTIMATE CHECKLIST',
    heroSubtitle: 'The ultimate trading checklist that has ever existed.',
    heroDesc: 'Professional Multi-Timeframe Analysis • Structured Decision Making • Maximum Discipline',
    newAnalysis: 'NEW ANALYSIS',
    newAnalysisDesc: 'Start your professional multi-timeframe analysis with the ultimate ZNPCV checklist',
    startNow: 'Start now',
    dashboard: 'DASHBOARD',
    dashboardDesc: 'Overview of your analyses, performance tracking and detailed statistics',
    openDashboard: 'Open',
    
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
    worldwide: 'WORLDWIDE',
    contact: 'CONTACT',
    faqHelp: 'FAQ & HELP',
    footerDesc: 'The ultimate trading checklist for professional traders. Developed for maximum discipline and consistent results.',
    riskWarning: 'Trading involves risks. Past results are no guarantee of future profits.',
    allRights: 'All rights reserved.',
    
    // Checklist
    selectAsset: 'SELECT PAIR',
    selectAssetDesc: 'WHICH PAIR DO YOU WANT TO TRADE?',
    trendAnalysis: 'TREND ANALYSIS',
    trendAnalysisDesc: 'CHECK ALL 3 TIMEFRAMES',
    weekly: 'WEEKLY',
    daily: 'DAILY',
    fourHour: '4 HOUR',
    mainTrend: 'Main trend',
    midTerm: 'Mid-term',
    shortTerm: 'Short-term',
    bullish: 'BULLISH',
    bearish: 'BEARISH',
    confluence: 'CONFLUENCE',
    noConfluence: 'NO CONFLUENCE',
    allTimeframes: 'All timeframes show',
    dailyH4Sync: 'DAILY & 4H SYNC',
    higherProbability: 'Higher probability for a successful trade!',
    confluenceTooltip: 'Confluence means all timeframes (Weekly, Daily, 4H) point in the same direction. This increases the probability of success.',
    
    // AOI
    aoi: 'AREA OF INTEREST',
    aoiDesc: 'CHECK AOI ZONE',
    aoiDrawn: 'AOI MARKED',
    aoiDrawnDesc: 'Have you marked your Area of Interest in the chart?',
    priceInAoi: 'PRICE IN AOI',
    priceInAoiDesc: 'Is the current price in your AOI zone?',
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
    emaRespectedDesc: 'Price has respected the moving average',
    structureConfirmed: 'STRUCTURE CONFIRMED',
    
    // Patterns
    patterns: 'CHART PATTERNS',
    patternsDesc: 'ONLY OUR PATTERNS',
    headShoulders: 'HEAD & SHOULDERS',
    invHeadShoulders: 'INVERSE HEAD & SHOULDERS',
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
    mssConfirmedDesc: 'Market Structure Shift - Price has reversed (Bullish → Bearish or vice versa)',
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
    readyToTradeShort: 'READY',
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
    
    // Warning
    warningTitle: 'WARNING - NOT AN A+++ TRADE',
    warningDesc: 'Your checklist is below 85%. According to ZNPCV standards, you should only enter A+++ trades. Review all criteria again or skip this trade.',
    warningButton: 'DO NOT ENTER TRADE',
    proceedAnyway: 'Proceed anyway',
    aPlusTradeOnly: 'A+++ TRADES ONLY',
    
    // Additional translations
    features: 'FEATURES',
    featuresDesc: 'Professional Trading Tools',
    znpcvStandard: 'ZNPCV STANDARD',
    stepChecklist: 'STEP CHECKLIST',
    chartPatterns: 'CHART PATTERNS',
    tradingTools: 'THE ULTIMATE TRADING TOOL',
    philosophy: 'ZNPCV PHILOSOPHY',
    disciplineQuote: 'Discipline beats talent. Every. Single. Day.',
    
    // Risk Management
    accountSize: 'ACCOUNT SIZE',
    riskPercent: 'RISK %',
    entryPrice: 'ENTRY PRICE',
    stopLoss: 'STOP LOSS',
    takeProfit: 'TAKE PROFIT',
    lotSizeCalc: 'LOT SIZE CALCULATOR',
    recommendedLotSize: 'RECOMMENDED LOT SIZE',
    standardLots: 'Standard Lots',
    miniLots: 'MINI LOTS',
    microLots: 'MICRO LOTS',
    units: 'UNITS',
    riskAmount: 'RISK $',
    slPips: 'SL PIPS',
    tpPips: 'TP PIPS',
    potentialProfit: 'POTENTIAL PROFIT',
    rrRatio: 'R:R RATIO',
    quickRisk: 'QUICK RISK SELECTION',
    lotSizeInfo: 'Calculate your exact lot size based on your risk. Enter Entry & Stop Loss to see the recommended position.',
    enterEntryAndSL: 'Enter Entry Price and Stop Loss to calculate your Lot Size',
    minRRWarning: 'ZNPCV recommends at least 1:2.5 R:R ratio',
    goodRR: 'Good Risk:Reward ratio!',
    tradeLevels: 'TRADE LEVELS',
    
    // Checklist specific
    assetDirection: 'ASSET & DIRECTION',
    selectPairDirection: 'Select your trading pair and trade direction',
    goldenRules: 'ZNPCV GOLDEN RULES',
    longBuyRule: 'We buy IN the AOI or ABOVE the AOI (Support)',
    shortSellRule: 'We sell IN the AOI or BELOW the AOI (Resistance)',
    neverBottomTop: 'NEVER SELL AT THE BOTTOM! NEVER BUY AT THE TOP!',
    selectDirection: 'SELECT YOUR DIRECTION',
    buyInAoi: 'Buy in/above AOI',
    sellInAoi: 'Sell in/below AOI',
    weeklyAnalysis: 'WEEKLY ANALYSIS',
    weeklyConfirm: 'Weekly Timeframe Confirmations (max 60%)',
    weeklyScore: 'WEEKLY SCORE',
    atAoiRejected: 'AT AOI / REJECTED',
    atAoiDesc: 'Price is at AOI OR Price rejects AOI',
    touchingEma: 'TOUCHING / REJECTING EMA',
    touchingEmaDesc: 'Candles touch OR reject the EMA',
    candlestickRejection: 'CANDLESTICK REJECTION',
    candlestickDesc: 'Candle shows clear rejection (Pinbar, Doji, Hammer)',
    rejectionPsp: 'REJECTION FROM PSP',
    rejectionPspDesc: 'Rejection from Previous Structure Point',
    roundLevel: 'ROUND PSYCH LEVEL',
    roundLevelDesc: 'Price is at OR rejects round number',
    swingHighLow: 'SWING HIGH / SWING LOW',
    swingDesc: 'Price has reached Swing High OR Swing Low',
    patternWeekly: 'PATTERN (WEEKLY)',
    patternDesc: 'Double Top/Bottom, Normal/Inverted H&S',
    dailyAnalysis: 'DAILY ANALYSIS',
    dailyConfirm: 'Daily Timeframe Confirmations (max 60%)',
    dailyScore: 'DAILY SCORE',
    h4Analysis: '4H ANALYSIS',
    h4Confirm: 'Lower Timeframe Confirmation (max 35%)',
    h4Score: '4H SCORE',
    entryChecklist: 'ENTRY CHECKLIST',
    entryConfirm: 'Entry Confirmations (max 25%)',
    entryTimeframe: 'ENTRY TIMEFRAME',
    entryTimeframeDesc: '30 Minutes to 1 Hour (30min - 1H)',
    entryScoreLabel: 'ENTRY SCORE',
    mssShift: 'MSS - MARKET STRUCTURE SHIFT',
    mssDesc: 'Shift of Structure / Market structure has shifted (30min-1hr)',
    engulfingCandle: 'ENGULFING CANDLESTICK',
    engulfingDesc: 'Engulfing candle visible after pullback (Reversal Confirmation)',
    patternIfAny: 'PATTERN (IF THERE IS ONE)',
    patternIfAnyDesc: 'If a pattern is visible on Entry TF',
    entryTrigger: 'ENTRY TRIGGER TYPE',
    pinbarRejection: 'PINBAR REJECTION',
    engulfing: 'ENGULFING',
    riskManagementTitle: 'RISK MANAGEMENT',
    riskManagementSubtitle: 'Position Sizing & Lot Size Calculator',
    finalCheckTitle: 'FINAL CHECK',
    finalCheckSubtitle: 'Final confirmation before the trade',
    confirmRule: 'CONFIRM THE ZNPCV RULE',
    buyInAboveAoi: 'I BUY IN OR ABOVE THE AOI',
    notBuyResistance: 'I do NOT buy at resistance / top',
    sellInBelowAoi: 'I SELL IN OR BELOW THE AOI',
    notSellSupport: 'I do NOT sell at support / bottom',
    selectDirFirst: 'Select a direction in the first step first',
    tradeSummary: 'TRADE SUMMARY',
    notesOptional: 'NOTES (OPTIONAL)',
    notesPlaceholderLong: 'Trade notes, observations...',
    readyToTradeLabel: 'READY TO TRADE',
    notRecommended: 'ZNPCV recommends NOT to trade (min. 85%)',
    pointsBreakdown: 'POINTS BREAKDOWN',
    total: 'TOTAL',
    saveTrade: 'SAVE TRADE',
    warningScore: 'Your score is below 85%. According to ZNPCV standard, you should NOT enter this trade.',
    doNotEnter: 'DO NOT ENTER TRADE',
    saveAnyway: 'Save anyway',
    
    // Pattern names
    dblTop: 'DBL TOP',
    dblBtm: 'DBL BTM',
    hs: 'H&S',
    invHs: 'INV H&S',
    none: 'NONE',
  },
  fa: {
    // Header
    online: 'آنلاین',
    localTime: 'ساعت محلی',
    
    // Home
    ultimateChecklist: 'چک‌لیست نهایی',
    heroSubtitle: 'بهترین چک‌لیست معاملاتی که تا به حال وجود داشته است.',
    heroDesc: 'تحلیل چند تایم‌فریم حرفه‌ای • تصمیم‌گیری ساختاریافته • حداکثر انضباط',
    newAnalysis: 'تحلیل جدید',
    newAnalysisDesc: 'تحلیل چند تایم‌فریم حرفه‌ای خود را با چک‌لیست نهایی ZNPCV شروع کنید',
    startNow: 'شروع کنید',
    dashboard: 'داشبورد',
    dashboardDesc: 'نمای کلی تحلیل‌ها، پیگیری عملکرد و آمار دقیق',
    openDashboard: 'باز کردن',
    
    // Market Sessions
    marketSessions: 'جلسات بازار',
    open: 'باز',
    closed: 'بسته',
    
    // Assets
    forex: 'فارکس',
    crypto: 'کریپتو',
    stocks: 'سهام',
    commodities: 'کالاها',
    indices: 'شاخص‌ها',
    
    // Features
    preciseAnalysis: 'تحلیل دقیق',
    preciseAnalysisDesc: 'سیستم هم‌پوشانی W-D-4H برای حداکثر دقت',
    riskManagement: 'مدیریت ریسک',
    riskManagementDesc: 'ارزیابی R:R یکپارچه و برنامه‌ریزی SL/TP',
    performanceTracking: 'پیگیری عملکرد',
    performanceTrackingDesc: 'آمار دقیق و نرخ موفقیت',
    
    // Footer
    sslEncrypted: 'رمزگذاری SSL',
    gdprCompliant: 'مطابق GDPR',
    dataProtection: 'حفاظت داده',
    worldwide: 'جهانی',
    contact: 'تماس',
    faqHelp: 'سوالات متداول و راهنما',
    footerDesc: 'چک‌لیست نهایی معاملاتی برای معامله‌گران حرفه‌ای. طراحی شده برای حداکثر انضباط و نتایج پایدار.',
    riskWarning: 'معامله‌گری شامل ریسک است. نتایج گذشته تضمینی برای سود آینده نیست.',
    allRights: 'تمامی حقوق محفوظ است.',
    
    // Checklist
    selectAsset: 'انتخاب جفت ارز',
    selectAssetDesc: 'کدام جفت ارز را می‌خواهید معامله کنید؟',
    trendAnalysis: 'تحلیل روند',
    trendAnalysisDesc: 'هر ۳ تایم‌فریم را بررسی کنید',
    weekly: 'هفتگی',
    daily: 'روزانه',
    fourHour: '۴ ساعته',
    mainTrend: 'روند اصلی',
    midTerm: 'میان‌مدت',
    shortTerm: 'کوتاه‌مدت',
    bullish: 'صعودی',
    bearish: 'نزولی',
    confluence: 'هم‌پوشانی',
    noConfluence: 'بدون هم‌پوشانی',
    allTimeframes: 'همه تایم‌فریم‌ها نشان می‌دهند',
    dailyH4Sync: 'همگام روزانه و ۴ ساعته',
    higherProbability: 'احتمال بالاتر برای معامله موفق!',
    confluenceTooltip: 'هم‌پوشانی یعنی همه تایم‌فریم‌ها (هفتگی، روزانه، ۴ ساعته) در یک جهت هستند. این احتمال موفقیت را افزایش می‌دهد.',
    
    // AOI
    aoi: 'منطقه مورد علاقه',
    aoiDesc: 'منطقه AOI را بررسی کنید',
    aoiDrawn: 'AOI مشخص شده',
    aoiDrawnDesc: 'آیا منطقه مورد علاقه خود را در چارت مشخص کرده‌اید؟',
    priceInAoi: 'قیمت در AOI',
    priceInAoiDesc: 'آیا قیمت فعلی در منطقه AOI شما است؟',
    pricePosition: 'موقعیت قیمت نسبت به AOI',
    aboveAoi: 'بالای AOI',
    belowAoi: 'پایین AOI',
    shortSetup: '= ستاپ فروش',
    longSetup: '= ستاپ خرید',
    
    // Structure
    structureCheck: 'بررسی ساختار',
    structureCheckDesc: 'PSS و EMA را بررسی کنید',
    pssRejected: 'PSS رد شده',
    pssRejectedDesc: 'ساختار قبلی (حمایت/مقاومت) احترام گذاشته و رد شده',
    emaRespected: 'EMA احترام گذاشته شده',
    emaRespectedDesc: 'قیمت میانگین متحرک را احترام گذاشته',
    structureConfirmed: 'ساختار تایید شده',
    
    // Patterns
    patterns: 'الگوهای چارت',
    patternsDesc: 'فقط الگوهای ما',
    headShoulders: 'سر و شانه',
    invHeadShoulders: 'سر و شانه معکوس',
    doubleTop: 'سقف دوقلو',
    doubleBottom: 'کف دوقلو',
    patternIdentified: 'الگو شناسایی شده',
    patternIdentifiedDesc: 'یکی از ۴ الگوی ما در چارت قابل مشاهده است',
    patternConfirmed: 'الگو تایید شده',
    patternConfirmedDesc: 'الگو کامل و معتبر است',
    
    // Entry
    entryConfirmation: 'تایید ورود',
    entryConfirmationDesc: 'MSS و ENGULFING (۳۰ دقیقه - ۱ ساعت)',
    mssConfirmed: 'MSS / SOS تایید شده',
    mssConfirmedDesc: 'تغییر ساختار بازار - قیمت چرخیده (صعودی → نزولی یا برعکس)',
    engulfingAfterPullback: 'ENGULFING پس از پولبک',
    engulfingQuestion: 'آیا کندل پس از پولبک بلعیده می‌شود؟',
    blueEngulfing: 'ENGULFING آبی',
    redEngulfing: 'ENGULFING قرمز',
    longEntry: '= ورود خرید',
    shortEntry: '= ورود فروش',
    noEngulfing: 'بدون ENGULFING',
    entrySignalConfirmed: 'سیگنال ورود تایید شده',
    
    // Final
    finalCheck: 'بررسی نهایی',
    finalCheckDesc: 'قوانین مهم',
    importantRules: 'قوانین مهم',
    notBuyingResistance: 'در مقاومت خرید نکنید',
    notBuyingResistanceDesc: 'من در مقاومت خرید نمی‌کنم',
    notSellingSupport: 'در حمایت فروش نکنید',
    notSellingSupportDesc: 'من در حمایت فروش نمی‌کنم',
    summary: 'خلاصه',
    pair: 'جفت ارز',
    trend: 'روند',
    mixed: 'مختلط',
    inAoi: 'در AOI',
    entry: 'ورود',
    notes: 'یادداشت‌ها',
    notesPlaceholder: 'یادداشت‌های معامله...',
    readyToTrade: 'آماده معامله',
    allConfirmed: 'همه تاییدیه‌ها انجام شده!',
    
    // Navigation
    back: 'قبلی',
    next: 'بعدی',
    save: 'ذخیره',
    saving: 'در حال ذخیره...',
    loading: 'در حال بارگذاری...',
    
    // Dashboard
    tradingDashboard: 'داشبورد معاملات',
    overviewStats: 'نمای کلی و عملکرد',
    totalAnalyses: 'کل تحلیل‌ها',
    readyToTradeShort: 'آماده',
    inProgress: 'در حال انجام',
    withConfluence: 'با هم‌پوشانی',
    activity30Days: 'فعالیت (۳۰ روز)',
    lastAnalyses: 'آخرین تحلیل‌ها',
    of: 'از',
    noAnalyses: 'بدون تحلیل',
    startFirstAnalysis: 'اولین تحلیل را شروع کنید',
    direction: 'جهت',
    long: 'خرید',
    short: 'فروش',
    calendar: 'تقویم',
    avgCompletion: 'میانگین تکمیل',
    
    // Quotes
    quote1: '"معامله‌ات را برنامه‌ریزی کن، برنامه‌ات را معامله کن."',
    quote2: '"انضباط موفقیت یا شکست را تعیین می‌کند."',
    quote3: '"ما در مقاومت نمی‌خریم، در حمایت نمی‌فروشیم."',
    quote4: '"صبر کلید موفقیت در معامله‌گری است."',
    quote5: '"مدیریت ریسک مهم‌تر از حداکثر کردن سود است."',
    
    // Warning
    warningTitle: 'هشدار - معامله A+++ نیست',
    warningDesc: 'چک‌لیست شما زیر ۸۵٪ است. طبق استاندارد ZNPCV فقط باید وارد معاملات A+++ شوید. همه معیارها را دوباره بررسی کنید یا این معامله را رد کنید.',
    warningButton: 'وارد معامله نشوید',
    proceedAnyway: 'به هر حال ادامه دهید',
    aPlusTradeOnly: 'فقط معاملات A+++',
    
    // Additional translations
    features: 'ویژگی‌ها',
    featuresDesc: 'ابزارهای معاملاتی حرفه‌ای',
    znpcvStandard: 'استاندارد ZNPCV',
    stepChecklist: 'چک‌لیست مراحل',
    chartPatterns: 'الگوهای نموداری',
    tradingTools: 'ابزار نهایی معاملات',
    philosophy: 'فلسفه ZNPCV',
    disciplineQuote: 'انضباط استعداد را شکست می‌دهد. هر. روز.',
    
    // Risk Management
    accountSize: 'اندازه حساب',
    riskPercent: 'ریسک %',
    entryPrice: 'قیمت ورود',
    stopLoss: 'حد ضرر',
    takeProfit: 'حد سود',
    lotSizeCalc: 'محاسبه‌گر لات',
    recommendedLotSize: 'لات پیشنهادی',
    standardLots: 'لات استاندارد',
    miniLots: 'مینی لات',
    microLots: 'میکرو لات',
    units: 'واحد',
    riskAmount: 'مقدار ریسک $',
    slPips: 'پیپ SL',
    tpPips: 'پیپ TP',
    potentialProfit: 'سود بالقوه',
    rrRatio: 'نسبت R:R',
    quickRisk: 'انتخاب سریع ریسک',
    lotSizeInfo: 'لات دقیق خود را بر اساس ریسک محاسبه کنید. Entry و Stop Loss را وارد کنید.',
    enterEntryAndSL: 'قیمت ورود و حد ضرر را وارد کنید تا لات محاسبه شود',
    minRRWarning: 'ZNPCV حداقل نسبت 1:2.5 را توصیه می‌کند',
    goodRR: 'نسبت ریسک به ریوارد خوب!',
    tradeLevels: 'سطوح معامله',
    
    // Checklist specific
    assetDirection: 'دارایی و جهت',
    selectPairDirection: 'جفت ارز و جهت معامله را انتخاب کنید',
    goldenRules: 'قوانین طلایی ZNPCV',
    longBuyRule: 'ما در AOI یا بالای AOI خرید می‌کنیم (حمایت)',
    shortSellRule: 'ما در AOI یا زیر AOI می‌فروشیم (مقاومت)',
    neverBottomTop: 'هرگز در کف نفروشید! هرگز در سقف نخرید!',
    selectDirection: 'جهت را انتخاب کنید',
    buyInAoi: 'خرید در/بالای AOI',
    sellInAoi: 'فروش در/زیر AOI',
    weeklyAnalysis: 'تحلیل هفتگی',
    weeklyConfirm: 'تاییدیه‌های تایم‌فریم هفتگی (حداکثر ۶۰٪)',
    weeklyScore: 'امتیاز هفتگی',
    atAoiRejected: 'در AOI / رد شده',
    atAoiDesc: 'قیمت در AOI است یا AOI را رد می‌کند',
    touchingEma: 'لمس / رد EMA',
    touchingEmaDesc: 'کندل‌ها EMA را لمس یا رد می‌کنند',
    candlestickRejection: 'رد کندل',
    candlestickDesc: 'کندل رد واضح نشان می‌دهد (Pinbar، Doji، Hammer)',
    rejectionPsp: 'رد از PSP',
    rejectionPspDesc: 'رد از نقطه ساختار قبلی',
    roundLevel: 'سطح روانی گرد',
    roundLevelDesc: 'قیمت در عدد گرد است یا آن را رد می‌کند',
    swingHighLow: 'سقف / کف سوئینگ',
    swingDesc: 'قیمت به سقف یا کف سوئینگ رسیده است',
    patternWeekly: 'الگو (هفتگی)',
    patternDesc: 'سقف/کف دوقلو، سر و شانه معمولی/معکوس',
    dailyAnalysis: 'تحلیل روزانه',
    dailyConfirm: 'تاییدیه‌های تایم‌فریم روزانه (حداکثر ۶۰٪)',
    dailyScore: 'امتیاز روزانه',
    h4Analysis: 'تحلیل ۴ ساعته',
    h4Confirm: 'تاییدیه تایم‌فریم پایین (حداکثر ۳۵٪)',
    h4Score: 'امتیاز ۴ ساعته',
    entryChecklist: 'چک‌لیست ورود',
    entryConfirm: 'تاییدیه‌های ورود (حداکثر ۲۵٪)',
    entryTimeframe: 'تایم‌فریم ورود',
    entryTimeframeDesc: '۳۰ دقیقه تا ۱ ساعت',
    entryScoreLabel: 'امتیاز ورود',
    mssShift: 'MSS - تغییر ساختار بازار',
    mssDesc: 'تغییر ساختار / ساختار بازار تغییر کرده است',
    engulfingCandle: 'کندل انگالفینگ',
    engulfingDesc: 'کندل انگالفینگ بعد از پولبک (تایید برگشت)',
    patternIfAny: 'الگو (در صورت وجود)',
    patternIfAnyDesc: 'اگر الگویی در تایم‌فریم ورود وجود دارد',
    entryTrigger: 'نوع تریگر ورود',
    pinbarRejection: 'رد پین‌بار',
    engulfing: 'انگالفینگ',
    riskManagementTitle: 'مدیریت ریسک',
    riskManagementSubtitle: 'اندازه‌گیری پوزیشن و محاسبه‌گر لات',
    finalCheckTitle: 'بررسی نهایی',
    finalCheckSubtitle: 'تایید نهایی قبل از معامله',
    confirmRule: 'قانون ZNPCV را تایید کنید',
    buyInAboveAoi: 'من در یا بالای AOI می‌خرم',
    notBuyResistance: 'من در مقاومت / سقف نمی‌خرم',
    sellInBelowAoi: 'من در یا زیر AOI می‌فروشم',
    notSellSupport: 'من در حمایت / کف نمی‌فروشم',
    selectDirFirst: 'ابتدا جهت را در مرحله اول انتخاب کنید',
    tradeSummary: 'خلاصه معامله',
    notesOptional: 'یادداشت‌ها (اختیاری)',
    notesPlaceholderLong: 'یادداشت‌های معامله، مشاهدات...',
    readyToTradeLabel: 'آماده معامله',
    notRecommended: 'ZNPCV توصیه می‌کند معامله نکنید (حداقل ۸۵٪)',
    pointsBreakdown: 'تفکیک امتیازات',
    total: 'مجموع',
    saveTrade: 'ذخیره معامله',
    warningScore: 'امتیاز شما زیر ۸۵٪ است. طبق استاندارد ZNPCV نباید وارد این معامله شوید.',
    doNotEnter: 'وارد معامله نشوید',
    saveAnyway: 'به هر حال ذخیره کنید',
    
    // Pattern names
    dblTop: 'سقف دوقلو',
    dblBtm: 'کف دوقلو',
    hs: 'سر و شانه',
    invHs: 'سر و شانه معکوس',
    none: 'هیچ',
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

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('znpcv_darkmode') !== 'false';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('znpcv_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('znpcv_darkmode', darkMode.toString());
  }, [darkMode]);

  const t = (key) => translations[language][key] || key;
  
  const toggleLanguage = () => {
    const langs = ['de', 'en', 'fa'];
    const currentIndex = langs.indexOf(language);
    setLanguage(langs[(currentIndex + 1) % langs.length]);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  const isRTL = language === 'fa';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRTL, darkMode, setDarkMode, toggleDarkMode }}>
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
  const { language, setLanguage, darkMode } = useLanguage();
  
  return (
    <div className={`flex items-center gap-1 rounded-lg p-1 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
      {['de', 'en', 'fa'].map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-2 py-1 text-xs tracking-wider rounded transition-colors ${
            language === lang 
              ? darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white'
              : darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useLanguage();
  
  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg transition-colors ${
        darkMode 
          ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' 
          : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
      }`}
      title={darkMode ? 'Light Mode' : 'Dark Mode'}
    >
      {darkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )}
    </button>
  );
}