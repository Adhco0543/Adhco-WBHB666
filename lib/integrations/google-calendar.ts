// Google Calendar Integration
// Sync tasks to Google Calendar as events

import type { Task } from "../tasks";
import { IntegrationBase } from "../integrations";

export class GoogleCalendarIntegration extends IntegrationBase {
  calendarId: string = "primary";

  constructor() {
    super("google_calendar");
  }

  protected async validateConnection(): Promise<boolean> {
    // In a real app, this would call the Google API
    // For now, we'll simulate validation
    return !!this.credentials.accessToken;
  }

  /**
   * Create a task as a Google Calendar event
   */
  async syncTask(task: Task): Promise<string | null> {
    if (!this.credentials.accessToken) return null;

    try {
      const _event = {
        summary: task.title,
        description: task.description,
        start: task.dueDate
          ? {
              date: task.dueDate
            }
          : undefined,
        end: task.dueDate
          ? {
              date: task.dueDate
            }
          : undefined,
        colorId: this.getPriorityColorId(task.priority)
      };

      // Mock API call - in production, use: 
      // fetch(`https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`, ...)

      const eventId = `gcal-${task.id}`;
      console.log("📅 Synced to Google Calendar:", eventId);

      return eventId;
    } catch (error) {
      console.error("Failed to sync task to Google Calendar:", error);
      return null;
    }
  }

  /**
   * Update task status in Google Calendar
   */
  async syncTaskCompletion(task: Task): Promise<boolean> {
    if (!this.credentials.accessToken || !task.integrations?.googleCalendarId) {
      return false;
    }

    try {
      // Mock API call to update the event
      console.log("✅ Updated task in Google Calendar:", task.integrations.googleCalendarId);
      return true;
    } catch (error) {
      console.error("Failed to update Google Calendar event:", error);
      return false;
    }
  }

  /**
   * Delete task event from Google Calendar
   */
  async deleteSyncedTask(task: Task): Promise<boolean> {
    if (!this.credentials.accessToken || !task.integrations?.googleCalendarId) {
      return false;
    }

    try {
      // Mock API call to delete the event
      console.log("🗑️ Deleted from Google Calendar:", task.integrations.googleCalendarId);
      return true;
    } catch (error) {
      console.error("Failed to delete Google Calendar event:", error);
      return false;
    }
  }

  /**
   * Map task priority to Google Calendar color
   */
  private getPriorityColorId(priority: string): string {
    const colorMap: Record<string, string> = {
      high: "1", // Red
      medium: "5", // Blue
      low: "2" // Green
    };
    return colorMap[priority] || "0";
  }
}

/**
 * Get Google Calendar auth URL
 */
export function getGoogleCalendarAuthUrl(
  clientId: string,
  redirectUri: string
): string {
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events"
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent"
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
