import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Rate limiter: 3 req/min (Admin-Export)
const rateLimitMap = new Map();
function checkRateLimit(userId, limit = 3, windowMs = 60000) {
  const now = Date.now();
  const key = `dl_export_${userId}`;
  const entry = rateLimitMap.get(key) || { count: 0, reset: now + windowMs };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs; }
  entry.count++;
  rateLimitMap.set(key, entry);
  return entry.count <= limit;
}

const EXPORT_CONTENT = `# ZNPCV TRADING CHECKLIST — VOLLSTÄNDIGER REBUILD-EXPORT

**MODE = BACKEND_RESTRICTED_EXPORT**

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
| Auth-Modell | JWT-basiert |

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

---

## ABSCHNITT 2: ROUTE / PAGE MAP

| Route | page_name | Zugriff |
|-------|-----------|---------|
| \`/\` | Home | Öffentlich |
| \`/Checklist\` | Checklist | Auth empfohlen |
| \`/Dashboard\` | Dashboard | Auth |
| \`/TradeHistory\` | TradeHistory | Auth |
| \`/TradeDetail?id=<uuid>\` | TradeDetail | Auth (RLS) |
| \`/Account\` | Account | Auth |
| \`/FAQ\` | FAQ | Öffentlich |
| \`/Trash\` | Trash | Auth |
| \`/Impressum\` | Impressum | Öffentlich |
| \`/Datenschutz\` | Datenschutz | Öffentlich |
| \`/AGB\` | AGB | Öffentlich |

---

## ABSCHNITT 3: SCORE-SYSTEM

\`\`\`
weeklyScore  = w_at_aoi*10 + w_ema_touch*5 + w_candlestick*10 + w_psp_rejection*10 + w_round_level*5 + w_swing*10 + w_pattern*10  // max 60
dailyScore   = d_at_aoi*10 + d_ema_touch*5 + d_candlestick*10 + d_psp_rejection*10 + d_round_level*5 + d_swing*5 + d_pattern*10   // max 60
h4Score      = h4_at_aoi*5 + h4_candlestick*10 + h4_psp_rejection*5 + h4_swing*5 + h4_pattern*10                                  // max 35
entryScore   = entry_sos*10 + entry_engulfing*10 + entry_pattern*5                                                                 // max 25
totalScore   = sum  // max 180

Grades: >=100: A+++ | >=90: A++ | >=85: A+ | >=70: OK | <70: NO TRADE
\`\`\`

---

## ABSCHNITT 4: SICHERHEIT

- Alle Mutations: serverseitige AuthZ-Prüfung
- RLS: User sieht nur eigene Entitäten (außer Admin)
- Rate Limiting: alle sensitiven Endpoints
- Input-Validierung: serverseitig auf allen Endpoints
- Fehler-Antworten: generisch (keine Interna)
`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Nicht autorisiert' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Nur für Administratoren' }, { status: 403 });

    if (!checkRateLimit(user.id)) {
      return Response.json({ error: 'Zu viele Anfragen.' }, { status: 429 });
    }

    return new Response(EXPORT_CONTENT, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="znpcv-export.md"',
        'Cache-Control': 'no-store'
      }
    });
  } catch (_error) {
    const errorId = `E${Date.now().toString(36).toUpperCase()}`;
    console.error(`[${errorId}] downloadExport error`);
    return Response.json({ error: 'Anfrage fehlgeschlagen.', errorId }, { status: 500 });
  }
});