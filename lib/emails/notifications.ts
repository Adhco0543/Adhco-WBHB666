import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send quote follow-up email to client
 */
export async function sendQuoteFollowUp(clientEmail: string, clientName: string, quoteNumber: string, quoteLink: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@adhco.app',
    to: clientEmail,
    subject: `Follow-up: Quote ${quoteNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${clientName},</h2>
        <p>We wanted to follow up on the quote ${quoteNumber} we sent you.</p>
        <p>If you have any questions or would like to move forward, please don't hesitate to reach out.</p>
        <p>
          <a href="${quoteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Quote
          </a>
        </p>
        <p>Best regards,<br/>The ADHCO Team</p>
      </div>
    `,
  });
}

/**
 * Send invoice email to client
 */
export async function sendInvoice(clientEmail: string, clientName: string, invoiceNumber: string, invoiceLink: string, dueDate: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@adhco.app',
    to: clientEmail,
    subject: `Invoice ${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${clientName},</h2>
        <p>Your invoice ${invoiceNumber} is ready.</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p>
          <a href="${invoiceLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Invoice
          </a>
        </p>
        <p>You can pay online through the invoice portal or contact us if you have any questions.</p>
        <p>Best regards,<br/>The ADHCO Team</p>
      </div>
    `,
  });
}

/**
 * Send payment reminder email
 */
export async function sendPaymentReminder(clientEmail: string, clientName: string, invoiceNumber: string, invoiceLink: string, amountDue: number, daysOverdue: number) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@adhco.app',
    to: clientEmail,
    subject: `Payment Reminder: Invoice ${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Reminder</h2>
        <p>Hi ${clientName},</p>
        <p>This is a friendly reminder that invoice ${invoiceNumber} is now ${daysOverdue} days overdue.</p>
        <p><strong>Amount Due:</strong> $${amountDue.toFixed(2)}</p>
        <p>
          <a href="${invoiceLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Pay Now
          </a>
        </p>
        <p>If you've already sent payment, please disregard this reminder. Thank you!</p>
        <p>Best regards,<br/>The ADHCO Team</p>
      </div>
    `,
  });
}

/**
 * Send overdue task notification
 */
export async function sendOverdueTaskNotification(userEmail: string, taskTitle: string, daysOverdue: number, projectLink: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@adhco.app',
    to: userEmail,
    subject: `⚠️ Overdue Task: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Overdue Task Alert</h2>
        <p>You have an overdue task that needs attention:</p>
        <p><strong>Task:</strong> ${taskTitle}</p>
        <p><strong>Overdue by:</strong> ${daysOverdue} days</p>
        <p>
          <a href="${projectLink}" style="background-color: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Task
          </a>
        </p>
        <p>Please update the task status or reschedule it as needed.</p>
        <p>Best regards,<br/>The ADHCO Team</p>
      </div>
    `,
  });
}

/**
 * Send team invitation email
 */
export async function sendTeamInvitation(inviteeEmail: string, inviteeeName: string, teamName: string, inviterName: string, acceptLink: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@adhco.app',
    to: inviteeEmail,
    subject: `You've been invited to join ${teamName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Team Invitation</h2>
        <p>Hi ${inviteeeName},</p>
        <p>${inviterName} has invited you to join <strong>${teamName}</strong> on ADHCO.</p>
        <p>
          <a href="${acceptLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        <p>If you don't have an ADHCO account yet, you'll be asked to create one.</p>
        <p>Best regards,<br/>The ADHCO Team</p>
      </div>
    `,
  });
}

/**
 * Send project completion notification
 */
export async function sendProjectCompletionNotification(clientEmail: string, clientName: string, projectName: string, feedbackLink: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@adhco.app',
    to: clientEmail,
    subject: `Project Complete: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Project Complete!</h2>
        <p>Hi ${clientName},</p>
        <p>We're excited to let you know that <strong>${projectName}</strong> is now complete!</p>
        <p>We'd love to hear your feedback on the project. Your input helps us improve our services.</p>
        <p>
          <a href="${feedbackLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Share Feedback
          </a>
        </p>
        <p>Thank you for working with us!</p>
        <p>Best regards,<br/>The ADHCO Team</p>
      </div>
    `,
  });
}

/**
 * Send daily digest email
 */
export async function sendDailyDigest(userEmail: string, userName: string, digestData: { overdueTasks: number; pendingApprovals: number; newMessages: number; pastDueInvoices: number }) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@adhco.app',
    to: userEmail,
    subject: 'Your ADHCO Daily Digest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Good Morning, ${userName}!</h2>
        <p>Here's your ADHCO daily digest:</p>
        <ul style="font-size: 16px; line-height: 1.8;">
          ${digestData.overdueTasks > 0 ? `<li>⚠️ <strong>${digestData.overdueTasks} overdue task(s)</strong></li>` : ''}
          ${digestData.pendingApprovals > 0 ? `<li>✋ <strong>${digestData.pendingApprovals} pending approval(s)</strong></li>` : ''}
          ${digestData.newMessages > 0 ? `<li>💬 <strong>${digestData.newMessages} new message(s)</strong></li>` : ''}
          ${digestData.pastDueInvoices > 0 ? `<li>💰 <strong>${digestData.pastDueInvoices} past due invoice(s)</strong></li>` : ''}
        </ul>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Open ADHCO
          </a>
        </p>
        <p>Have a productive day!</p>
        <p>Best regards,<br/>The ADHCO Team</p>
      </div>
    `,
  });
}
