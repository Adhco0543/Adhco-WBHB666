import { Resend } from 'resend';
import twilio from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilio Client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface ReminderConfig {
  id?: string;
  type: 'email' | 'sms';
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  message: string;
  scheduledFor: Date;
  templateId?: string;
  templateData?: Record<string, any>;
  relatedEntity?: {
    type: string;
    id: string;
  };
}

/**
 * Send email reminder using Resend
 */
export async function sendEmailReminder(
  email: string,
  subject: string,
  message: string,
  htmlContent?: string
) {
  try {
    const response = await resend.emails.send({
      from: 'reminders@adhco.app',
      to: email,
      subject,
      html: htmlContent || `<p>${message}</p>`,
    });

    return {
      success: true,
      messageId: response.id,
    };
  } catch (error) {
    console.error('Failed to send email reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send SMS reminder using Twilio
 */
export async function sendSMSReminder(phoneNumber: string, message: string) {
  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return {
      success: true,
      messageId: response.sid,
    };
  } catch (error) {
    console.error('Failed to send SMS reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Pre-built reminder templates
 */
export const REMINDER_TEMPLATES = {
  INVOICE_OVERDUE: {
    email: (data: { invoiceNumber: string; amount: number; dueDate: string }) => ({
      subject: `⏰ Invoice ${data.invoiceNumber} is Overdue`,
      message: `Your invoice ${data.invoiceNumber} for $${data.amount} was due on ${data.dueDate}. Please submit payment at your earliest convenience.`,
    }),
    sms: (data: { invoiceNumber: string }) =>
      `Payment reminder: Invoice ${data.invoiceNumber} is overdue. Please pay now.`,
  },

  INVOICE_DUE_SOON: {
    email: (data: { invoiceNumber: string; dueDate: string }) => ({
      subject: `📋 Invoice ${data.invoiceNumber} Due on ${data.dueDate}`,
      message: `Reminder: Invoice ${data.invoiceNumber} is due on ${data.dueDate}. Please ensure timely payment.`,
    }),
    sms: (data: { invoiceNumber: string; dueDate: string }) =>
      `Invoice ${data.invoiceNumber} is due ${data.dueDate}. Please arrange payment.`,
  },

  BUDGET_WARNING: {
    email: (data: { projectName: string; spent: number; budget: number }) => ({
      subject: `⚠️ ${data.projectName}: Budget at ${Math.round((data.spent / data.budget) * 100)}%`,
      message: `Your project "${data.projectName}" has spent $${data.spent} of $${data.budget} budget. Monitor expenses carefully.`,
    }),
    sms: (data: { projectName: string }) =>
      `Project budget alert: ${data.projectName} is reaching its budget limit.`,
  },

  PAYMENT_RECEIVED: {
    email: (data: { invoiceNumber: string; amount: number; date: string }) => ({
      subject: `✅ Payment Received for Invoice ${data.invoiceNumber}`,
      message: `Thank you! We received payment of $${data.amount} for invoice ${data.invoiceNumber} on ${data.date}.`,
    }),
    sms: (data: { invoiceNumber: string; amount: number }) =>
      `Payment received: $${data.amount} for invoice ${data.invoiceNumber}. Thank you!`,
  },

  TASK_ASSIGNED: {
    email: (data: { taskName: string; dueDate: string; assignedBy: string }) => ({
      subject: `📝 New Task Assigned: ${data.taskName}`,
      message: `You have been assigned a task "${data.taskName}" by ${data.assignedBy}. It's due on ${data.dueDate}.`,
    }),
    sms: (data: { taskName: string }) =>
      `New task assigned: ${data.taskName}. Check your dashboard for details.`,
  },

  TEAM_INVITATION: {
    email: (data: { teamName: string; invitedBy: string; joinLink: string }) => ({
      subject: `👋 You've Been Invited to Join ${data.teamName}`,
      message: `${data.invitedBy} has invited you to join team "${data.teamName}". Click the link to accept: ${data.joinLink}`,
    }),
    sms: (data: { teamName: string }) =>
      `You've been invited to join team ${data.teamName}. Check your email for details.`,
  },

  DAILY_DIGEST: {
    email: (data: {
      invoicesSent: number;
      newExpenses: number;
      pendingApprovals: number;
    }) => ({
      subject: '📊 Your Daily Construction Summary',
      message: `Today's summary:\n- Invoices sent: ${data.invoicesSent}\n- New expenses: $${data.newExpenses}\n- Pending approvals: ${data.pendingApprovals}`,
    }),
    sms: (data: { pendingApprovals: number }) =>
      `Daily digest: You have ${data.pendingApprovals} items pending approval.`,
  },

  SAFETY_ALERT: {
    email: (data: { projectName: string; severity: string; description: string }) => ({
      subject: `🚨 Safety Alert: ${data.projectName}`,
      message: `[${data.severity.toUpperCase()}] Safety incident reported on ${data.projectName}: ${data.description}`,
    }),
    sms: (data: { projectName: string; severity: string }) =>
      `Safety alert on ${data.projectName} - Severity: ${data.severity}. Check dashboard.`,
  },
};

/**
 * Schedule reminders for various events
 */
export async function scheduleInvoiceReminders(invoiceId: string, dueDate: Date) {
  const reminderDates = [
    { days: 3, type: 'DUE_SOON' },
    { days: 0, type: 'OVERDUE' },
    { days: -7, type: 'OVERDUE_7DAYS' },
  ];

  // This would integrate with a job scheduler like Bull or Agenda
  // For now, returning the schedule
  return reminderDates.map(reminder => ({
    invoiceId,
    type: reminder.type,
    scheduledFor: new Date(dueDate.getTime() + reminder.days * 24 * 60 * 60 * 1000),
  }));
}

/**
 * Format phone number for Twilio
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('+')) {
    return `+1${cleaned}`;
  }
  return `+${cleaned}`;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}
