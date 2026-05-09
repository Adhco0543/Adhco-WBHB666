/**
 * Client Database
 * Centralized storage and management of customer information
 */

export interface ClientProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  tags?: string[];
  projectIds: string[]; // Reference to projects
  quoteHistory: {
    projectId: string;
    projectTitle: string;
    quoteAmount?: number;
    date: Date;
  }[];
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
  lastInteractionAt?: Date;
}

const CLIENTS_KEY = "workspace_clients";

/**
 * Get all clients
 */
export function getAllClients(): ClientProfile[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CLIENTS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get client by ID
 */
export function getClientById(clientId: string): ClientProfile | null {
  const clients = getAllClients();
  return clients.find((c) => c.id === clientId) || null;
}

/**
 * Get client by name (for finding existing clients)
 */
export function getClientByName(name: string): ClientProfile | null {
  const clients = getAllClients();
  return clients.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Create or update client profile
 */
export function upsertClient(
  name: string,
  data: Partial<ClientProfile>
): ClientProfile {
  const clients = getAllClients();
  const existing = clients.find((c) => c.id === data.id || c.name === name);

  if (existing) {
    // Update
    Object.assign(existing, {
      ...data,
      name,
      updatedAt: new Date(),
    });
  } else {
    // Create
    const now = new Date();
    const newClient: ClientProfile = {
      id: `client_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      projectIds: [],
      quoteHistory: [],
      totalSpent: 0,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    clients.push(newClient);
    return newClient;
  }

  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  return existing!;
}

/**
 * Add project reference to client
 */
export function addProjectToClient(
  clientId: string,
  projectId: string,
  projectTitle: string,
  quoteAmount?: number
): void {
  const clients = getAllClients();
  const client = clients.find((c) => c.id === clientId);

  if (client) {
    if (!client.projectIds.includes(projectId)) {
      client.projectIds.push(projectId);
    }

    // Add to quote history
    client.quoteHistory.push({
      projectId,
      projectTitle,
      quoteAmount,
      date: new Date(),
    });

    client.updatedAt = new Date();
    client.lastInteractionAt = new Date();

    if (quoteAmount) {
      client.totalSpent += quoteAmount;
    }

    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }
}

/**
 * Delete client
 */
export function deleteClient(clientId: string): void {
  const clients = getAllClients();
  const filtered = clients.filter((c) => c.id !== clientId);
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(filtered));
}

/**
 * Search clients by name, email, phone
 */
export function searchClients(query: string): ClientProfile[] {
  const clients = getAllClients();
  const lowerQuery = query.toLowerCase();

  return clients.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.email?.toLowerCase().includes(lowerQuery) ||
      c.phone?.includes(query) ||
      c.company?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get clients sorted by total spent (VIP customers)
 */
export function getTopClients(limit: number = 10): ClientProfile[] {
  const clients = getAllClients();
  return clients
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

/**
 * Get recent clients (last 30 days)
 */
export function getRecentClients(days: number = 30): ClientProfile[] {
  const clients = getAllClients();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return clients
    .filter((c) => c.lastInteractionAt && new Date(c.lastInteractionAt) > cutoffDate)
    .sort((a, b) => {
      const aDate = a.lastInteractionAt ? new Date(a.lastInteractionAt).getTime() : 0;
      const bDate = b.lastInteractionAt ? new Date(b.lastInteractionAt).getTime() : 0;
      return bDate - aDate;
    });
}

/**
 * Get client statistics
 */
export function getClientStats(): {
  totalClients: number;
  totalSpent: number;
  averageSpendPerClient: number;
  recentClients: number;
} {
  const clients = getAllClients();
  const totalSpent = clients.reduce((sum, c) => sum + c.totalSpent, 0);
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 30);

  const recentClients = clients.filter(
    (c) => c.lastInteractionAt && new Date(c.lastInteractionAt) > recentCutoff
  ).length;

  return {
    totalClients: clients.length,
    totalSpent,
    averageSpendPerClient: clients.length > 0 ? Math.round(totalSpent / clients.length) : 0,
    recentClients,
  };
}
