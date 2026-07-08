import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate PDF from HTML element
 */
export async function generatePDFFromHTML(
  elementId: string,
  filename: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = orientation === 'portrait' ? 210 : 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Create invoice PDF with professional formatting
 */
export async function generateInvoicePDF(
  invoiceData: {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    companyName: string;
    companyAddress: string;
    clientName: string;
    clientAddress: string;
    clientEmail: string;
    items: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
    terms?: string;
  },
  filename: string
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yPosition = 20;

  // Header
  pdf.setFontSize(24);
  pdf.text('INVOICE', 20, yPosition);

  yPosition += 15;

  // Company info
  pdf.setFontSize(10);
  pdf.text(invoiceData.companyName, 20, yPosition);
  yPosition += 5;
  pdf.text(invoiceData.companyAddress, 20, yPosition);
  yPosition += 10;

  // Invoice details
  pdf.setFontSize(9);
  pdf.text(`Invoice #: ${invoiceData.invoiceNumber}`, 20, yPosition);
  yPosition += 5;
  pdf.text(`Issue Date: ${invoiceData.issueDate}`, 20, yPosition);
  yPosition += 5;
  pdf.text(`Due Date: ${invoiceData.dueDate}`, 20, yPosition);

  yPosition += 10;

  // Bill to
  pdf.setFontSize(10);
  pdf.text('Bill To:', 20, yPosition);
  yPosition += 5;
  pdf.setFontSize(9);
  pdf.text(invoiceData.clientName, 20, yPosition);
  yPosition += 4;
  pdf.text(invoiceData.clientAddress, 20, yPosition);
  yPosition += 4;
  pdf.text(invoiceData.clientEmail, 20, yPosition);

  yPosition += 10;

  // Line items table
  const tableStartY = yPosition;
  const columnWidth = 40;
  const descriptionWidth = 80;

  // Table header
  pdf.setFillColor(200, 200, 200);
  pdf.rect(20, tableStartY, descriptionWidth + columnWidth * 3, 7, 'F');

  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Description', 25, tableStartY + 5);
  pdf.text('Qty', 120, tableStartY + 5);
  pdf.text('Unit Price', 145, tableStartY + 5);
  pdf.text('Amount', 175, tableStartY + 5);

  yPosition = tableStartY + 12;

  // Table rows
  invoiceData.items.forEach((item) => {
    pdf.text(item.description.substring(0, 40), 25, yPosition);
    pdf.text(item.quantity.toString(), 120, yPosition);
    pdf.text(`$${item.unitPrice.toFixed(2)}`, 145, yPosition);
    pdf.text(`$${item.amount.toFixed(2)}`, 175, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Totals
  const totalX = 140;
  pdf.text('Subtotal:', totalX, yPosition);
  pdf.text(`$${invoiceData.subtotal.toFixed(2)}`, 175, yPosition);

  yPosition += 6;
  pdf.text('Tax:', totalX, yPosition);
  pdf.text(`$${invoiceData.tax.toFixed(2)}`, 175, yPosition);

  yPosition += 8;
  pdf.setFontSize(10);
  pdf.text('Total:', totalX, yPosition);
  pdf.text(`$${invoiceData.total.toFixed(2)}`, 175, yPosition);

  yPosition += 15;

  // Notes and terms
  if (invoiceData.notes || invoiceData.terms) {
    pdf.setFontSize(9);
    if (invoiceData.notes) {
      pdf.text('Notes:', 20, yPosition);
      yPosition += 5;
      const notesLines = pdf.splitTextToSize(invoiceData.notes, 170);
      pdf.text(notesLines, 20, yPosition);
      yPosition += notesLines.length * 4 + 5;
    }

    if (invoiceData.terms) {
      pdf.text('Terms:', 20, yPosition);
      yPosition += 5;
      const termsLines = pdf.splitTextToSize(invoiceData.terms, 170);
      pdf.text(termsLines, 20, yPosition);
    }
  }

  pdf.save(filename);
}

/**
 * Generate quote PDF
 */
export async function generateQuotePDF(
  quoteData: {
    quoteNumber: string;
    date: string;
    expiryDate: string;
    companyName: string;
    companyAddress: string;
    clientName: string;
    clientAddress: string;
    items: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
    subtotal: number;
    tax: number;
    total: number;
    validUntil?: string;
    notes?: string;
  },
  filename: string
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yPosition = 20;

  // Header
  pdf.setFontSize(24);
  pdf.text('QUOTE', 20, yPosition);

  yPosition += 15;

  // Company info
  pdf.setFontSize(10);
  pdf.text(quoteData.companyName, 20, yPosition);
  yPosition += 5;
  pdf.text(quoteData.companyAddress, 20, yPosition);
  yPosition += 10;

  // Quote details
  pdf.setFontSize(9);
  pdf.text(`Quote #: ${quoteData.quoteNumber}`, 20, yPosition);
  yPosition += 5;
  pdf.text(`Date: ${quoteData.date}`, 20, yPosition);
  yPosition += 5;
  pdf.text(`Valid Until: ${quoteData.expiryDate}`, 20, yPosition);

  yPosition += 10;

  // Bill to
  pdf.setFontSize(10);
  pdf.text('Quote For:', 20, yPosition);
  yPosition += 5;
  pdf.setFontSize(9);
  pdf.text(quoteData.clientName, 20, yPosition);
  yPosition += 4;
  pdf.text(quoteData.clientAddress, 20, yPosition);

  yPosition += 10;

  // Line items (same as invoice)
  const tableStartY = yPosition;

  pdf.setFillColor(200, 200, 200);
  pdf.rect(20, tableStartY, 170, 7, 'F');

  pdf.setFontSize(9);
  pdf.text('Description', 25, tableStartY + 5);
  pdf.text('Qty', 120, tableStartY + 5);
  pdf.text('Unit Price', 145, tableStartY + 5);
  pdf.text('Amount', 175, tableStartY + 5);

  yPosition = tableStartY + 12;

  quoteData.items.forEach((item) => {
    pdf.text(item.description.substring(0, 40), 25, yPosition);
    pdf.text(item.quantity.toString(), 120, yPosition);
    pdf.text(`$${item.unitPrice.toFixed(2)}`, 145, yPosition);
    pdf.text(`$${item.amount.toFixed(2)}`, 175, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Totals
  const totalX = 140;
  pdf.text('Subtotal:', totalX, yPosition);
  pdf.text(`$${quoteData.subtotal.toFixed(2)}`, 175, yPosition);

  yPosition += 6;
  pdf.text('Tax:', totalX, yPosition);
  pdf.text(`$${quoteData.tax.toFixed(2)}`, 175, yPosition);

  yPosition += 8;
  pdf.setFontSize(10);
  pdf.text('Total:', totalX, yPosition);
  pdf.text(`$${quoteData.total.toFixed(2)}`, 175, yPosition);

  yPosition += 15;

  // Notes
  if (quoteData.notes) {
    pdf.setFontSize(9);
    pdf.text('Notes:', 20, yPosition);
    yPosition += 5;
    const notesLines = pdf.splitTextToSize(quoteData.notes, 170);
    pdf.text(notesLines, 20, yPosition);
  }

  pdf.save(filename);
}

/**
 * Download PDF
 */
export function downloadPDF(pdf: jsPDF, filename: string): void {
  pdf.save(filename);
}
