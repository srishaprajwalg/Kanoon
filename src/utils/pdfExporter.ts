import jsPDFImport from 'jspdf';

const JSPDF = (jsPDFImport as any).jsPDF || jsPDFImport;

export interface PDFExportOptions {
  title: string;
  state?: string;
  draftText: string;
  fileName?: string;
}

/**
 * Robust multi-page PDF generator for legal documents.
 * Handles automatic text wrapping, page height overflow checking, page additions,
 * headings formatting, margin preservation, and page numbering.
 */
export function exportDocumentToPDF({ title, state, draftText, fileName }: PDFExportOptions): void {
  const pdf = new JSPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.width;   // ~595.28 pt
  const pageHeight = pdf.internal.pageSize.height;  // ~841.89 pt

  const marginTop = 45;
  const marginBottom = 50;
  const marginLeft = 45;
  const marginRight = 45;
  const contentWidth = pageWidth - marginLeft - marginRight; // ~505 pt
  const maxY = pageHeight - marginBottom;

  let currentY = marginTop;

  const addNewPage = () => {
    pdf.addPage();
    currentY = marginTop;
  };

  // Header Title Banner on First Page
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(20, 20, 30);

  const titleLines: string[] = pdf.splitTextToSize(title.toUpperCase(), contentWidth);
  for (const line of titleLines) {
    if (currentY + 20 > maxY) addNewPage();
    pdf.text(line, marginLeft, currentY);
    currentY += 18;
  }

  // Subheader Info Banner
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(90, 90, 100);
  pdf.text(`State Jurisdiction: ${state || 'India'} | Grounded Plain-Language Legal Draft`, marginLeft, currentY);
  currentY += 12;

  pdf.setDrawColor(200, 200, 210);
  pdf.setLineWidth(0.75);
  pdf.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 18;
  pdf.setTextColor(0, 0, 0); // Reset text color to black

  // Parse draftText line by line / paragraph by paragraph
  const paragraphs = draftText.split('\n');
  const lineSpacing = 14;

  for (let i = 0; i < paragraphs.length; i++) {
    const rawParagraph = paragraphs[i];

    // Empty line spacing
    if (rawParagraph.trim() === '') {
      currentY += 8;
      if (currentY > maxY) addNewPage();
      continue;
    }

    const trimmed = rawParagraph.trim();

    // Formatting detection: check if line is a major header or section header
    const isMainTitleHeader = /^(RESIDENTIAL|MUTUAL|MASTER|EMPLOYMENT|PARTNERSHIP|LEGAL NOTICE|[A-Z\s]{5,})$/.test(trimmed) && trimmed.length < 80;
    const isSectionHeader = /^(\d+\.|\d+\.\d+|BETWEEN:|AND:|PARTIES:|SCHEDULE|DEFINITIONS|GRANT OF|LICENSE FEE|MONTHLY RENT|LOCK-IN|TERMINATION|STATUTORY|DISPUTE|SPECIALIZED CONTRACT|CUSTOM AGREED|GOVERNING LAW)/i.test(trimmed);

    if (isMainTitleHeader || isSectionHeader) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(20, 20, 40);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(30, 30, 30);
    }

    // Split wrapped lines for current paragraph according to printable width
    const wrappedLines: string[] = pdf.splitTextToSize(rawParagraph, contentWidth);

    for (const line of wrappedLines) {
      if (currentY + lineSpacing > maxY) {
        addNewPage();
      }
      pdf.text(line, marginLeft, currentY);
      currentY += lineSpacing;
    }
  }

  // Add Page Numbers in Footer on All Pages
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(130, 130, 140);
    pdf.text(
      `Page ${p} of ${totalPages} — Kanoon AI Legal Document (${state || 'India'})`,
      marginLeft,
      pageHeight - 25
    );
  }

  const sanitizedFileName = fileName || `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_KanoonAI.pdf`;
  pdf.save(sanitizedFileName);
}
