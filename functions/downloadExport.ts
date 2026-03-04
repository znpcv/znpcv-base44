import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const EXPORT_CONTENT = `# ZNPCV TRADING CHECKLIST — VOLLSTÄNDIGER REBUILD-EXPORT

**MODE = BACKEND_RESTRICTED_EXPORT**
*Begründung: Backend-Funktionen sind auf dem aktuellen Plan deaktiviert; Quellcode nicht zugreifbar — vollständige Rebuild-Spezifikation wird stattdessen geliefert.*

---

## ABSCHNITT 1: APP ÜBERSICHT

| Feld | Wert |
|------|------|
| App-Name | ZNPCV Trading Checklist |
| Build-Plattform | React + Vite + Tailwind CSS + Deno Backend |
| Betreiber | Zainspective Group |
| Support-E-Mail | support@znpcv.com |
| Sprachen | DE, EN, ZH, ES, FR, HI, JA, PT, AR (RTL: AR) |
| Default-Sprache | Deutsch (de) |
| Default-Theme | Dark Mode |
| PII-Daten | JA — Name, E-Mail, Telefon, Adresse, Profilbild-URL, Geo-IP-Nutzung implizit |
| Auth-Modell | JWT-basiert (keine eigene OAuth-Implementierung) |

### Kern-Journeys

1. **Analyse erstellen** → Checklist ausfüllen (7 Schritte) → Score berechnen → Speichern
2. **Trade verwalten** → Dashboard → Trade History → Trade Detail → Ergebnis eintragen
3. **No-Trade entscheiden** → NoTrade-Signal im Final-Step → Log erstellen → Dashboard
4. **Performance auswerten** → Dashboard (Charts, Kalender, Statistiken)
5. **Account verwalten** → Profil, Benachrichtigungen, 2FA, Account löschen

### Rollen

| Rolle | Rechte |
|-------|--------|
| \`user\` | Alle eigenen TradeChecklists + NoTradeLogs CRUD; eigenes User-Profil |
| \`admin\` | Alles von user + alle User-Daten lesen; Export-Funktionen ausführen; Benachrichtigungen versenden |

### Kritische Daten

| Entität | PII | Sensitivität |
|---------|-----|-------------|
| User (built-in) | Name, E-Mail, Tel, Adresse, Profilbild | HOCH |
| TradeChecklist | Finanzdaten (Entry/SL/TP/PnL, Account-Größe) | MITTEL |
| NoTradeLog | Pair, Score | NIEDRIG |
| PushSubscription | endpoint + Keys, device_info | MITTEL |
| Notification | user_email, Inhalt | MITTEL |

---

## ABSCHNITT 2: ROUTE / PAGE MAP

### Vollständige Route-Liste

| Route | page_name | Zugriff | Beschreibung |
|-------|-----------|---------|-------------|
| \`/\` | Home | Öffentlich | Landing/Startseite |
| \`/Checklist\` | Checklist | Auth empfohlen | 7-Step Trading-Checkliste |
| \`/Checklist?id=<uuid>\` | Checklist | Auth (RLS) | Bestehende Analyse bearbeiten |
| \`/Dashboard\` | Dashboard | Auth | Performance-Übersicht |
| \`/TradeHistory\` | TradeHistory | Auth | Alle Trades Liste + Filter |
| \`/TradeDetail?id=<uuid>\` | TradeDetail | Auth (RLS) | Einzelner Trade-Detail |
| \`/Account\` | Account | Auth | Benutzerprofil verwalten |
| \`/FAQ\` | FAQ | Öffentlich | Accordion-FAQ |
| \`/Trash\` | Trash | Auth | Soft-gelöschte Trades |
| \`/Impressum\` | Impressum | Öffentlich | Rechtliches Impressum |
| \`/Datenschutz\` | Datenschutz | Öffentlich | Datenschutzerklärung |
| \`/AGB\` | AGB | Öffentlich | Allgemeine Geschäftsbedingungen |
| \`/Register\` | Register | Öffentlich | Registrierungsseite |
| \`/CodeExport\` | CodeExport | Auth/Admin | Interner Code-Export |
| \`/Integrations\` | Integrations | Auth | Integration-Status-Seite |

---

## ABSCHNITT 3: FRONTEND REBUILD SPEC

### Framework & Libraries

| Library | Version | Verwendung |
|---------|---------|-----------|
| React | ^18.2.0 | Core Framework |
| Vite | (Build Tool) | Build |
| Tailwind CSS | ^3.x | Styling |
| shadcn/ui | alle Komponenten | UI-Components |
| lucide-react | ^0.475.0 | Icons |
| framer-motion | ^11.16.4 | Animationen |
| react-router-dom | ^6.26.0 | Routing |
| @tanstack/react-query | ^5.84.1 | Data Fetching |
| recharts | ^2.15.4 | Charts |
| date-fns | ^3.6.0 | Datum-Formatierung |
| @base44/sdk | ^0.8.3 | Backend-Client |

### Theme-System

\`\`\`javascript
// Dark Mode (default):
const theme = {
  bg:            '#000000',
  bgSecondary:   '#09090B',
  bgCard:        '#18181B',
  text:          '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted:     '#71717A',
  textDimmed:    '#52525B',
  border:        'rgba(39,39,42,0.50)',
  borderCard:    '#27272A',
}

// Light Mode:
const theme = {
  bg:            '#FFFFFF',
  bgSecondary:   '#F4F4F5',
  bgCard:        '#FAFAFA',
  text:          '#18181B',
  textSecondary: '#52525B',
  textMuted:     '#71717A',
  textDimmed:    '#A1A1AA',
  border:        '#E4E4E7',
  borderCard:    '#D4D4D8',
}
\`\`\`

### Score-System (exakt)

\`\`\`javascript
weeklyScore =
  (w_at_aoi       ? 10 : 0) +
  (w_ema_touch    ?  5 : 0) +
  (w_candlestick  ? 10 : 0) +
  (w_psp_rejection? 10 : 0) +
  (w_round_level  ?  5 : 0) +
  (w_swing        ? 10 : 0) +
  (w_pattern && w_pattern !== 'none' ? 10 : 0)  // max 60

dailyScore =
  (d_at_aoi       ? 10 : 0) +
  (d_ema_touch    ?  5 : 0) +
  (d_candlestick  ? 10 : 0) +
  (d_psp_rejection? 10 : 0) +
  (d_round_level  ?  5 : 0) +
  (d_swing        ?  5 : 0) +  // ACHTUNG: 5, nicht 10!
  (d_pattern && d_pattern !== 'none' ? 10 : 0)  // max 60

h4Score =
  (h4_at_aoi         ?  5 : 0) +
  (h4_candlestick    ? 10 : 0) +
  (h4_psp_rejection  ?  5 : 0) +
  (h4_swing          ?  5 : 0) +
  (h4_pattern && h4_pattern !== 'none' ? 10 : 0)  // max 35

entryScore =
  (entry_sos          ? 10 : 0) +
  (entry_engulfing    ? 10 : 0) +
  (entry_pattern && entry_pattern !== 'none' ? 5 : 0)  // max 25

progress = weeklyScore + dailyScore + h4Score + entryScore  // max 180

// Grades:
// >= 100: A+++ (emerald-700 #047857)
// >=  90: A++  (teal-500)
// >=  85: A+   (blue-500)
// >=  70: OK   (amber-500)
//  <  70: NO TRADE (rose-600)
\`\`\`

### Lot-Size-Berechnung (exakt)

\`\`\`javascript
const isJPY    = pair.includes('JPY')
const isGold   = pair.includes('XAU') || pair.includes('GOLD')
const isCrypto = pair.includes('BTC') || pair.includes('ETH')

pipMultiplier = isJPY ? 100 : isGold ? 10 : isCrypto ? 1 : 10000
pipValue      = isJPY ? 1000/entry : isGold ? 10 : isCrypto ? 1 : 10

slPips     = Math.abs(entry - sl) * pipMultiplier
riskAmount = accountSize * (riskPercent / 100)
lotSize    = riskAmount / (slPips * pipValue)
rr         = tpDistance / slDistance

return {
  rr: rr.toFixed(2),
  riskAmount: riskAmount.toFixed(2),
  slPips: slPips.toFixed(1),
  tpPips: tpPips.toFixed(1),
  potentialProfit: (riskAmount * rr).toFixed(2),
  standardLots: lotSize.toFixed(2),
  miniLots: (lotSize * 10).toFixed(2),
  microLots: (lotSize * 100).toFixed(0),
  positionValue: (lotSize * 100000 * entry).toFixed(0),
  pipValue: pipValue.toFixed(2)
}
\`\`\`

### Komponenten-Liste (vollständig)

#### Pages (14)
Home, Checklist, Dashboard, TradeHistory, TradeDetail, Account, FAQ, Trash, Impressum, Datenschutz, AGB, Register, CodeExport, Integrations

#### Components (kategorisiert)

**Layout/Global:**
- LanguageContext — Context für Sprache + Dark Mode; exportiert useLanguage, LanguageToggle, DarkModeToggle
- AccountButton — Login-Button oder User-Avatar-Dropdown
- ScrollToTop — Scrollt bei Route-Change nach oben
- QueryClientProvider — @tanstack/react-query Provider
- ZNPCVLogo — Logo-Komponente

**Checklist:**
- ChecklistItem — Interaktives Checkbox-Item
- ChecklistItemWithTooltip — ChecklistItem + Tooltip
- SectionProgressBar — Fortschrittsbalken pro Sektion
- NoTradeSkills — No-Trade-Analyse-Widget
- TrendAnalysis, EntryChecklist, AOIAnalysis, ChecklistSection
- PatternSelector (inline in Checklist.jsx)
- PairSelector, MiniCalendar, ProgressRing, ForexClock

**Asset/Markt:**
- AssetSelector — Pair-Auswahl
- LivePriceDisplay — Live-Kursanzeige
- LivePriceTracker, MarketChart, LotSizeCalculator

**Advanced:**
- AdvancedLotCalculator, AdvancedMetrics, AdvancedMetricsPanel
- BestTradingTimes, PerformanceChart, QuickStats, TradeSnapshot
- AIPerformanceAnalysis (via InvokeLLM)
- AdvancedTradeFilters, BulkDeletePanel, TradeCompareModal, TradeEditModal, TradeFilters

**Dashboard:**
- NoTradeStats

**Notifications:**
- DailyQuoteWidget, NotificationPrompt, PushNotificationManager
- NotificationHistory, NotificationSettings

**Mobile:**
- BottomNav, SwipeNavigation

**Offline:**
- OfflineManager, OfflineBase44Client, ServiceWorkerRegistration

**Utilities:**
- TradingQuote, CountrySelect, UserNotRegisteredError, ConflTooltip

---

## ABSCHNITT 4: BACKEND INVENTAR

| ID | Name | Trigger | Auth |
|----|------|---------|------|
| BE-FN-001 | exportTradesPDF | HTTP POST | user |
| BE-FN-002 | exportTradesExcel | HTTP POST | user |
| BE-FN-003 | sendTelegramAlert | HTTP POST | user |
| BE-FN-004 | sendWhatsAppAlert | HTTP POST | user |
| BE-FN-005 | tradingViewWebhook | HTTP POST | Webhook-Secret |
| BE-FN-006 | sendWeeklyReport | HTTP POST / Cron | admin |
| BE-FN-007 | sendDailyQuote | HTTP POST / Cron | admin |
| BE-FN-008 | subscribePush | HTTP POST | user |
| BE-FN-009 | sendPushNotification | HTTP POST | admin |
| BE-FN-010 | sendDailyQuotePush | HTTP POST / Cron | admin |
| BE-FN-011 | getVapidPublicKey | HTTP GET | user |
| BE-FN-012 | snoozeNotification | HTTP POST | user |
| BE-FN-013 | fetchForexFactoryCalendar | HTTP GET/POST | user |
| BE-FN-014 | fetchTradingEconomics | HTTP GET/POST | user |

---

## ABSCHNITT 5: BACKEND REBUILD SPEC

### BE-FN-001: exportTradesPDF

Input: {} | Output: application/pdf binary
DB: TradeChecklist.filter({created_by: user.email})
Library: npm:jspdf@4.x

\`\`\`
user = auth.me() → 401 if not
trades = TradeChecklist.filter({created_by: user.email}).filter(t => !t.deleted)
doc = new jsPDF()
doc.text('ZNPCV TRADING REPORT', 20, 30)
doc.text('User: ' + user.email, 20, 45)
doc.text('Total: ' + trades.length, 20, 55)
// Calculate stats
wins = trades.filter(t => t.outcome === 'win').length
losses = trades.filter(t => t.outcome === 'loss').length
totalPnL = trades.reduce((s,t) => s + parseFloat(t.actual_pnl || 0), 0)
// Table with headers: PAIR | DIR | DATE | SCORE | OUTCOME | P&L
FOR trade IN trades:
  IF y > 270: doc.addPage(); y = 20
  doc.text(trade.pair, 20, y)
  doc.text(trade.direction, 50, y)
  doc.text(trade.trade_date, 70, y)
  doc.text(trade.completion_percentage + '%', 105, y)
  doc.text(trade.outcome, 130, y)
  doc.text('$' + trade.actual_pnl, 165, y)
  y += 8
RETURN Response(doc.output('arraybuffer'), {
  'Content-Type': 'application/pdf',
  'Content-Disposition': 'attachment; filename=ZNPCV_Report_YYYY-MM-DD.pdf'
})
\`\`\`

### BE-FN-002: exportTradesExcel (CSV)

Input: {} | Output: text/csv
DB: TradeChecklist.filter({created_by: user.email})

\`\`\`
headers = ['Date','Pair','Direction','Status','Score','W_Score','D_Score',
           '4H_Score','Entry_Score','Outcome','PnL','Entry','SL','TP',
           'Account','Risk%','Leverage','Notes']
rows = trades.map(t => [t.trade_date, t.pair, t.direction, ...])
csv = [headers, ...rows].map(row => row.join(',')).join('\\n')
RETURN Response(csv, { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=ZNPCV_Trades.csv' })
\`\`\`

### BE-FN-003: sendTelegramAlert

Input: { message: string, chat_id?: string }
Output: { success: true, message_id: number }
ENV: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
Side-effect: POST https://api.telegram.org/bot{TOKEN}/sendMessage

### BE-FN-004: sendWhatsAppAlert

Input: { message: string, phone?: string }
Output: { success: true }
ENV: WHATSAPP_API_KEY, WHATSAPP_PHONE_NUMBER

### BE-FN-005: tradingViewWebhook

Input: TradingView Alert JSON
Auth: X-Webhook-Secret header oder body.secret
ENV: TRADINGVIEW_WEBHOOK_SECRET

\`\`\`
secret = req.headers.get('X-Webhook-Secret') || body.secret
IF secret !== TRADINGVIEW_WEBHOOK_SECRET: RETURN 401
symbol = body.ticker || body.symbol
action = body.strategy?.order?.action || body.action
price = body.strategy?.order_price || body.close
await Notification.create({ type: 'trade_alert', title: symbol + ' Alert', body: action + ' @ ' + price })
RETURN { received: true }
\`\`\`

### BE-FN-006: sendWeeklyReport (Cron: Montag 08:00 MEZ)

\`\`\`
users = User.list()
FOR user IN users:
  trades = TradeChecklist.filter({created_by: user.email})
  recentTrades = trades.filter(t => new Date(t.created_date) > weekAgo && !t.deleted)
  stats = { wins, losses, totalPnL, winRate, avgScore }
  await SendEmail({ to: user.email, subject: 'ZNPCV Wochenbericht', body: htmlTemplate(stats) })
\`\`\`

### BE-FN-007: sendDailyQuote (Cron: täglich 08:00 MEZ)

\`\`\`
dayOfYear = Math.floor((today - new Date(year,0,0)) / 86400000)
quote = TRADING_QUOTES[dayOfYear % 15]
users = User.list()
FOR user IN users:
  await SendEmail({ to: user.email, subject: 'ZNPCV Tageszitat', body: '"' + quote.quote + '" — ' + quote.author })
\`\`\`

### BE-FN-008: subscribePush

Input: { subscription: { endpoint, keys: { p256dh, auth } }, deviceInfo: string }
Output: { success: true, id: uuid, action: 'created'|'updated' }

\`\`\`
IF !subscription.endpoint: RETURN 400
existing = PushSubscription.filter({ endpoint, user_email })
IF existing.length > 0:
  update(existing[0].id, { keys, device_info, active: true }) → { action: 'updated' }
ELSE:
  create({ endpoint, keys, user_email, device_info, active: true }) → { action: 'created' }
\`\`\`

### BE-FN-009: sendPushNotification (Admin only)

Input: { user_email?: string, title: string, body: string, url?: string }
Output: { sent: number, failed: number }
ENV: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
Library: npm:web-push

\`\`\`
IF user.role !== 'admin': RETURN 403
subscriptions = PushSubscription.filter({ user_email?, active: true })
FOR sub IN subscriptions:
  payload = JSON.stringify({ title, body, icon: '/logo.png', url: url || '/' })
  TRY webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
  CATCH 410: PushSubscription.update(sub.id, { active: false })
\`\`\`

### BE-FN-010: sendDailyQuotePush (Cron: täglich 09:00 MEZ)

\`\`\`
quote = TRADING_QUOTES[dayOfYear % 15]
subscriptions = PushSubscription.filter({ active: true })
FOR sub IN subscriptions:
  webpush.sendNotification(sub, JSON.stringify({ title: 'ZNPCV Tipp', body: quote.quote }))
\`\`\`

### BE-FN-011: getVapidPublicKey

Output: { publicKey: string }
\`\`\`
RETURN { publicKey: Deno.env.get('VAPID_PUBLIC_KEY') }
\`\`\`

### BE-FN-012: snoozeNotification

Input: { notification_id: string, duration_minutes: number (5-10080) }
Output: { success: true, snoozed_until: ISO-string }

\`\`\`
duration = parseInt(duration_minutes) || 60
IF duration < 5 OR duration > 10080: RETURN 400
snoozed_until = new Date(Date.now() + duration * 60000).toISOString()
Notification.update(notification_id, { snoozed_until })
\`\`\`

### BE-FN-013: fetchForexFactoryCalendar

Input: { date?: string }
Output: { events: Array<{ time, currency, impact, title, forecast, previous, actual }> }

\`\`\`
response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json')
data = await response.json()
filtered = data.filter(e => !date || e.date?.split('T')[0] === date)
normalized = filtered.map(e => ({ time: e.date, currency: e.country, impact: e.impact, title: e.title, ... }))
RETURN { events: normalized }
\`\`\`

### BE-FN-014: fetchTradingEconomics

Input: { country?: string, indicator?: string }
Output: { data: Array }
ENV: TRADING_ECONOMICS_API_KEY

### Automations (Cron-Jobs)

| Automation | Funktion | Zeitplan |
|-----------|---------|---------|
| Daily Quote Email | sendDailyQuote | Täglich 08:00 MEZ |
| Daily Quote Push | sendDailyQuotePush | Täglich 09:00 MEZ |
| Weekly Report | sendWeeklyReport | Montag 08:00 MEZ |

---

## ABSCHNITT 6: DATENBANK 1:1

### ERD

\`\`\`
User (built-in)
  ├── 1:N → TradeChecklist (via created_by = user.email)
  ├── 1:N → NoTradeLog (via created_by = user.email)
  ├── 1:N → Notification (via user_email)
  └── 1:N → PushSubscription (via user_email)
\`\`\`

### User-Tabelle (editierbare Felder via auth.updateMe)

| Spalte | Typ | Default |
|--------|-----|---------|
| profile_image | TEXT | null |
| phone | VARCHAR(20) | null |
| phone_country_code | VARCHAR(10) | '+49' |
| bio | TEXT | null |
| address_street | VARCHAR(255) | null |
| address_city | VARCHAR(100) | null |
| address_postal_code | VARCHAR(20) | null |
| address_country | VARCHAR(10) | null |
| two_factor_enabled | BOOLEAN | false |
| browser_notifications_enabled | BOOLEAN | false |
| notification_frequency | VARCHAR(5) | '1' |
| show_daily_quote_in_app | BOOLEAN | false |
| default_leverage | VARCHAR(10) | '100' |
| default_risk_percent | VARCHAR(5) | '1' |

### TradeChecklist-Schema

Alle Felder: id, created_date, updated_date, created_by, pair (NOT NULL), direction, trade_date,
w_trend, w_at_aoi(10%), w_ema_touch(5%), w_candlestick(10%), w_psp_rejection(10%), w_round_level(5%), w_swing(10%), w_pattern(10%),
d_trend, d_at_aoi(10%), d_ema_touch(5%), d_candlestick(10%), d_psp_rejection(10%), d_round_level(5%), d_swing(5%), d_pattern(10%),
h4_trend, h4_at_aoi(5%), h4_candlestick(10%), h4_psp_rejection(5%), h4_swing(5%), h4_pattern(10%),
entry_sos(10%), entry_engulfing(10%), entry_pattern(5%), entry_type,
entry_price, stop_loss, take_profit, account_size, risk_percent(default:'1'), leverage(default:'100'),
confirms_rule, notes, screenshots[], screenshots_before[], screenshots_after[],
outcome(pending/win/loss/breakeven), actual_pnl, exit_date,
status(in_progress/ready_to_trade/executed/closed, default:'in_progress'),
completion_percentage(0-180), deleted(default:false), deleted_date

**Indizes:** created_by, trade_date, status, deleted, outcome, pair

### RLS alle Entities

\`\`\`
CREATE: created_by = user.email
READ:   created_by = user.email OR user.role = 'admin'
UPDATE: created_by = user.email OR user.role = 'admin'
DELETE: created_by = user.email OR user.role = 'admin'
\`\`\`

### NoTradeLog-Schema

id, created_date, created_by, pair(NOT NULL), direction,
reason(choppy_market/mid_range/major_news/low_confluence/poor_rr, NOT NULL),
score, confluence_count, rr_ratio, notes, avoided_date(NOT NULL), saved_amount

### PushSubscription-Schema

id, created_date, endpoint(NOT NULL), keys(JSONB: {p256dh, auth}, NOT NULL),
user_email(NOT NULL), device_info, active(default:true)
UNIQUE(endpoint, user_email)

### Notification-Schema

id, created_date, user_email(NOT NULL), type(daily_quote/trade_alert/performance_summary/system),
title(NOT NULL), body(NOT NULL), read(default:false), clicked(default:false), snoozed_until

---

## ABSCHNITT 7: INTEGRATIONEN

| Integration | Zweck | ENV |
|-------------|-------|-----|
| JWT Auth | JWT-Auth, Session | (automatisch) |
| File Storage | Screenshots + Avatar | (automatisch) |
| SendEmail | Wochenberichte, Daily Quotes | (automatisch) |
| InvokeLLM | KI-Performance-Analyse | (automatisch) |
| Web Push (VAPID) | Browser-Push-Notifications | VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL |
| Telegram Bot API | Trade-Alerts | TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID |
| WhatsApp API | Trade-Alerts | WHATSAPP_API_KEY, WHATSAPP_PHONE_NUMBER |
| ForexFactory | Wirtschaftskalender | FOREX_FACTORY_API_KEY (optional) |
| TradingEconomics | Wirtschaftsindikatoren | TRADING_ECONOMICS_API_KEY |
| TradingView Webhook | Automatische Trade-Signale | TRADINGVIEW_WEBHOOK_SECRET |
| Offline-PWA | Offline-Nutzung (IndexedDB) | (kein ENV) |

---

## ABSCHNITT 8: HARD RULES

| Regel | Wert | Enforcement |
|-------|------|-------------|
| Mindest-Score "Ready to Trade" | 85% | Frontend + Auto-Save |
| Mindest R:R | 2.5:1 | Frontend-Warning |
| Max Weekly Score | 60 | Score-Formel |
| Max Daily Score | 60 | Score-Formel |
| Max 4H Score | 35 | Score-Formel |
| Max Entry Score | 25 | Score-Formel |
| Max Gesamtscore | 180 | Summe |
| Soft-Delete | deleted=true | Frontend+Backend |
| Auto-Save | 2s Debounce | Frontend useEffect |
| Status-Transition | in_progress↔ready_to_trade@85% | Auto-Save |
| Status-Transition | any→closed@outcome set | TradeDetail-Save |
| RLS-Ownership | User sieht nur eigene Entities | DB-Level |

---

## ABSCHNITT 9: COVERAGE CHECK

| Kategorie | Anzahl |
|-----------|--------|
| Pages | 14 |
| Components | ~45 |
| Backend Functions | 14 |
| Cron-Jobs | 3 |
| Entities/Tables | 5 |
| Integrationen | 11 |

---

## KOPIERBLOCK (1): routes.json

\`\`\`json
{
  "routes": [
    { "path": "/", "page": "Home", "access": "public" },
    { "path": "/Checklist", "page": "Checklist", "access": "public", "query_params": ["id"] },
    { "path": "/Dashboard", "page": "Dashboard", "access": "authenticated" },
    { "path": "/TradeHistory", "page": "TradeHistory", "access": "authenticated" },
    { "path": "/TradeDetail", "page": "TradeDetail", "access": "authenticated", "query_params": ["id"] },
    { "path": "/Account", "page": "Account", "access": "authenticated" },
    { "path": "/FAQ", "page": "FAQ", "access": "public" },
    { "path": "/Trash", "page": "Trash", "access": "authenticated" },
    { "path": "/Impressum", "page": "Impressum", "access": "public" },
    { "path": "/Datenschutz", "page": "Datenschutz", "access": "public" },
    { "path": "/AGB", "page": "AGB", "access": "public" },
    { "path": "/Register", "page": "Register", "access": "public" },
    { "path": "/CodeExport", "page": "CodeExport", "access": "admin" },
    { "path": "/Integrations", "page": "Integrations", "access": "authenticated" }
  ],
  "layout": "Layout.js",
  "router": "react-router-dom v6"
}
\`\`\`

---

## KOPIERBLOCK (2): tokens.json

\`\`\`json
{
  "colors": {
    "dark": {
      "bg_primary":      "#000000",
      "bg_secondary":    "#09090B",
      "bg_card":         "#18181B",
      "text_primary":    "#FFFFFF",
      "text_secondary":  "#A1A1AA",
      "text_muted":      "#71717A",
      "text_dimmed":     "#52525B",
      "border_default":  "rgba(39,39,42,0.50)",
      "border_card":     "#27272A"
    },
    "light": {
      "bg_primary":      "#FFFFFF",
      "bg_secondary":    "#F4F4F5",
      "bg_card":         "#FAFAFA",
      "text_primary":    "#18181B",
      "text_secondary":  "#52525B",
      "text_muted":      "#71717A",
      "text_dimmed":     "#A1A1AA",
      "border_default":  "#E4E4E7",
      "border_card":     "#D4D4D8"
    },
    "semantic": {
      "accent_primary":   "#047857",
      "accent_light":     "#059669",
      "rose_600":         "#E11D48",
      "amber_500":        "#F59E0B",
      "blue_500":         "#3B82F6",
      "purple_600":       "#9333EA",
      "teal_600":         "#0D9488"
    },
    "grades": {
      "a_plus_plus_plus": "#047857",
      "a_plus_plus":      "#14B8A6",
      "a_plus":           "#3B82F6",
      "ok":               "#F59E0B",
      "no_trade":         "#E11D48"
    }
  },
  "typography": {
    "font_heading":  "'Bebas Neue', sans-serif",
    "font_body":     "'Inter', sans-serif",
    "font_mono":     "ui-monospace, monospace",
    "google_fonts":  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap",
    "note": "Hero H1 uses font-weight: 300 (font-light)!"
  },
  "spacing": {
    "1": "4px", "2": "8px", "3": "12px", "4": "16px",
    "5": "20px", "6": "24px", "8": "32px", "10": "40px",
    "12": "48px", "16": "64px", "20": "80px"
  },
  "radius": {
    "lg": "8px", "xl": "12px", "2xl": "16px", "3xl": "24px", "full": "9999px"
  },
  "shadows": {
    "card_hover": "0 25px 50px -12px rgba(0,0,0,0.25)",
    "2xl": "0 25px 50px -12px rgba(0,0,0,0.25)"
  },
  "containers": {
    "checklist": "768px",
    "faq": "896px",
    "detail": "1024px",
    "home_dashboard": "1152px"
  },
  "breakpoints": {
    "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px"
  }
}
\`\`\`

---

## KOPIERBLOCK (3): schema.sql

\`\`\`sql
-- ZNPCV TRADING CHECKLIST — DATABASE SCHEMA

-- User table extensions (via auth.updateMe):
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(10) DEFAULT '+49';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS address_street VARCHAR(255);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS address_city VARCHAR(100);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS address_postal_code VARCHAR(20);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS address_country VARCHAR(10);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS browser_notifications_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS notification_frequency VARCHAR(5) DEFAULT '1';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS show_daily_quote_in_app BOOLEAN DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS default_leverage VARCHAR(10) DEFAULT '100';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS default_risk_percent VARCHAR(5) DEFAULT '1';

-- TABLE: TradeChecklist
CREATE TABLE IF NOT EXISTS "TradeChecklist" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  pair VARCHAR(20) NOT NULL,
  direction VARCHAR(10) CHECK (direction IN ('long', 'short')),
  trade_date DATE,
  w_trend VARCHAR(10) CHECK (w_trend IN ('bullish', 'bearish')),
  w_at_aoi BOOLEAN DEFAULT FALSE,
  w_ema_touch BOOLEAN DEFAULT FALSE,
  w_candlestick BOOLEAN DEFAULT FALSE,
  w_psp_rejection BOOLEAN DEFAULT FALSE,
  w_round_level BOOLEAN DEFAULT FALSE,
  w_swing BOOLEAN DEFAULT FALSE,
  w_pattern VARCHAR(30) CHECK (w_pattern IN ('none','double_top','double_bottom','head_shoulders','inv_head_shoulders')),
  d_trend VARCHAR(10) CHECK (d_trend IN ('bullish', 'bearish')),
  d_at_aoi BOOLEAN DEFAULT FALSE,
  d_ema_touch BOOLEAN DEFAULT FALSE,
  d_candlestick BOOLEAN DEFAULT FALSE,
  d_psp_rejection BOOLEAN DEFAULT FALSE,
  d_round_level BOOLEAN DEFAULT FALSE,
  d_swing BOOLEAN DEFAULT FALSE,
  d_pattern VARCHAR(30) CHECK (d_pattern IN ('none','double_top','double_bottom','head_shoulders','inv_head_shoulders')),
  h4_trend VARCHAR(10) CHECK (h4_trend IN ('bullish', 'bearish')),
  h4_at_aoi BOOLEAN DEFAULT FALSE,
  h4_candlestick BOOLEAN DEFAULT FALSE,
  h4_psp_rejection BOOLEAN DEFAULT FALSE,
  h4_swing BOOLEAN DEFAULT FALSE,
  h4_pattern VARCHAR(30) CHECK (h4_pattern IN ('none','double_top','double_bottom','head_shoulders','inv_head_shoulders')),
  entry_sos BOOLEAN DEFAULT FALSE,
  entry_engulfing BOOLEAN DEFAULT FALSE,
  entry_pattern VARCHAR(30) CHECK (entry_pattern IN ('none','double_top','double_bottom','head_shoulders','inv_head_shoulders')),
  entry_type VARCHAR(20) CHECK (entry_type IN ('pinbar', 'engulfing')),
  entry_price VARCHAR(30),
  stop_loss VARCHAR(30),
  take_profit VARCHAR(30),
  account_size VARCHAR(30),
  risk_percent VARCHAR(10) DEFAULT '1',
  leverage VARCHAR(10) DEFAULT '100',
  confirms_rule BOOLEAN DEFAULT FALSE,
  notes TEXT,
  screenshots TEXT[] DEFAULT '{}',
  screenshots_before TEXT[] DEFAULT '{}',
  screenshots_after TEXT[] DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'ready_to_trade', 'executed', 'closed')),
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  outcome VARCHAR(20) DEFAULT 'pending'
    CHECK (outcome IN ('win', 'loss', 'breakeven', 'pending')),
  actual_pnl VARCHAR(20),
  exit_date DATE,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tc_created_by ON "TradeChecklist"(created_by);
CREATE INDEX IF NOT EXISTS idx_tc_trade_date ON "TradeChecklist"(trade_date);
CREATE INDEX IF NOT EXISTS idx_tc_status ON "TradeChecklist"(status);
CREATE INDEX IF NOT EXISTS idx_tc_deleted ON "TradeChecklist"(deleted);
CREATE INDEX IF NOT EXISTS idx_tc_outcome ON "TradeChecklist"(outcome);

ALTER TABLE "TradeChecklist" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tc_rls ON "TradeChecklist" FOR ALL USING (
  created_by = current_user_email() OR current_user_role() = 'admin'
);

-- TABLE: NoTradeLog
CREATE TABLE IF NOT EXISTS "NoTradeLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  pair VARCHAR(20) NOT NULL,
  direction VARCHAR(10) CHECK (direction IN ('long', 'short')),
  reason VARCHAR(30) NOT NULL CHECK (reason IN ('choppy_market','mid_range','major_news','low_confluence','poor_rr')),
  score NUMERIC(5,2),
  confluence_count NUMERIC(2),
  rr_ratio VARCHAR(10),
  notes TEXT,
  avoided_date DATE NOT NULL,
  saved_amount VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_ntl_created_by ON "NoTradeLog"(created_by);
CREATE INDEX IF NOT EXISTS idx_ntl_avoided_date ON "NoTradeLog"(avoided_date);
ALTER TABLE "NoTradeLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY ntl_rls ON "NoTradeLog" FOR ALL USING (
  created_by = current_user_email() OR current_user_role() = 'admin'
);

-- TABLE: PushSubscription
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMP NOT NULL DEFAULT NOW(),
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  device_info TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT unique_push_sub UNIQUE(endpoint, user_email)
);

ALTER TABLE "PushSubscription" ENABLE ROW LEVEL SECURITY;
CREATE POLICY pushsub_rls ON "PushSubscription" FOR ALL USING (
  user_email = current_user_email() OR current_user_role() = 'admin'
);

-- TABLE: Notification
CREATE TABLE IF NOT EXISTS "Notification" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMP NOT NULL DEFAULT NOW(),
  user_email VARCHAR(255) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('daily_quote','trade_alert','performance_summary','system')),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  clicked BOOLEAN NOT NULL DEFAULT FALSE,
  snoozed_until TIMESTAMP
);

ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_rls ON "Notification" FOR ALL USING (
  user_email = current_user_email() OR current_user_role() = 'admin'
);
\`\`\`

---

## KOPIERBLOCK (4): env.example

\`\`\`bash
# ZNPCV TRADING CHECKLIST — ENVIRONMENT VARIABLES

# ---- WEB PUSH (VAPID) ----
# npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=

# ---- TELEGRAM BOT ----
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# ---- WHATSAPP / TWILIO ----
WHATSAPP_API_KEY=
WHATSAPP_PHONE_NUMBER=

# ---- TRADINGVIEW WEBHOOK ----
TRADINGVIEW_WEBHOOK_SECRET=

# ---- EXTERNAL DATA APIS ----
TRADING_ECONOMICS_API_KEY=
FOREX_FACTORY_API_KEY=
\`\`\`

---

## KOPIERBLOCK (5): api_contracts.md

\`\`\`markdown
# ZNPCV API CONTRACTS

Alle Backend-Funktionen werden aufgerufen via:
  const response = await base44.functions.invoke('functionName', payload);
  // response.data enthält das Ergebnis

## BE-FN-001: exportTradesPDF
Method: POST | Auth: JWT | Input: {} | Output: application/pdf binary

## BE-FN-002: exportTradesExcel
Method: POST | Auth: JWT | Input: {} | Output: text/csv

## BE-FN-003: sendTelegramAlert
Input: { message: string, chat_id?: string }
Output: { success: true, message_id: number }

## BE-FN-004: sendWhatsAppAlert
Input: { message: string, phone?: string }
Output: { success: true }

## BE-FN-005: tradingViewWebhook
Method: POST | Auth: X-Webhook-Secret header
Input: { ticker, action, close, strategy: { order: { action }, order_price }, secret }
Output: { received: true }

## BE-FN-006: sendWeeklyReport
Method: POST (admin) / Cron Montag 08:00 MEZ
Input: {} | Output: { sent: number, errors: number }

## BE-FN-007: sendDailyQuote
Method: POST (admin) / Cron täglich 08:00 MEZ
Input: {} | Output: { sent: number }

## BE-FN-008: subscribePush
Input: { subscription: { endpoint, keys: { p256dh, auth } }, deviceInfo: string }
Output: { success: true, id: string, action: 'created'|'updated' }

## BE-FN-009: sendPushNotification (Admin only)
Input: { user_email?: string, title: string, body: string, url?: string }
Output: { sent: number, failed: number }

## BE-FN-010: sendDailyQuotePush
Method: POST (admin) / Cron täglich 09:00 MEZ
Input: {} | Output: { sent: number, failed: number }

## BE-FN-011: getVapidPublicKey
Method: GET | Input: {} | Output: { publicKey: string }

## BE-FN-012: snoozeNotification
Input: { notification_id: string, duration_minutes: number (5-10080) }
Output: { success: true, snoozed_until: ISO-string }

## BE-FN-013: fetchForexFactoryCalendar
Input: { date?: 'YYYY-MM-DD' }
Output: { events: Array<{ time, currency, impact, title, forecast, previous, actual }>, count: number }

## BE-FN-014: fetchTradingEconomics
Input: { country?: string, indicator?: string }
Output: { data: Array, count: number }

## Push Notification Payload:
{ title, body, icon: '/logo.png', badge: '/logo.png', url: '/', tag: 'znpcv-timestamp' }

## TradingView Webhook Payload:
{ "ticker": "{{ticker}}", "action": "{{strategy.order.action}}", "close": "{{close}}",
  "strategy": { "order": { "action": "{{strategy.order.action}}" }, "order_price": "{{strategy.order_price}}" },
  "secret": "YOUR_SECRET" }
\`\`\`

---

## KOPIERBLOCK (6): backend_rebuild_spec.md

\`\`\`markdown
# ZNPCV BACKEND REBUILD SPECIFICATION

## Stack
Runtime: Deno Deploy
Import: npm:package@version
SDK: import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20'
HTTP: Deno.serve(async (req) => { ... })

## Template
\\\`\\\`\\\`typescript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // ... logic ...
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
\\\`\\\`\\\`

## Score-Helper (inline überall nutzen)
function calculateWeeklyScore(t) { return (t.w_at_aoi?10:0)+(t.w_ema_touch?5:0)+(t.w_candlestick?10:0)+(t.w_psp_rejection?10:0)+(t.w_round_level?5:0)+(t.w_swing?10:0)+(t.w_pattern&&t.w_pattern!=='none'?10:0) }
function calculateDailyScore(t)  { return (t.d_at_aoi?10:0)+(t.d_ema_touch?5:0)+(t.d_candlestick?10:0)+(t.d_psp_rejection?10:0)+(t.d_round_level?5:0)+(t.d_swing?5:0)+(t.d_pattern&&t.d_pattern!=='none'?10:0) }
function calculateH4Score(t)     { return (t.h4_at_aoi?5:0)+(t.h4_candlestick?10:0)+(t.h4_psp_rejection?5:0)+(t.h4_swing?5:0)+(t.h4_pattern&&t.h4_pattern!=='none'?10:0) }
function calculateEntryScore(t)  { return (t.entry_sos?10:0)+(t.entry_engulfing?10:0)+(t.entry_pattern&&t.entry_pattern!=='none'?5:0) }

## Trading Quotes Array (15 Items)
const TRADING_QUOTES = [
  { quote: "Die Börse ist ein Ort, an dem Erfahrung wichtiger ist als Intelligenz.", author: "Peter Lynch" },
  { quote: "Risikomanagement ist wichtiger als Gewinnmaximierung.", author: "Warren Buffett" },
  { quote: "Der Markt kann länger irrational bleiben, als du liquide bleiben kannst.", author: "John Maynard Keynes" },
  { quote: "Erfolgreiche Trader haben einen Plan. Verlierer haben Hoffnung.", author: "Larry Williams" },
  { quote: "Das Ziel des Trading ist nicht, perfekt zu sein, sondern profitabel.", author: "Alexander Elder" },
  { quote: "Verluste sind Teil des Spiels. Akzeptiere sie und ziehe weiter.", author: "Jesse Livermore" },
  { quote: "Die größten Gewinne kommen, wenn man die Trends reitet.", author: "Paul Tudor Jones" },
  { quote: "Trading ist zu 90% Psychologie und zu 10% Technik.", author: "Mark Douglas" },
  { quote: "Planung und Disziplin schlagen Emotionen im Trading.", author: "Van K. Tharp" },
  { quote: "Der Trend ist dein Freund - bis er endet.", author: "Börsenweisheit" },
  { quote: "Erfolgreiche Trader schneiden Verluste kurz und lassen Gewinne laufen.", author: "William J. O'Neil" },
  { quote: "Im Trading gewinnt derjenige, der am längsten im Spiel bleibt.", author: "Jim Rogers" },
  { quote: "Niemals aufgrund von Hoffnung oder Angst handeln, sondern auf Basis der Analyse.", author: "Benjamin Graham" },
  { quote: "Das Geheimnis erfolgreichen Tradings liegt in der Konsistenz.", author: "Steve Nison" },
  { quote: "Märkte belohnen Geduld und bestrafen Gier.", author: "Ray Dalio" }
];
const dailyQuoteIndex = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000) % 15;

## Status-Flow
TradeChecklist: in_progress ↔ ready_to_trade (@ score>=85) → closed (@ outcome set)
Outcome: pending → win|loss|breakeven

## VAPID Key Generation
npx web-push generate-vapid-keys
# → VAPID_PUBLIC_KEY (share with frontend)
# → VAPID_PRIVATE_KEY (backend only, never expose)
# → VAPID_EMAIL = mailto:support@znpcv.com

## Cron Schedules (Base44 Automations)
sendDailyQuote:    daily,   start_time: "08:00" (Europe/Berlin)
sendDailyQuotePush: daily,  start_time: "09:00" (Europe/Berlin)
sendWeeklyReport:  weekly,  repeat_on_days: [1], start_time: "08:00" (Europe/Berlin)
\`\`\`
`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    return new Response(EXPORT_CONTENT, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="znpcv-export.md"',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});