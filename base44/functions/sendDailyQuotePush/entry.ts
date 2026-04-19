import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import webpush from 'npm:web-push@3.6.7';

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
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    webpush.setVapidDetails(
      'mailto:support@znpcv.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    // Get all users with browser notifications enabled
    const users = await base44.asServiceRole.entities.User.filter({
      browser_notifications_enabled: true
    });

    const randomQuote = TRADING_QUOTES[Math.floor(Math.random() * TRADING_QUOTES.length)];
    let totalSent = 0;

    for (const targetUser of users) {
      // Get user's subscriptions
      const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
        user_email: targetUser.email,
        active: true
      });

      const payload = JSON.stringify({
        title: 'ZNPCV Trading Tipp',
        body: `${randomQuote.quote}\n\n— ${randomQuote.author}`,
        icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png',
        badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png',
        tag: 'daily-quote',
        requireInteraction: false
      });

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys
            },
            payload
          );
          totalSent++;
        } catch (error) {
          console.error('Push failed:', error);
          
          // Deactivate expired subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
              active: false
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      sent: totalSent,
      users: users.length
    });
  } catch (error) {
    console.error('Send daily quote push failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});