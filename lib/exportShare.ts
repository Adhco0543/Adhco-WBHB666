/**
 * Export & Share System
 * Generate exportable formats and sharing options for quotes, materials, and documents
 */

import type { ProjectQuote, ProjectMaterial, WorkspaceProject, MaterialItem } from "@/lib/workspaceTypes";

export interface ExportOption {
  format: "pdf" | "html" | "json" | "csv" | "email";
  label: string;
  description: string;
  icon: string;
}

/**
 * Available export formats
 */
export const EXPORT_OPTIONS: ExportOption[] = [
  {
    format: "html",
    label: "View in Browser",
    description: "Open formatted HTML document",
    icon: "🌐",
  },
  {
    format: "json",
    label: "Export JSON",
    description: "Export structured data for records",
    icon: "📋",
  },
  {
    format: "csv",
    label: "Export CSV",
    description: "Download materials as CSV",
    icon: "📊",
  },
  {
    format: "email",
    label: "Email Draft",
    description: "Create email with quote attached",
    icon: "📧",
  },
  {
    format: "pdf",
    label: "PDF (Coming Soon)",
    description: "Download as PDF document",
    icon: "📄",
  },
];

/**
 * Generate HTML quote document
 */
export function generateQuoteHTML(quote: ProjectQuote, project: WorkspaceProject): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${quote.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      color: #1f2937;
      background: #f9fafb;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 20px;
    }
    .title {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }
    .quote-meta {
      text-align: right;
      font-size: 14px;
      color: #6b7280;
    }
    .quote-meta p {
      margin: 4px 0;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #1f2937;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .detail-item {
      font-size: 14px;
    }
    .detail-label {
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .detail-value {
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
      font-size: 14px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .amount-right {
      text-align: right;
      font-weight: 600;
    }
    .total {
      font-size: 20px;
      font-weight: 700;
      color: #3b82f6;
      text-align: right;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #3b82f6;
    }
    .notes {
      font-size: 14px;
      line-height: 1.6;
      color: #4b5563;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">${quote.title}</h1>
      <div class="quote-meta">
        <p><strong>Status:</strong> ${quote.status}</p>
        <p><strong>Date:</strong> ${new Date(quote.createdAt).toLocaleDateString()}</p>
        <p><strong>To:</strong> ${quote.recipient || project.clientName}</p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Project Information</div>
      <div class="details">
        <div class="detail-item">
          <div class="detail-label">Project</div>
          <div class="detail-value">${project.title}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Client</div>
          <div class="detail-value">${project.clientName}</div>
        </div>
        ${project.clientEmail ? `<div class="detail-item">
          <div class="detail-label">Email</div>
          <div class="detail-value">${project.clientEmail}</div>
        </div>` : ""}
        ${project.clientPhone ? `<div class="detail-item">
          <div class="detail-label">Phone</div>
          <div class="detail-value">${project.clientPhone}</div>
        </div>` : ""}
      </div>
    </div>

    ${quote.content ? `<div class="section">
      <div class="section-title">Description</div>
      <div class="notes">${quote.content}</div>
    </div>` : ""}

    ${quote.amount ? `<div class="section">
      <div class="total">Total: $${quote.amount.toLocaleString()}</div>
    </div>` : ""}

    <div class="footer">
      <p>Generated on ${new Date().toLocaleString()}</p>
      <p>This quote is valid for 30 days from the date above.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return html;
}

/**
 * Generate materials list HTML
 */
export function generateMaterialsHTML(materials: ProjectMaterial, project: WorkspaceProject): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${materials.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      color: #1f2937;
      background: #f9fafb;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 { font-size: 28px; margin: 0 0 20px 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #3b82f6;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) { background: #f9fafb; }
    .text-right { text-align: right; }
    .total { font-weight: 700; border-top: 2px solid #3b82f6; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${materials.title}</h1>
    <p><strong>Project:</strong> ${project.title}</p>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-right">Quantity</th>
          <th>Unit</th>
          <th class="text-right">Cost</th>
        </tr>
      </thead>
      <tbody>
        ${materials.items
          .map(
            (item) => `
          <tr>
            <td>${item.name}</td>
            <td class="text-right">${item.quantity}</td>
            <td>${item.unit}</td>
            <td class="text-right">$${item.estimatedCost?.toLocaleString() || "0"}</td>
          </tr>
        `
          )
          .join("")}
        <tr class="total">
          <td colspan="3">Total Estimated Cost</td>
          <td class="text-right">$${materials.totalEstimatedCost?.toLocaleString() || "0"}</td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
  `.trim();

  return html;
}

/**
 * Generate JSON export
 */
export function generateQuoteJSON(quote: ProjectQuote, project: WorkspaceProject): string {
  return JSON.stringify(
    {
      quote: {
        id: quote.id,
        title: quote.title,
        status: quote.status,
        amount: quote.amount,
        content: quote.content,
        createdAt: quote.createdAt,
      },
      project: {
        id: project.id,
        title: project.title,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
      },
      exportedAt: new Date(),
    },
    null,
    2
  );
}

/**
 * Generate materials CSV
 */
export function generateMaterialsCSV(materials: ProjectMaterial): string {
  const headers = ["Item", "Quantity", "Unit", "Estimated Cost", "Vendor", "Notes"];
  const rows = materials.items.map((item) => [
    item.name,
    item.quantity,
    item.unit,
    item.estimatedCost || "",
    item.vendor || "",
    item.notes || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  return csv;
}

/**
 * Generate email draft text
 */
export function generateEmailDraft(quote: ProjectQuote, project: WorkspaceProject): string {
  const emailBody = `
Subject: Quote: ${quote.title}

Dear ${project.clientName},

I hope this message finds you well. Please find the quote for your project attached.

Project: ${project.title}
Estimated Total: ${quote.amount ? "$" + quote.amount.toLocaleString() : "TBD"}
Date: ${new Date(quote.createdAt).toLocaleDateString()}

${quote.content || ""}

Please review at your convenience and let me know if you have any questions or would like to discuss further.

Best regards,
Your Service Team
  `.trim();

  return emailBody;
}

/**
 * Copy quote to clipboard
 */
export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string = "text/plain"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
