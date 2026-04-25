import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Nicht autorisiert' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    // month = 'YYYY-MM', default = current month
    const month = body.month || new Date().toISOString().slice(0, 7);
    const [year, mon] = month.split('-').map(Number);

    const allTrades = await base44.entities.TradeChecklist.list('-created_date', 500);
    const monthTrades = allTrades.filter(t => {
      if (t.deleted) return false;
      const d = t.trade_date || t.created_date?.slice(0, 10);
      return d && d.startsWith(month);
    });

    // ── Stats ──────────────────────────────────────────────────────────────
    const executed = monthTrades.filter(t => t.outcome && t.outcome !== 'pending');
    const wins = executed.filter(t => t.outcome === 'win');
    const losses = executed.filter(t => t.outcome === 'loss');
    const totalPnL = executed.reduce((s, t) => s + parseFloat(t.actual_pnl || 0), 0);
    const winRate = executed.length > 0 ? ((wins.length / executed.length) * 100).toFixed(1) : '0.0';
    const totalWinPnL = wins.reduce((s, t) => s + parseFloat(t.actual_pnl || 0), 0);
    const totalLossPnL = Math.abs(losses.reduce((s, t) => s + parseFloat(t.actual_pnl || 0), 0));
    const avgWin = wins.length > 0 ? (totalWinPnL / wins.length).toFixed(2) : '0.00';
    const avgLoss = losses.length > 0 ? (totalLossPnL / losses.length).toFixed(2) : '0.00';
    const profitFactor = totalLossPnL > 0 ? (totalWinPnL / totalLossPnL).toFixed(2) : totalWinPnL > 0 ? '∞' : '0.00';
    const avgScore = monthTrades.length > 0
      ? Math.round(monthTrades.reduce((s, t) => s + (t.completion_percentage || 0), 0) / monthTrades.length)
      : 0;
    const readyToTrade = monthTrades.filter(t => t.status === 'ready_to_trade').length;

    // ── Learnings from notes_json ──────────────────────────────────────────
    const learnings = monthTrades
      .map(t => {
        if (!t.notes_json) return null;
        try {
          const parsed = JSON.parse(t.notes_json);
          return parsed.learnings?.trim() || null;
        } catch { return null; }
      })
      .filter(Boolean)
      .slice(0, 5); // max 5 learnings

    // ── Also collect plain notes ───────────────────────────────────────────
    const tradeNotes = monthTrades
      .filter(t => t.notes?.trim())
      .map(t => ({ pair: t.pair, date: t.trade_date, note: t.notes.trim() }))
      .slice(0, 5);

    // ── Best & Worst trade ─────────────────────────────────────────────────
    const best = executed.sort((a, b) => parseFloat(b.actual_pnl || 0) - parseFloat(a.actual_pnl || 0))[0];
    const worst = executed.sort((a, b) => parseFloat(a.actual_pnl || 0) - parseFloat(b.actual_pnl || 0))[0];

    // ─────────────────────────────── PDF ───────────────────────────────────
    const doc = new jsPDF();
    const pageW = 210;
    const C = { black: [0,0,0], white: [255,255,255], teal: [13,148,136], rose: [225,29,72], grey: [80,80,80], lightgrey: [200,200,200], bg: [248,248,248] };

    const setColor = (c) => doc.setTextColor(...c);
    const setFill = (c) => doc.setFillColor(...c);
    const monthLabel = new Date(year, mon - 1).toLocaleString('de-DE', { month: 'long', year: 'numeric' }).toUpperCase();

    // ── Cover Header ─────────────────────────────────────────────────────
    setFill(C.black); doc.rect(0, 0, pageW, 52, 'F');
    setFill(C.teal); doc.rect(0, 52, pageW, 2, 'F');
    setColor(C.white);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text('ZNPCV · znpcv.de', 20, 14);
    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('MONATSBERICHT', pageW / 2, 28, { align: 'center' });
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text(monthLabel, pageW / 2, 38, { align: 'center' });
    doc.setFontSize(8);
    doc.text(`Erstellt am ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}`, 20, 48);
    doc.text(`Trader: ${(user.full_name || user.email || '').substring(0, 50)}`, pageW - 20, 48, { align: 'right' });

    let y = 66;

    // ── Summary Stats Row ─────────────────────────────────────────────────
    const boxes = [
      { label: 'TRADES', value: monthTrades.length.toString(), sub: `${executed.length} ausgeführt`, color: C.black },
      { label: 'GESAMT P&L', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, sub: `${winRate}% Winrate`, color: totalPnL >= 0 ? C.teal : C.rose },
      { label: 'WINS / LOSSES', value: `${wins.length} / ${losses.length}`, sub: `PF ${profitFactor}`, color: C.teal },
      { label: 'AVG SCORE', value: `${avgScore}%`, sub: `${readyToTrade} Ready`, color: avgScore >= 85 ? C.teal : C.grey },
    ];

    const bw = 42; const gap = 2.5; const startX = 15;
    boxes.forEach((b, i) => {
      const bx = startX + i * (bw + gap);
      setFill(C.bg); doc.setDrawColor(...C.lightgrey); doc.setLineWidth(0.3);
      doc.roundedRect(bx, y, bw, 28, 2, 2, 'FD');
      doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); setColor(C.grey);
      doc.text(b.label, bx + bw / 2, y + 7, { align: 'center' });
      doc.setFontSize(13); doc.setFont('helvetica', 'bold'); setColor(b.color);
      doc.text(b.value, bx + bw / 2, y + 17, { align: 'center' });
      doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); setColor(C.grey);
      doc.text(b.sub, bx + bw / 2, y + 24, { align: 'center' });
    });
    y += 34;

    // ── Best / Worst ──────────────────────────────────────────────────────
    if (best || worst) {
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); setColor(C.black);
      doc.text('HIGHLIGHTS', 15, y + 1);
      setFill(C.teal); doc.rect(15, y + 3, 25, 0.8, 'F');
      y += 9;

      const hw = 87;
      if (best) {
        setFill([232,253,245]); doc.setDrawColor(...C.teal); doc.setLineWidth(0.4);
        doc.roundedRect(15, y, hw, 16, 2, 2, 'FD');
        doc.setFontSize(6); doc.setFont('helvetica', 'bold'); setColor(C.teal);
        doc.text('BESTER TRADE', 19, y + 5);
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); setColor(C.teal);
        doc.text(`+$${parseFloat(best.actual_pnl || 0).toFixed(2)}`, 19, y + 12);
        doc.setFontSize(7); doc.setFont('helvetica', 'normal'); setColor(C.grey);
        doc.text(`${best.pair || '-'} · ${best.trade_date || ''}`, hw - 5, y + 12, { align: 'right' });
      }
      if (worst) {
        setFill([255,241,242]); doc.setDrawColor(...C.rose); doc.setLineWidth(0.4);
        doc.roundedRect(15 + hw + 5, y, hw, 16, 2, 2, 'FD');
        doc.setFontSize(6); doc.setFont('helvetica', 'bold'); setColor(C.rose);
        doc.text('SCHLECHTESTER TRADE', 15 + hw + 9, y + 5);
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); setColor(C.rose);
        doc.text(`$${parseFloat(worst.actual_pnl || 0).toFixed(2)}`, 15 + hw + 9, y + 12);
        doc.setFontSize(7); doc.setFont('helvetica', 'normal'); setColor(C.grey);
        doc.text(`${worst.pair || '-'} · ${worst.trade_date || ''}`, 15 + 2 * hw + 1, y + 12, { align: 'right' });
      }
      y += 22;
    }

    // ── Trade Log ─────────────────────────────────────────────────────────
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); setColor(C.black);
    doc.text('TRADE LOG', 15, y + 1);
    setFill(C.teal); doc.rect(15, y + 3, 20, 0.8, 'F');
    y += 9;

    setFill(C.black); doc.rect(15, y, pageW - 30, 8, 'F');
    doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); setColor(C.white);
    doc.text('DATUM', 18, y + 5);
    doc.text('PAIR', 40, y + 5);
    doc.text('RICHT.', 62, y + 5);
    doc.text('SCORE', 78, y + 5);
    doc.text('ERGEBNIS', 100, y + 5);
    doc.text('P&L', 130, y + 5);
    doc.text('NOTIZ', 152, y + 5);
    y += 11;

    doc.setFont('helvetica', 'normal'); setColor(C.black);
    monthTrades.forEach((trade, idx) => {
      if (y > 272) {
        doc.addPage();
        setFill(C.black); doc.rect(0, 0, pageW, 15, 'F');
        setColor(C.white); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text(`ZNPCV · MONATSBERICHT ${monthLabel}`, pageW / 2, 10, { align: 'center' });
        setFill(C.teal); doc.rect(0, 15, pageW, 1, 'F');
        setFill(C.black); doc.rect(15, 20, pageW - 30, 8, 'F');
        doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); setColor(C.white);
        doc.text('DATUM', 18, 25); doc.text('PAIR', 40, 25); doc.text('RICHT.', 62, 25);
        doc.text('SCORE', 78, 25); doc.text('ERGEBNIS', 100, 25); doc.text('P&L', 130, 25); doc.text('NOTIZ', 152, 25);
        y = 33; doc.setFont('helvetica', 'normal'); setColor(C.black);
      }

      if (idx % 2 === 0) { setFill(C.bg); doc.setDrawColor(0,0,0,0); doc.rect(15, y - 3.5, pageW - 30, 8, 'F'); }
      doc.setDrawColor(...C.lightgrey); doc.setLineWidth(0.1); doc.line(15, y + 4, pageW - 15, y + 4);

      const score = Math.round(trade.completion_percentage || 0);
      const status = trade.outcome === 'win' ? 'WIN' : trade.outcome === 'loss' ? 'LOSS' : trade.outcome === 'breakeven' ? 'BE' : 'OFFEN';
      const pnlVal = trade.actual_pnl ? parseFloat(trade.actual_pnl) : null;
      const noteRaw = trade.notes?.trim() || '';
      const noteShort = noteRaw.length > 35 ? noteRaw.slice(0, 35) + '…' : noteRaw;

      doc.setFontSize(7); doc.setFont('helvetica', 'normal'); setColor(C.black);
      doc.text(trade.trade_date || '-', 18, y);
      doc.setFont('helvetica', 'bold');
      doc.text((trade.pair || '-').substring(0, 8), 40, y);
      doc.setFont('helvetica', 'normal');
      doc.text((trade.direction === 'long' ? 'L' : trade.direction === 'short' ? 'S' : '-'), 62, y);

      if (score >= 85) setColor(C.teal); else if (score >= 70) setColor([180,130,0]); else setColor(C.grey);
      doc.setFont('helvetica', 'bold'); doc.text(`${score}%`, 78, y);

      if (status === 'WIN') setColor(C.teal); else if (status === 'LOSS') setColor(C.rose); else setColor(C.grey);
      doc.text(status, 100, y);

      if (pnlVal !== null) {
        if (pnlVal > 0) setColor(C.teal); else if (pnlVal < 0) setColor(C.rose); else setColor(C.grey);
        doc.text(`${pnlVal > 0 ? '+' : ''}$${pnlVal.toFixed(2)}`, 130, y);
      } else { setColor(C.grey); doc.text('-', 130, y); }

      doc.setFont('helvetica', 'normal'); setColor(C.grey);
      doc.setFontSize(6); doc.text(noteShort, 152, y);
      y += 9;
    });

    if (monthTrades.length === 0) {
      setColor(C.grey); doc.setFontSize(8); doc.setFont('helvetica', 'italic');
      doc.text('Keine Trades in diesem Monat.', pageW / 2, y + 6, { align: 'center' });
      y += 16;
    }
    y += 6;

    // ── Learnings Section ─────────────────────────────────────────────────
    if (learnings.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); setColor(C.black);
      doc.text('LEARNINGS & REVIEW', 15, y);
      setFill(C.teal); doc.rect(15, y + 2, 38, 0.8, 'F');
      y += 10;

      learnings.forEach((learning, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(learning, pageW - 50);
        const blockH = Math.max(14, lines.length * 4.5 + 8);
        setFill(C.bg); doc.setDrawColor(...C.lightgrey); doc.setLineWidth(0.3);
        doc.roundedRect(15, y, pageW - 30, blockH, 2, 2, 'FD');
        setFill(C.teal); doc.rect(15, y, 2, blockH, 'F');
        doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); setColor(C.teal);
        doc.text(`LEARNING ${i + 1}`, 21, y + 5);
        doc.setFont('helvetica', 'normal'); setColor(C.black); doc.setFontSize(7.5);
        doc.text(lines, 21, y + 11);
        y += blockH + 4;
      });
    }

    // ── Footer ────────────────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      setFill([245,245,245]); doc.rect(0, 285, pageW, 12, 'F');
      doc.setFontSize(6.5); setColor(C.grey); doc.setFont('helvetica', 'normal');
      doc.text('ZNPCV Professional Trading Platform · znpcv.de', pageW / 2, 290, { align: 'center' });
      doc.text(`Seite ${p} / ${pageCount}`, pageW - 15, 290, { align: 'right' });
    }

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=ZNPCV_Monatsbericht_${month}.pdf`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    console.error('exportMonthlyReport error:', err.message);
    return Response.json({ error: 'Export fehlgeschlagen.' }, { status: 500 });
  }
});