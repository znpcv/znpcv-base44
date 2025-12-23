import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const trades = await base44.entities.TradeChecklist.list('-created_date', 100);
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ZNPCV TRADE REPORT', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('de-DE')}`, 20, 28);
  doc.text(`Trader: ${user.full_name || user.email}`, 20, 34);

  // Stats
  const executedTrades = trades.filter(t => t.outcome && t.outcome !== 'pending');
  const wins = executedTrades.filter(t => t.outcome === 'win').length;
  const losses = executedTrades.filter(t => t.outcome === 'loss').length;
  const totalPnL = executedTrades.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
  const winRate = executedTrades.length > 0 ? ((wins / executedTrades.length) * 100).toFixed(1) : 0;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PERFORMANCE SUMMARY', 20, 45);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Trades: ${trades.length}`, 20, 53);
  doc.text(`Win Rate: ${winRate}%`, 20, 59);
  doc.text(`Total P&L: $${totalPnL.toFixed(2)}`, 20, 65);
  doc.text(`Wins/Losses: ${wins}/${losses}`, 20, 71);

  // Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TRADE LOG', 20, 85);

  doc.setFontSize(9);
  doc.text('Date', 20, 93);
  doc.text('Pair', 50, 93);
  doc.text('Dir', 80, 93);
  doc.text('Score', 100, 93);
  doc.text('P&L', 125, 93);
  doc.text('Status', 155, 93);

  let y = 100;
  doc.setFont('helvetica', 'normal');
  
  trades.slice(0, 30).forEach((trade) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const date = new Date(trade.created_date).toLocaleDateString('de-DE');
    const pnl = trade.actual_pnl ? `$${trade.actual_pnl}` : '-';
    const status = trade.outcome || 'Pending';
    const score = Math.round(trade.completion_percentage || 0);

    doc.text(date, 20, y);
    doc.text(trade.pair || '-', 50, y);
    doc.text((trade.direction || '-').toUpperCase().substring(0, 1), 80, y);
    doc.text(`${score}%`, 100, y);
    doc.text(pnl, 125, y);
    doc.text(status, 155, y);
    
    y += 7;
  });

  const pdfBytes = doc.output('arraybuffer');

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ZNPCV_Trades_${new Date().toISOString().split('T')[0]}.pdf`
    }
  });
});