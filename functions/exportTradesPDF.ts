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

  // Fetch ZNPCV Logo
  const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png";
  let logoDataUrl = null;
  try {
    const logoResponse = await fetch(logoUrl);
    const logoBlob = await logoResponse.blob();
    const arrayBuffer = await logoBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    logoDataUrl = `data:image/png;base64,${base64}`;
  } catch (e) {
    console.error('Logo fetch failed:', e);
  }

  // Ultra Professional Header with Logo
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 45, 'F');
  
  // Add Logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 15, 8, 35, 10);
    } catch (e) {
      console.error('Logo render failed:', e);
    }
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFESSIONAL TRADING REPORT', 105, 22, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ultimate Checklist Analysis', 105, 28, { align: 'center' });
  
  // Subtle accent line
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 45, 210, 1, 'F');
  
  // Report Metadata - Modern Layout
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`GENERATED: ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}`, 20, 54);
  doc.text(`TRADER: ${user.full_name || user.email}`, 20, 59);
  doc.setTextColor(13, 148, 136);
  doc.setFont('helvetica', 'bold');
  doc.text(`${trades.length} TRADES ANALYZED`, 190, 54, { align: 'right' });

  // Performance Summary - Ultra Modern Cards
  const executedTrades = trades.filter(t => t.outcome && t.outcome !== 'pending');
  const wins = executedTrades.filter(t => t.outcome === 'win').length;
  const losses = executedTrades.filter(t => t.outcome === 'loss').length;
  const totalPnL = executedTrades.reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0);
  const winRate = executedTrades.length > 0 ? ((wins / executedTrades.length) * 100).toFixed(1) : '0.0';
  const avgWin = wins > 0 ? (executedTrades.filter(t => t.outcome === 'win').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / wins).toFixed(2) : '0.00';
  const avgLoss = losses > 0 ? Math.abs(executedTrades.filter(t => t.outcome === 'loss').reduce((sum, t) => sum + parseFloat(t.actual_pnl || 0), 0) / losses).toFixed(2) : '0.00';
  const profitFactor = losses > 0 && avgLoss > 0 ? ((wins * parseFloat(avgWin)) / (losses * parseFloat(avgLoss))).toFixed(2) : '-';

  // Modern gradient-style cards
  doc.setFillColor(13, 148, 136);
  doc.roundedRect(20, 68, 55, 35, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL P&L', 23, 75);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalPnL.toFixed(2)}`, 23, 87);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${executedTrades.length} executed`, 23, 98);

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.roundedRect(80, 68, 35, 35, 2, 2, 'FD');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.text('WIN RATE', 83, 75);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 148, 136);
  doc.text(`${winRate}%`, 83, 87);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${wins}W / ${losses}L`, 83, 98);

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(120, 68, 35, 35, 2, 2, 'FD');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.text('AVG WIN', 123, 75);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 148, 136);
  doc.text(`$${avgWin}`, 123, 87);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Loss: $${avgLoss}`, 123, 98);

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(160, 68, 35, 35, 2, 2, 'FD');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.text('PROFIT', 163, 75);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(profitFactor, 163, 87);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Factor', 163, 98);

  // Trade Table Header - Modern Design
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DETAILED TRADE LOG', 20, 116);
  
  // Accent bar
  doc.setFillColor(13, 148, 136);
  doc.rect(20, 118, 40, 1, 'F');

  // Table Headers - Modern styled
  doc.setFillColor(0, 0, 0);
  doc.rect(20, 124, 170, 10, 'F');
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DATE', 23, 130);
  doc.text('PAIR', 45, 130);
  doc.text('DIR', 67, 130);
  doc.text('SCORE', 80, 130);
  doc.text('ENTRY', 100, 130);
  doc.text('SL', 120, 130);
  doc.text('TP', 135, 130);
  doc.text('P&L', 152, 130);
  doc.text('RESULT', 172, 130);

  let y = 141;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  trades.slice(0, 35).forEach((trade, idx) => {
    if (y > 275) {
      doc.addPage();
      
      // Minimal header on continuation pages
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 210, 25, 'F');
      
      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, 'PNG', 15, 7, 30, 9);
        } catch (e) {
          console.error('Logo render failed:', e);
        }
      }
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TRADE REPORT', 105, 15, { align: 'center' });
      
      doc.setFillColor(13, 148, 136);
      doc.rect(0, 25, 210, 1, 'F');
      
      // Table header on new page
      doc.setFillColor(0, 0, 0);
      doc.rect(20, 30, 170, 10, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('DATE', 23, 36);
      doc.text('PAIR', 45, 36);
      doc.text('DIR', 67, 36);
      doc.text('SCORE', 80, 36);
      doc.text('ENTRY', 100, 36);
      doc.text('SL', 120, 36);
      doc.text('TP', 135, 36);
      doc.text('P&L', 152, 36);
      doc.text('RESULT', 172, 36);
      
      y = 47;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    }

    // Modern alternating rows with subtle borders
    if (idx % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, y - 4.5, 170, 8, 'F');
    }
    
    // Subtle row separator
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.line(20, y + 3, 190, y + 3);

    const date = new Date(trade.created_date).toLocaleDateString('de-DE');
    const pnl = trade.actual_pnl ? `$${trade.actual_pnl}` : '-';
    const status = trade.outcome === 'win' ? 'WIN' : trade.outcome === 'loss' ? 'LOSS' : trade.outcome === 'breakeven' ? 'BE' : 'PEND';
    const score = Math.round(trade.completion_percentage || 0);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(date, 23, y);
    doc.setFont('helvetica', 'bold');
    doc.text(trade.pair || '-', 45, y);
    doc.setFont('helvetica', 'normal');
    doc.text((trade.direction || '-').toUpperCase().substring(0, 1), 67, y);
    
    // Score with color coding
    if (score >= 85) doc.setTextColor(13, 148, 136);
    else if (score >= 70) doc.setTextColor(234, 179, 8);
    else doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}%`, 80, y);
    
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(trade.entry_price || '-', 100, y);
    doc.text(trade.stop_loss || '-', 120, y);
    doc.text(trade.take_profit || '-', 135, y);
    
    // P&L with strong color coding
    if (trade.actual_pnl) {
      const pnlValue = parseFloat(trade.actual_pnl);
      if (pnlValue > 0) {
        doc.setTextColor(13, 148, 136);
        doc.setFont('helvetica', 'bold');
      } else if (pnlValue < 0) {
        doc.setTextColor(225, 29, 72);
        doc.setFont('helvetica', 'bold');
      }
    }
    doc.text(pnl, 152, y);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    
    // Status badge style
    doc.setFontSize(6.5);
    if (status === 'WIN') doc.setTextColor(13, 148, 136);
    else if (status === 'LOSS') doc.setTextColor(225, 29, 72);
    else doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text(status, 172, y);
    
    y += 8;
  });

  // Modern Footer
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 282, 210, 15, 'F');
  
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('ZNPCV - Ultimate Trading Checklist', 105, 288, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.text('"Discipline beats talent. Every. Single. Day."', 105, 293, { align: 'center' });

  const pdfBytes = doc.output('arraybuffer');

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ZNPCV_Report_${new Date().toISOString().split('T')[0]}.pdf`
    }
  });
});