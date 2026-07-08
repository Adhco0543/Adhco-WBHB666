// Integration Framework
// Connects tasks and data to external services

import type { Task } from "./tasks";

export type IntegrationName = "google_calendar" | "slack" | "quickbooks" | "stripe" | "sheets";

export type IntegrationStatus = "connected" | "disconnected" | "error";

export type IntegrationConfig = {
  name: IntegrationName;
  status: IntegrationStatus;
  credentials?: Record<string, string>;
  connectedAt?: string;
  error?: string;
};

export class IntegrationBase {
  name: IntegrationName;
  status: IntegrationStatus = "disconnected";
  credentials: Record<string, string> = {};

  constructor(name: IntegrationName) {
    this.name = name;
  }

  /**
   * Connect to the integration service
   */
  async connect(credentials: Record<string, string>): Promise<boolean> {
    this.credentials = credentials;
    try {
      const result = await this.validateConnection();
      this.status = result ? "connected" : "error";
      return result;
    } catch (_error) {
      this.status = "error";
      return false;
    }
  }

  /**
   * Validate connection (override in subclasses)
   */
  protected async validateConnection(): Promise<boolean> {
    return true;
  }

  /**
   * Disconnect from the integration
   */
  disconnect(): void {
    this.status = "disconnected";
    this.credentials = {};
  }

  /**
   * Sync task to external service (override in subclasses)
   */
  async syncTask(_task: Task): Promise<string | null> {
    return null;
  }

  /**
   * Sync task completion to external service
   */
  async syncTaskCompletion(_task: Task): Promise<boolean> {
    return false;
  }

  /**
   * Delete synced task from external service
   */
  async deleteSyncedTask(_task: Task): Promise<boolean> {
    return false;
  }
}

/**
 * Get integration config from localStorage
 */
export function getIntegrationConfig(name: IntegrationName): IntegrationConfig | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(`integration_${name}`);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Save integration config to localStorage
 */
export function saveIntegrationConfig(config: IntegrationConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`integration_${config.name}`, JSON.stringify(config));
}

/**
 * Remove integration config
 */
export function removeIntegrationConfig(name: IntegrationName): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`integration_${name}`);
}

/**
 * Get all connected integrations
 */
export function getConnectedIntegrations(): IntegrationName[] {
  if (typeof window === "undefined") return [];
  const integrationNames: IntegrationName[] = [
    "google_calendar",
    "slack",
    "quickbooks",
    "stripe",
    "sheets"
  ];
  return integrationNames.filter((name) => {
    const config = getIntegrationConfig(name);
    return config?.status === "connected";
  });
}
