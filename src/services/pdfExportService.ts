import { jsPDF } from "jspdf";
import { SavedItem } from "../types";

export interface PDFExportOptions {
  title?: string;
  author?: string;
  includeTimestamp?: boolean;
}

export function exportVaultToPDF(items: SavedItem[], options?: PDFExportOptions): void {
  if (!items || items.length === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const addNewPageIfNeeded = (requiredHeight: number) => {
    if (cursorY + requiredHeight > pageHeight - margin - 15) {
      doc.addPage();
      cursorY = margin + 10;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    // Subtle top banner
    doc.setFillColor(245, 235, 220); // Warm cream
    doc.rect(margin, 8, contentWidth, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9); // Amber-700
    doc.text("BHARAT GPT • SMRITI KOSH WISDOM VAULT", margin + 3, 12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Offline Reading Collection", pageWidth - margin - 3, 12, { align: "right" });
  };

  const drawPageFooters = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer divider
      doc.setDrawColor(217, 119, 6); // Amber-600
      doc.setLineWidth(0.4);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      // Footer text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text("Preserving Indian Heritage, Philosophy & Ancient Sciences • Bharat GPT", margin, pageHeight - 7);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    }
  };

  // ==========================================
  // COVER / DOCUMENT HEADER
  // ==========================================
  // Header background decorative box
  doc.setFillColor(25, 23, 17); // Dark saffron-slate
  doc.roundedRect(margin, cursorY, contentWidth, 36, 3, 3, "F");

  // Golden accent bar on left
  doc.setFillColor(217, 119, 6); // Amber
  doc.roundedRect(margin, cursorY, 3.5, 36, 1.5, 1.5, "F");

  // Title text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 237, 213); // Amber-100
  doc.text("BHARAT GPT — SMRITI KOSH", margin + 8, cursorY + 11);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(251, 191, 36); // Amber-400
  doc.text("Indic Wisdom, Philosophy, Stories & Heritage Vault", margin + 8, cursorY + 18);

  // Metadata ribbon inside header box
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Export Date: ${dateStr}   |   Saved Items: ${items.length} records   |   Format: Offline Reader`, margin + 8, cursorY + 28);

  cursorY += 44;

  // ==========================================
  // ITEMS ITERATION
  // ==========================================
  items.forEach((item, index) => {
    addNewPageIfNeeded(40);

    const itemTopY = cursorY;
    const typeLabel = (item.type || "wisdom").toUpperCase();

    // Determine badge color based on type
    let badgeBg = [254, 243, 199]; // Amber-100
    let badgeText = [180, 83, 9];   // Amber-800
    let badgeSymbol = "◈";

    if (item.type === "shloka") {
      badgeBg = [254, 235, 200];
      badgeText = [194, 65, 12]; // Orange-700
      badgeSymbol = "🪷";
    } else if (item.type === "story") {
      badgeBg = [254, 240, 215];
      badgeText = [180, 83, 9];
      badgeSymbol = "📜";
    } else if (item.type === "chat") {
      badgeBg = [238, 242, 255];
      badgeText = [67, 56, 202]; // Indigo-700
      badgeSymbol = "💬";
    } else if (item.type === "heritage") {
      badgeBg = [236, 253, 245];
      badgeText = [4, 120, 87]; // Emerald-700
      badgeSymbol = "🏛️";
    }

    // Type Badge
    doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
    doc.roundedRect(margin, cursorY, 28, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(badgeText[0], badgeText[1], badgeText[2]);
    doc.text(`${badgeSymbol} ${typeLabel}`, margin + 2.5, cursorY + 4);

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(item.date || "Preserved", pageWidth - margin, cursorY + 4, { align: "right" });

    cursorY += 8;

    // Item Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // Slate-800
    const titleLines = doc.splitTextToSize(`${index + 1}. ${item.title}`, contentWidth);
    doc.text(titleLines, margin, cursorY + 2);
    cursorY += titleLines.length * 5 + 3;

    // Specific formatting according to item data type
    const data = item.data;

    if (item.type === "shloka" && data) {
      // 1. Sanskrit Verse / Transliteration
      if (data.transliteration || data.sanskrit) {
        addNewPageIfNeeded(25);
        doc.setFillColor(254, 252, 245); // Very soft warm cream
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.3);

        const verseText = data.transliteration || data.sanskrit || "";
        const verseLines = doc.splitTextToSize(verseText, contentWidth - 8);
        const verseBoxHeight = Math.max(verseLines.length * 4.5 + 8, 14);

        doc.roundedRect(margin, cursorY, contentWidth, verseBoxHeight, 1.5, 1.5, "FD");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(180, 83, 9);
        doc.text("SANSKRIT VERSE (IAST TRANSLITERATION):", margin + 4, cursorY + 5);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(55, 65, 81);
        doc.text(verseLines, margin + 4, cursorY + 10);

        cursorY += verseBoxHeight + 4;
      }

      // 2. Translation
      if (data.translation || item.snippet) {
        addNewPageIfNeeded(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(180, 83, 9);
        doc.text("Translation & Essence:", margin, cursorY + 3);
        cursorY += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const transLines = doc.splitTextToSize(data.translation || item.snippet, contentWidth);
        doc.text(transLines, margin, cursorY);
        cursorY += transLines.length * 4.5 + 4;
      }

      // 3. Life Guidance
      if (data.lifeGuidance) {
        addNewPageIfNeeded(25);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.2);
        
        const guidanceLines = doc.splitTextToSize(data.lifeGuidance, contentWidth - 8);
        const gBoxHeight = guidanceLines.length * 4.2 + 8;
        
        doc.roundedRect(margin, cursorY, contentWidth, gBoxHeight, 1.5, 1.5, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text("PRACTICAL LIFE GUIDANCE (NITI & DHARMA):", margin + 4, cursorY + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(guidanceLines, margin + 4, cursorY + 10);

        cursorY += gBoxHeight + 4;
      }
    } else if (item.type === "story" && data) {
      // Story chapter and narrative
      if (data.chapter) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(194, 65, 12);
        doc.text(data.chapter, margin, cursorY + 2);
        cursorY += 6;
      }

      const narrativeText = data.narrative || item.snippet;
      if (narrativeText) {
        addNewPageIfNeeded(25);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const narrLines = doc.splitTextToSize(narrativeText, contentWidth);
        doc.text(narrLines, margin, cursorY);
        cursorY += narrLines.length * 4.3 + 4;
      }

      if (data.moralOrWisdom) {
        addNewPageIfNeeded(16);
        doc.setFillColor(254, 243, 199);
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.2);

        const moralLines = doc.splitTextToSize(data.moralOrWisdom, contentWidth - 8);
        const mHeight = moralLines.length * 4.2 + 7;

        doc.roundedRect(margin, cursorY, contentWidth, mHeight, 1, 1, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(146, 64, 14);
        doc.text("MORAL & ETHICAL REFLECTION:", margin + 4, cursorY + 4.5);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(69, 26, 3);
        doc.text(moralLines, margin + 4, cursorY + 9);

        cursorY += mHeight + 4;
      }
    } else {
      // General item snippet / content
      const content = item.snippet || (typeof data === "string" ? data : JSON.stringify(data));
      if (content) {
        addNewPageIfNeeded(20);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const textLines = doc.splitTextToSize(content, contentWidth);
        doc.text(textLines, margin, cursorY);
        cursorY += textLines.length * 4.3 + 4;
      }
    }

    // Separator line between items
    cursorY += 2;
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 8;
  });

  // Apply page footers across all generated pages
  drawPageFooters();

  // Save the document to download
  const safeFilename = `Bharat_GPT_Smriti_Vault_${Date.now()}.pdf`;
  doc.save(safeFilename);
}

export function exportSingleItemToPDF(item: SavedItem): void {
  exportVaultToPDF([item]);
}
