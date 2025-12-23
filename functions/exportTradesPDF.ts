import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allTrades = await base44.entities.TradeChecklist.list('-created_date', 100);
  const trades = allTrades.filter(t => !t.deleted);
  const doc = new jsPDF();

  // Professional Header with Brand Colors
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('ZNPCV', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('PROFESSIONAL TRADING REPORT', 105, 23, { align: 'center' });
  
  // Report Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}`, 20, 42);
  doc.text(`Trader: ${user.full_name || user.email}`, 20, 47);
  doc.text(`Total Trades Analyzed: ${trades.length}`, 20, 52);

  // Performance Summary Box
  const executedTrades = trades.filter(t => t.outcome && t.outcome !== 'pending');
  const wins = executedTrades.filter(t => t.outcome === 'win').length;
  const losses = executedTrades.filter(t => t.outcome === 'loss').length;
  const totalPnL = executedTrades.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
  const winRate = executedTrades.length > 0 ? ((wins / executedTrades.length) * 100).toFixed(1) : '0.0';
  const avgWin = wins > 0 ? (executedTrades.filter(t => t.outcome === 'win').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / wins).toFixed(2) : '0.00';
  const avgLoss = losses > 0 ? Math.abs(executedTrades.filter(t => t.outcome === 'loss').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / losses).toFixed(2) : '0.00';

  doc.setFillColor(13, 148, 136);
  doc.roundedRect(20, 60, 85, 40, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PERFORMANCE', 25, 68);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Win Rate: ${winRate}%`, 25, 76);
  doc.text(`Total P&L: $${totalPnL.toFixed(2)}`, 25, 82);
  doc.text(`Wins/Losses: ${wins}/${losses}`, 25, 88);
  doc.text(`Avg Win: $${avgWin}`, 25, 94);

  doc.setFillColor(39, 39, 42);
  doc.roundedRect(110, 60, 85, 40, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('STATISTICS', 115, 68);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Executed: ${executedTrades.length}`, 115, 76);
  doc.text(`Pending: ${trades.length - executedTrades.length}`, 115, 82);
  doc.text(`Avg Loss: $${avgLoss}`, 115, 88);
  doc.text(`Best Trade: $${Math.max(...executedTrades.map(t => parseFloat(t.actual_pnl) || 0), 0).toFixed(2)}`, 115, 94);

  // Trade Table Header
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DETAILED TRADE LOG', 20, 115);

  // Table Headers
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 120, 170, 8, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE', 22, 125);
  doc.text('PAIR', 45, 125);
  doc.text('DIR', 70, 125);
  doc.text('SCORE', 85, 125);
  doc.text('ENTRY', 105, 125);
  doc.text('SL', 125, 125);
  doc.text('TP', 140, 125);
  doc.text('P&L', 155, 125);
  doc.text('STATUS', 172, 125);

  let y = 133;
  doc.setFont('helvetica', 'normal');
  
  trades.slice(0, 30).forEach((trade, idx) => {
    if (y > 275) {
      doc.addPage();
      
      // Add header on new page
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ZNPCV TRADE REPORT', 105, 12, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 25, 170, 8, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('DATE', 22, 30);
      doc.text('PAIR', 45, 30);
      doc.text('DIR', 70, 30);
      doc.text('SCORE', 85, 30);
      doc.text('ENTRY', 105, 30);
      doc.text('SL', 125, 30);
      doc.text('TP', 140, 30);
      doc.text('P&L', 155, 30);
      doc.text('STATUS', 172, 30);
      
      y = 38;
      doc.setFont('helvetica', 'normal');
    }

    // Alternating row colors
    if (idx % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, y - 4, 170, 7, 'F');
    }

    const date = new Date(trade.created_date).toLocaleDateString('de-DE');
    const pnl = trade.actual_pnl ? `$${trade.actual_pnl}` : '-';
    const status = trade.outcome || 'Pending';
    const score = Math.round(trade.completion_percentage || 0);

    doc.setFontSize(7);
    doc.text(date, 22, y);
    doc.text(trade.pair || '-', 45, y);
    doc.text((trade.direction || '-').toUpperCase().substring(0, 1), 70, y);
    doc.text(`${score}%`, 85, y);
    doc.text(trade.entry_price || '-', 105, y);
    doc.text(trade.stop_loss || '-', 125, y);
    doc.text(trade.take_profit || '-', 140, y);
    
    // Color code P&L
    if (trade.actual_pnl) {
      const pnlValue = parseFloat(trade.actual_pnl);
      if (pnlValue > 0) doc.setTextColor(13, 148, 136);
      else if (pnlValue < 0) doc.setTextColor(225, 29, 72);
    }
    doc.text(pnl, 155, y);
    doc.setTextColor(0, 0, 0);
    
    doc.text(status, 172, y);
    
    y += 7;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('ZNPCV - Ultimate Trading Checklist | www.znpcv.com', 105, 290, { align: 'center' });
  doc.text('Discipline beats talent. Every. Single. Day.', 105, 295, { align: 'center' });

  const pdfBytes = doc.output('arraybuffer');

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ZNPCV_Report_${new Date().toISOString().split('T')[0]}.pdf`
    }
  });
});