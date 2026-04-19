import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
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

    // Send emails to matching users
    for (const user of users) {
      if (!user.email || !user.daily_quote_time) continue;
      
      // Parse user's preferred time (format: "HH:mm")
      const [userHour, userMinute] = user.daily_quote_time.split(':').map(Number);
      
      // Check if current time matches user's preferred time (within 30 min window)
      if (currentHour === userHour && Math.abs(currentMinute - userMinute) <= 30) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            from_name: 'ZNPCV',
          subject: `ZNPCV – Dein täglicher Trading-Impuls`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">ZNPCV</h1>
                  <p style="font-size: 12px; color: #94a3b8; margin-top: 5px; letter-spacing: 3px;">TRADING WISDOM</p>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); border-left: 4px solid #14b8a6; padding: 25px; border-radius: 8px; margin: 20px 0;">
                  <p style="font-size: 18px; line-height: 1.6; margin: 0; font-style: italic;">
                    "${randomQuote.quote}"
                  </p>
                  <p style="font-size: 14px; color: #94a3b8; margin-top: 15px; text-align: right;">
                    — ${randomQuote.author}
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                  <p style="font-size: 12px; color: #64748b; margin: 0;">
                    Diese Erinnerung kannst du in deinen Einstellungen anpassen.
                  </p>
                  <p style="font-size: 11px; color: #475569; margin-top: 8px;">
                    — ZNPCV · znpcv.de
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