export type Project = {
  id: string;
  title: string;
  customer?: string;
  status: "active" | "waiting" | "completed";
  createdAt: string;

  notes: string[];

  quotes: string[]; // output IDs
  materials: string[]; // output IDs
  tasks: string[]; // task IDs

  conversationSummary?: string;
};