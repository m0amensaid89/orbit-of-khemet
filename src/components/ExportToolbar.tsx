'use client';

import { useState } from 'react';
import { FileText, FileSpreadsheet, Presentation, FileCode, Loader2, Download } from 'lucide-react';
import * as xlsx from 'xlsx';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import pptxgen from 'pptxgenjs';

interface ExportToolbarProps {
  content: string;
  title: string;
}

export function ExportToolbar({ content, title }: ExportToolbarProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const cleanContent = content.replace(/```markdown|```html|```csv|```json|```python|```javascript|```/g, '').trim();

  const handleExportWord = async () => {
    setIsExporting('word');
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: cleanContent.split('\n').map(line =>
            new Paragraph({
              children: [new TextRun(line)],
            })
          ),
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
    setIsExporting(null);
  };

  const handleExportExcel = async () => {
    setIsExporting('excel');
    try {
      const isCSV = cleanContent.includes(',') && cleanContent.split('\n').length > 1;
      const wb = xlsx.utils.book_new();

      if (isCSV) {
        // Parse CSV style text
        const rows = cleanContent.split('\n').map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
        const ws = xlsx.utils.aoa_to_sheet(rows);
        xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
      } else {
        // Fallback generic text to rows
        const rows = cleanContent.split('\n').map(r => [r]);
        const ws = xlsx.utils.aoa_to_sheet(rows);
        xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
      }

      xlsx.writeFile(wb, `${title.replace(/\s+/g, '-').toLowerCase()}.xlsx`);
    } catch (e) {
      console.error(e);
    }
    setIsExporting(null);
  };

  const handleExportPPT = async () => {
    setIsExporting('ppt');
    try {
      const pres = new pptxgen();
      const slide = pres.addSlide();

      // Basic translation of text to slides
      const lines = cleanContent.split('\n').filter(l => l.trim().length > 0);

      slide.addText(title, { x: 1, y: 1, w: 8, h: 1, fontSize: 24, bold: true, color: '363636' });

      let yOffset = 2.5;
      lines.slice(0, 5).forEach((line) => {
        slide.addText(line.substring(0, 100), { x: 1, y: yOffset, w: 8, h: 0.5, fontSize: 14, color: '666666' });
        yOffset += 0.6;
      });

      await pres.writeFile({ fileName: `${title.replace(/\s+/g, '-').toLowerCase()}.pptx` });
    } catch (e) {
      console.error(e);
    }
    setIsExporting(null);
  };

  const handleExportPDF = async () => {
    setIsExporting('pdf');
    try {
      // Using browser native print-to-pdf style or basic text parsing
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const splitText = doc.splitTextToSize(cleanContent, 180);
      doc.text(title, 10, 10);
      doc.text(splitText, 10, 20);
      doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (e) {
      console.error(e);
    }
    setIsExporting(null);
  };

  return (
    <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
      <span className="font-[Orbitron] text-[8px] tracking-[2px] uppercase text-white/40 mr-2">
        Pro Export
      </span>

      <button
        onClick={handleExportPDF}
        disabled={!!isExporting}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
        style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
        {isExporting === 'pdf' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
        <span className="font-mono text-[9px] uppercase tracking-wider">PDF</span>
      </button>

      <button
        onClick={handleExportExcel}
        disabled={!!isExporting}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-all hover:bg-green-500/10 hover:text-green-400 disabled:opacity-50"
        style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
        {isExporting === 'excel' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileSpreadsheet className="w-3 h-3" />}
        <span className="font-mono text-[9px] uppercase tracking-wider">Excel</span>
      </button>

      <button
        onClick={handleExportPPT}
        disabled={!!isExporting}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-all hover:bg-orange-500/10 hover:text-orange-400 disabled:opacity-50"
        style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
        {isExporting === 'ppt' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Presentation className="w-3 h-3" />}
        <span className="font-mono text-[9px] uppercase tracking-wider">PPT</span>
      </button>

      <button
        onClick={handleExportWord}
        disabled={!!isExporting}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-all hover:bg-blue-500/10 hover:text-blue-400 disabled:opacity-50"
        style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
        {isExporting === 'word' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileCode className="w-3 h-3" />}
        <span className="font-mono text-[9px] uppercase tracking-wider">Word</span>
      </button>
    </div>
  );
}
