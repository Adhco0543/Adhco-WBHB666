/**
 * Draft Generation Service
 * Converts natural language commands into professional emails, quotes, bids, invoices
 */

import type { OnboardingProfile } from "./assistantTypes";

export interface DraftRequest {
  type: "email" | "quote" | "bid" | "invoice" | "proposal";
  recipient?: string;
  subject?: string;
  details: string;
  context?: Record<string, any>;
}

export interface GeneratedDraft {
  type: string;
  title: string;
  content: string;
  recipient?: string;
  preview: string;
  ready: boolean;
}

/**
 * Parse natural language commands to detect draft requests
 * Examples:
 * - "send an email to john with..."
 * - "create a quote for the barn project"
 * - "draft a bid for painting supplies"
 */
export function parseDraftCommand(input: string): DraftRequest | null {
  const lower = input.toLowerCase();

  // Email detection (check first - highest priority)
  if (
    lower.includes("send") && lower.includes("email") ||
    lower.includes("email to") ||
    lower.includes("write email") ||
    lower.includes("draft email")
  ) {
    // Extract recipient name (more flexible pattern - just grab word after "to")
    const emailMatch = input.match(
      /(?:send|email|write|draft)\s+an?\s+email\s+(?:to|for)\s+([a-zA-Z\s@.,'-]+?)(?:\s|$)/i
    );
    return {
      type: "email",
      recipient: emailMatch ? emailMatch[1]?.trim().split(/\s+at\s+/)[0] : "recipient",
      details: input,
    };
  }

  // Quote detection
  if (lower.includes("quote") || lower.includes("estimate")) {
    const quoteMatch = input.match(/(?:quote|estimate)\s+(?:for|to)\s+([^.!?]+)/i);
    return {
      type: "quote",
      details: input,
      context: { recipient: quoteMatch?.[1]?.trim() },
    };
  }

  // Bid detection
  if (lower.includes("bid") || lower.includes("proposal")) {
    return {
      type: "bid",
      details: input,
    };
  }

  // Invoice detection (check last - lowest priority)
  if (lower.includes("invoice") || lower.includes("bill")) {
    // Only if it's clearly about invoicing, not just mentioning invoice will follow
    if (lower.startsWith("invoice") || lower.startsWith("create invoice") || lower.startsWith("draft invoice")) {
      const invoiceMatch = input.match(/(?:invoice|bill)\s+(?:for|to)\s+([^.!?]+)/i);
      return {
        type: "invoice",
        details: input,
        context: { recipient: invoiceMatch?.[1]?.trim() },
      };
    }
  }

  return null;
}

/**
 * Generate a professional email draft
 */
export function generateEmailDraft(
  recipient: string,
  details: string,
  profile: OnboardingProfile | null
): GeneratedDraft {
  const businessName = profile?.businessName || "Your Business";

  // Extract key information from natural language
  const keywords = details.toLowerCase();
  const isFollowUp = keywords.includes("follow") || keywords.includes("check");
  const isInvoice = keywords.includes("invoice") || keywords.includes("payment");
  const isScopeOfWork = keywords.includes("scope") || keywords.includes("work");

  let subject = "Follow-up";
  let body = "";

  // Parse specific details (hours, payment, materials, etc)
  const hourMatch = details.match(/(\d+)\s+(?:hours?|hrs?)/i);
  const hours = hourMatch ? hourMatch[1] : null;

  const paymentMatch = details.match(/\$?([\d,]+(?:\.\d{2})?)\s+(?:payment|expected|total|amount)/i);
  const payment = paymentMatch ? paymentMatch[1] : null;

  const projectMatch = details.match(/(?:on|for|project)\s+(?:the\s+)?([a-zA-Z\s]+?)(?:\s+(?:project|job|work|with|for)|\.|\?|$)/i);
  const project = projectMatch ? projectMatch[1].trim() : null;

  // Generate email body based on content
  if (isFollowUp) {
    subject = `Follow-up: ${project || "Project Update"}`;
    body = `Hi ${recipient},

I wanted to follow up on ${project ? `the ${project}` : "our recent conversation"}.

${hours ? `Total hours worked this week: ${hours} hours\n` : ""}${payment ? `Expected payment: $${payment}\n` : ""}${details.includes("material") ? "We will need to check on materials before proceeding.\n" : ""}
Please let me know if you have any questions or need anything else.

Best regards,
${businessName}`;
  } else if (isInvoice) {
    subject = `Invoice: ${project || "Services Rendered"}`;
    body = `Hi ${recipient},

Please find the invoice below for ${project ? `work on the ${project}` : "services rendered"}.

${hours ? `Hours worked: ${hours}\n` : ""}${payment ? `Total amount due: $${payment}\n` : ""}
Payment details: [Your payment info here]

Thank you!

Best regards,
${businessName}`;
  } else {
    subject = `Update: ${project || "Project"}`;
    body = `Hi ${recipient},

${details}

Please let me know if you need anything else.

Best regards,
${businessName}`;
  }

  const preview = body.substring(0, 150) + (body.length > 150 ? "..." : "");

  return {
    type: "email",
    title: subject,
    content: body,
    recipient,
    preview,
    ready: true,
  };
}

/**
 * Generate a professional quote/estimate draft
 */
export function generateQuoteDraft(
  details: string,
  profile: OnboardingProfile | null
): GeneratedDraft {
  const businessName = profile?.businessName || "Your Business";
  const businessType = profile?.businessType || "Services";

  // Extract information
  const customerMatch = details.match(/(?:for|to)\s+([a-zA-Z\s]+?)(?:\s+(?:on|at|for|project|job)|\.|\?|$)/i);
  const customer = customerMatch ? customerMatch[1].trim() : "Customer";

  const projectMatch = details.match(/(?:project|job|work).*?:\s*(.+?)(?:\.|\?|$)/i) ||
    details.match(/(?:the|for)\s+([a-zA-Z\s]+?)(?:\s+(?:project|job|work)|\.|\?|$)/i);
  const project = projectMatch ? projectMatch[1].trim() : "Project";

  const amountMatch = details.match(/\$?([\d,]+(?:\.\d{2})?)/);
  const amount = amountMatch ? amountMatch[1] : "[Amount TBD]";

  const date = new Date();
  const quoteDate = date.toLocaleDateString();
  const dueDate = new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  const content = `═══════════════════════════════════════════════════════════
QUOTE / ESTIMATE
═══════════════════════════════════════════════════════════

FROM:
${businessName}
[Your address]
[Phone]
[Email]

TO:
${customer}

═══════════════════════════════════════════════════════════

Quote Date: ${quoteDate}
Quote Valid Until: ${dueDate}
Quote #: [AUTO-GENERATED]

PROJECT: ${project}

SCOPE OF WORK:
${details}

MATERIALS & LABOR:
[Detail line items here]

SUBTOTAL:           $[Amount]
Tax (if applicable): $[Amount]
─────────────────────────
TOTAL ESTIMATE:     $${amount}

TERMS & CONDITIONS:
• Payment due upon completion
• 50% deposit required to begin work
• Final payment due upon project completion
• Prices valid for 30 days

NEXT STEPS:
1. Review quote
2. Contact with any questions
3. Sign and return to proceed

Thank you for the opportunity to work with you!

${businessName}
═══════════════════════════════════════════════════════════`;

  const preview = `Quote for ${customer} - ${project} - $${amount}`;

  return {
    type: "quote",
    title: `Quote: ${customer} - ${project}`,
    content,
    recipient: customer,
    preview,
    ready: true,
  };
}

/**
 * Generate a professional bid/proposal draft
 */
export function generateBidDraft(
  details: string,
  profile: OnboardingProfile | null
): GeneratedDraft {
  const businessName = profile?.businessName || "Your Business";

  // Similar extraction logic
  const customerMatch = details.match(/(?:for|to)\s+([a-zA-Z\s]+?)(?:\s+(?:project|job)|\.|\?|$)/i);
  const customer = customerMatch ? customerMatch[1].trim() : "Client";

  const projectMatch = details.match(/(?:project|job)\s*:\s*(.+?)(?:\.|\?|$)/i);
  const project = projectMatch ? projectMatch[1].trim() : "Project";

  const content = `PROPOSAL / BID SUBMISSION
═══════════════════════════════════════════════════════════

CLIENT: ${customer}
PROJECT: ${project}
DATE: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY:
${details}

SCOPE OF WORK:
[Detailed breakdown of work to be performed]

TIMELINE:
Start Date: [Date]
Estimated Duration: [X weeks/months]
Completion Date: [Date]

PRICING:
[Itemized breakdown]
Total Bid Amount: $[Amount]

QUALIFICATIONS:
${profile?.specializations?.join(", ") || "Experienced professional"}

REFERENCES:
[Your references/previous work]

TERMS:
Payment Terms: Net [X] upon completion
Warranty: [Your warranty details]

Contact: [Your contact info]

Thank you for considering our bid!
═══════════════════════════════════════════════════════════`;

  const preview = `Bid for ${customer} - ${project}`;

  return {
    type: "bid",
    title: `Bid: ${customer}`,
    content,
    recipient: customer,
    preview,
    ready: true,
  };
}

/**
 * Generate an invoice draft
 */
export function generateInvoiceDraft(
  details: string,
  profile: OnboardingProfile | null
): GeneratedDraft {
  const businessName = profile?.businessName || "Your Business";

  const customerMatch = details.match(/(?:for|to)\s+([a-zA-Z\s]+?)(?:\s+(?:on|at|project)|\.|\?|$)/i);
  const customer = customerMatch ? customerMatch[1].trim() : "Customer";

  const hourMatch = details.match(/(\d+)\s+(?:hours?|hrs?)/i);
  const hours = hourMatch ? hourMatch[1] : "0";

  const rateMatch = details.match(/\$?([\d,]+)\s+(?:per\s+hour|\/hr|rate)/i);
  const rate = rateMatch ? rateMatch[1] : "[Rate]";

  const amount = hourMatch && rateMatch ? (parseInt(hours) * parseInt(rateMatch[1])).toString() : "[Amount]";

  const invoiceNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(5, "0");
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString();

  const content = `INVOICE
═══════════════════════════════════════════════════════════

FROM:
${businessName}
[Your Address]
[Your Phone]
[Your Email]

INVOICE TO:
${customer}

═══════════════════════════════════════════════════════════
Invoice #:      INV-${invoiceNum}
Invoice Date:   ${new Date().toLocaleDateString()}
Due Date:       ${dueDate}
═══════════════════════════════════════════════════════════

DESCRIPTION OF WORK:
${details}

HOURS & RATES:
Hours Worked:        ${hours} hrs
Rate per Hour:       $${rate}
─────────────────────────────
Subtotal:            $${amount}
Tax (if applicable):  $0.00
─────────────────────────────
TOTAL DUE:          $${amount}

PAYMENT TERMS:
Due Date: ${dueDate}

PAYMENT METHODS:
[Your payment options here]

Thank you for your business!

${businessName}
═══════════════════════════════════════════════════════════`;

  const preview = `Invoice #${invoiceNum} for ${customer} - ${hours} hours @ $${rate}/hr`;

  return {
    type: "invoice",
    title: `Invoice: ${customer}`,
    content,
    recipient: customer,
    preview,
    ready: true,
  };
}

/**
 * Main generator function - handles any draft type
 */
export function generateDraft(
  request: DraftRequest,
  profile: OnboardingProfile | null
): GeneratedDraft {
  switch (request.type) {
    case "email":
      return generateEmailDraft(request.recipient || "Recipient", request.details, profile);

    case "quote":
      return generateQuoteDraft(request.details, profile);

    case "bid":
      return generateBidDraft(request.details, profile);

    case "invoice":
      return generateInvoiceDraft(request.details, profile);

    case "proposal":
      return generateBidDraft(request.details, profile);

    default:
      return generateEmailDraft(request.recipient || "Recipient", request.details, profile);
  }
}
