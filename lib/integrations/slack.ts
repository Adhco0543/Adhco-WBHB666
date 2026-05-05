// Slack Integration
// Send task reminders and updates to Slack

import type { Task } from "../tasks";
import { IntegrationBase } from "../integrations";

export class SlackIntegration extends IntegrationBase {
  constructor() {
    super("slack");
  }

  protected async validateConnection(): Promise<boolean> {
    return !!this.credentials.botToken;
  }

  /**
   * Send task as Slack message
   */
  async syncTask(task: Task): Promise<string | null> {
    if (!this.credentials.botToken) return null;

    try {
      const _slackMessage = {
        channel: this.credentials.channelId || "#tasks",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*New Task:* ${task.title}\n${
                task.dueDate
                  ? `📅 Due: ${new Date(task.dueDate).toLocaleDateString()}\n`
                  : ""
              }🎯 Priority: ${task.priority}`
            }
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "✅ Mark Done"
                },
                value: task.id,
                action_id: `complete_task_${task.id}`
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "🔄 In Progress"
                },
                value: task.id,
                action_id: `progress_task_${task.id}`
              }
            ]
          }
        ]
      };

      // Mock API call - in production:
      // fetch('https://slack.com/api/chat.postMessage', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.credentials.botToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(slackMessage)
      // })

      const messageId = `slack-${task.id}`;
      console.log("💬 Sent to Slack:", messageId);

      return messageId;
    } catch (error) {
      console.error("Failed to send task to Slack:", error);
      return null;
    }
  }

  /**
   * Send task completion reminder to Slack
   */
  async syncTaskCompletion(task: Task): Promise<boolean> {
    if (!this.credentials.botToken) return false;

    try {
      const _reminderMessage = {
        channel: this.credentials.channelId || "#tasks",
        text: `✅ Task completed: ${task.title}`
      };

      // Mock API call
      console.log("✅ Sent completion to Slack");
      return true;
    } catch (error) {
      console.error("Failed to send completion to Slack:", error);
      return false;
    }
  }

  /**
   * Send overdue task reminder
   */
  async sendOverdueReminder(tasks: Task[]): Promise<boolean> {
    if (!this.credentials.botToken) return false;

    const overdueTasks = tasks.filter((t) => {
      if (!t.dueDate || t.status === "completed") return false;
      return new Date(t.dueDate) < new Date();
    });

    if (overdueTasks.length === 0) return false;

    try {
      const _message = {
        channel: this.credentials.channelId || "#tasks",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `⚠️ *You have ${overdueTasks.length} overdue task(s):*\n${overdueTasks
                .map((t) => `• ${t.title}`)
                .join("\n")}`
            }
          }
        ]
      };

      // Mock API call
      console.log("⚠️ Sent overdue reminder to Slack");
      return true;
    } catch (error) {
      console.error("Failed to send overdue reminder to Slack:", error);
      return false;
    }
  }
}

/**
 * Get Slack authorization URL
 */
export function getSlackAuthUrl(clientId: string, redirectUri: string): string {
  const scopes = [
    "chat:write",
    "channels:read",
    "users:read",
    "users:read.email"
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(","),
    user_scope: ""
  });

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}
