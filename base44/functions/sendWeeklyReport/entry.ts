import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Nicht autorisiert' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Nur für Administratoren' }, { status: 403 });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const allTrades = await base44.asServiceRole.entities.TradeChecklist.list('-created_date', 200);
    const weekTrades = allTrades.filter(t => new Date(t.created_date) >= sevenDaysAgo && !t.deleted);

    const executedTrades = weekTrades.filter(t => t.outcome && t.outcome !== 'pending');
    const wins = executedTrades.filter(t => t.outcome === 'win').length;
    const losses = executedTrades.filter(t => t.outcome === 'loss').length;
    const totalPnL = executedTrades.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
    const winRate = executedTrades.length > 0 ? ((wins / executedTrades.length) * 100).toFixed(1) : 0;

    // Hol alle User, die Reports aktiviert haben
    const users = await base44.asServiceRole.entities.User.list();
    let sent = 0;
    let errors = 0;

    for (const u of users) {
      if (!u.email) continue;
      try {
        const userTrades = weekTrades.filter(t => t.created_by === u.email);
        const userExecuted = userTrades.filter(t => t.outcome && t.outcome !== 'pending');
        const userWins = userExecuted.filter(t => t.outcome === 'win').length;
        const userLosses = userExecuted.filter(t => t.outcome === 'loss').length;
        const userPnL = userExecuted.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
        const userWinRate = userExecuted.length > 0 ? ((userWins / userExecuted.length) * 100).toFixed(1) : 0;

        const emailBody = `<!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;background:#000;color:#fff;padding:40px;}
          .container{max-width:600px;margin:0 auto;background:#111;border:2px solid #333;border-radius:16px;padding:30px;}
          .header{font-size:28px;font-weight:bold;margin-bottom:10px;letter-spacing:2px;}
          .stat{background:#1a1a1a;padding:15px;margin:10px 0;border-radius:8px;border:1px solid #333;}
          .stat-label{color:#888;font-size:12px;margin-bottom:5px;}
          .stat-value{font-size:24px;font-weight:bold;}
          .positive{color:#0d9488;} .negative{color:#e11d48;}
          .footer{margin-top:30px;padding-top:20px;border-top:1px solid #333;color:#666;font-size:12px;}
        </style></head><body><div class="container">
          <div class="header">ZNPCV WEEKLY REPORT</div>
          <p style="color:#888;margin-bottom:30px;">Deine Performance der letzten 7 Tage</p>
          <div class="stat"><div class="stat-label">TOTAL TRADES</div><div class="stat-value">${userTrades.length}</div></div>
          <div class="stat"><div class="stat-label">WIN RATE</div><div class="stat-value ${parseFloat(userWinRate) >= 50 ? 'positive' : 'negative'}">${userWinRate}%</div></div>
          <div class="stat"><div class="stat-label">PROFIT & LOSS</div><div class="stat-value ${userPnL >= 0 ? 'positive' : 'negative'}">$${userPnL.toFixed(2)}</div></div>
          <div class="stat"><div class="stat-label">WINS / LOSSES</div><div class="stat-value">${userWins} / ${userLosses}</div></div>
          <div class="footer"><p>Disziplin schlägt Talent. Jeden Tag.</p><p>— ZNPCV Team · <a href="https://znpcv.de" style="color:#0d9488;text-decoration:none;">znpcv.de</a></p></div>
        </div></body></html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          from_name: 'ZNPCV Trading',
          subject: `Dein ZNPCV Weekly Report - ${new Date().toLocaleDateString('de-DE')}`,
          body: emailBody
        });
        sent++;
      } catch (_e) {
        errors++;
      }
    }

    return Response.json({ success: true, sent, errors, weekTrades: weekTrades.length, winRate, totalPnL, wins, losses });
  } catch (_error) {
    const errorId = `E${Date.now().toString(36).toUpperCase()}`;
    console.error(`[${errorId}] sendWeeklyReport error`);
    return Response.json({ error: 'Report-Versand fehlgeschlagen.', errorId }, { status: 500 });
  }
});