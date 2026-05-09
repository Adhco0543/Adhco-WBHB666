/**
 * Conversation Summary Generator
 * Creates intelligent summaries of project chat history
 */

import type { ChatMessage, WorkspaceProject } from "@/lib/workspaceTypes";

export interface ConversationSummary {
  projectId: string;
  keyTopics: string[];
  decisions: string[];
  actionItems: string[];
  timeline: { date: string; event: string }[];
  participants: string[];
  totalMessages: number;
  generatedAt: Date;
}

/**
 * Generate a summary of project conversations
 */
export function generateConversationSummary(project: WorkspaceProject): ConversationSummary {
  const messages = project.chatMemory || [];
  const now = new Date();

  // Extract key topics from messages
  const topicKeywords = ["quote", "estimate", "price", "cost", "material", "schedule", "timeline", "deadline", "task", "issue", "problem", "decision", "change"];
  const topics = new Set<string>();
  
  messages.forEach((msg) => {
    topicKeywords.forEach((keyword) => {
      if (msg.content.toLowerCase().includes(keyword)) {
        topics.add(capitalizeFirst(keyword));
      }
    });
  });

  // Extract decisions (messages with decision keywords)
  const decisions: string[] = [];
  const decisionKeywords = ["decided", "approved", "agreed", "will", "moving forward with"];
  messages.forEach((msg) => {
    if (msg.role === "assistant") {
      decisionKeywords.forEach((keyword) => {
        if (msg.content.toLowerCase().includes(keyword)) {
          const sentence = extractSentence(msg.content, keyword);
          if (sentence && !decisions.includes(sentence)) {
            decisions.push(sentence);
          }
        }
      });
    }
  });

  // Extract action items
  const actionItems: string[] = [];
  const actionKeywords = ["create", "send", "generate", "attach", "add", "make", "build", "start", "begin"];
  messages.forEach((msg) => {
    if (msg.role === "assistant") {
      actionKeywords.forEach((keyword) => {
        if (msg.content.toLowerCase().includes(keyword)) {
          const action = extractSentence(msg.content, keyword);
          if (action && !actionItems.includes(action)) {
            actionItems.push(action);
          }
        }
      });
    }
  });

  // Create timeline
  const timeline: { date: string; event: string }[] = [];
  const seenDates = new Set<string>();
  
  messages.forEach((msg) => {
    if (msg.timestamp) {
      const date = new Date(msg.timestamp).toLocaleDateString();
      if (!seenDates.has(date)) {
        seenDates.add(date);
        timeline.push({
          date,
          event: msg.role === "assistant" ? "Assistant response" : "User input",
        });
      }
    }
  });

  return {
    projectId: project.id,
    keyTopics: Array.from(topics).slice(0, 10),
    decisions: decisions.slice(0, 5),
    actionItems: actionItems.slice(0, 5),
    timeline: timeline.slice(0, 10),
    participants: ["User", "Assistant"],
    totalMessages: messages.length,
    generatedAt: now,
  };
}

/**
 * Extract a sentence containing a keyword from text
 */
function extractSentence(text: string, keyword: string): string {
  const index = text.toLowerCase().indexOf(keyword);
  if (index === -1) return "";

  // Find start of sentence (period or start of text)
  let start = index;
  while (start > 0 && text[start - 1] !== ".") {
    start--;
  }

  // Find end of sentence (period or end of text)
  let end = index + keyword.length;
  while (end < text.length && text[end] !== ".") {
    end++;
  }

  return text.substring(start, end).trim();
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format conversation summary for display
 */
export function formatSummaryForDisplay(summary: ConversationSummary): string {
  const parts: string[] = [
    "# Conversation Summary",
    "",
    `**Project:** ${summary.projectId}`,
    `**Total Messages:** ${summary.totalMessages}`,
    `**Generated:** ${new Date(summary.generatedAt).toLocaleDateString()}`,
    "",
  ];

  if (summary.keyTopics.length > 0) {
    parts.push("## Key Topics");
    parts.push(summary.keyTopics.map((t) => `- ${t}`).join("\n"));
    parts.push("");
  }

  if (summary.decisions.length > 0) {
    parts.push("## Decisions Made");
    parts.push(summary.decisions.map((d) => `- ${d}`).join("\n"));
    parts.push("");
  }

  if (summary.actionItems.length > 0) {
    parts.push("## Action Items");
    parts.push(summary.actionItems.map((a) => `- ${a}`).join("\n"));
    parts.push("");
  }

  if (summary.timeline.length > 0) {
    parts.push("## Timeline");
    parts.push(
      summary.timeline
        .map((t) => `- **${t.date}:** ${t.event}`)
        .join("\n")
    );
  }

  return parts.join("\n");
}
