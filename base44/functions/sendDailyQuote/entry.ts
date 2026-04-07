import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

// Max emails per run to prevent runaway sends
const MAX_SENDS_PER_RUN = 500;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Caller must be authenticated and admin (scheduled automations pass as service role)
    // When invoked manually, verify admin role
    try {
      const caller = await base44.auth.me();
      if (caller && caller.role !== 'admin') {
        return Response.json({ error: 'Nicht autorisiert.' }, { status: 403 });
      }
    } catch (_) { /* called by automation — no user context, continue */ }

    // Get all users with daily quotes enabled
    const users = await base44.asServiceRole.entities.User.filter({
      daily_quote_enabled: true
    });

    if (!users || users.length === 0) {
      return Response.json({ 
        message: 'No users with daily quotes enabled',
        sent: 0 
      });
    }

    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getMinutes();
    
    // Select a random quote
    const randomQuote = TRADING_QUOTES[Math.floor(Math.random() * TRADING_QUOTES.length)];
    
    let sentCount = 0;
    const eligible = users.slice(0, MAX_SENDS_PER_RUN);

    // Send emails to matching users
    for (const user of eligible) {
      if (!user.email || !user.daily_quote_time) continue;
      
      // Parse user's preferred time (format: "HH:mm")
      const [userHour, userMinute] = user.daily_quote_time.split(':').map(Number);
      
      // Check if current time matches user's preferred time (within 30 min window)
      if (currentHour === userHour && Math.abs(currentMinute - userMinute) <= 30) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'ZNPCV',
            to: user.email,
            subject: `ZNPCV — Trading-Gedanke des Tages`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #09090b; color: #ffffff; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 28px;">
                  <div style="font-size: 22px; font-weight: bold; letter-spacing: 4px; color: #ffffff;">ZNPCV</div>
                  <div style="font-size: 10px; color: #71717a; letter-spacing: 5px; margin-top: 4px;">TRADING SYSTEM</div>
                </div>

                <div style="border-left: 3px solid #059669; padding: 20px 20px; background: rgba(255,255,255,0.03); border-radius: 0 8px 8px 0; margin: 0 0 24px 0;">
                  <p style="font-size: 16px; line-height: 1.7; margin: 0 0 12px 0; font-style: italic; color: #e4e4e7;">
                    &ldquo;${randomQuote.quote}&rdquo;
                  </p>
                  <p style="font-size: 12px; color: #71717a; margin: 0; text-align: right;">
                    &mdash; ${randomQuote.author}
                  </p>
                </div>

                <div style="border-top: 1px solid #27272a; padding-top: 20px; text-align: center;">
                  <p style="font-size: 11px; color: #52525b; margin: 0; line-height: 1.6;">
                    Du erhältst diese Nachricht, weil du tägliche Impulse in deinen ZNPCV-Einstellungen aktiviert hast.<br>
                    Einstellungen anpassen: <a href="https://app.znpcv.com/account" style="color: #71717a; text-decoration: underline;">Mein Account</a>
                  </p>
                </div>
              </div>
            `
          });
          sentCount++;
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
        }
      }
    }

    return Response.json({ 
      success: true,
      message: `Sent ${sentCount} daily quotes`,
      sent: sentCount,
      totalEligible: users.length
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});