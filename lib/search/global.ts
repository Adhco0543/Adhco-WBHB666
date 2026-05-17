import { supabase } from '../supabase/client';

export interface SearchResult {
  id: string;
  type: 'quote' | 'invoice' | 'task' | 'project' | 'client' | 'material' | 'note';
  title: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
  relevance: number; // 0-100
}

/**
 * Global search across all entities
 */
export async function globalSearch(teamId: string, query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const results: SearchResult[] = [];
  const searchTerm = `%${query}%`;

  try {
    // Search projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, description')
      .eq('team_id', teamId)
      .or(`title.ilike.${searchTerm}, description.ilike.${searchTerm}`);

    projects?.forEach((p) => {
      results.push({
        id: p.id,
        type: 'project',
        title: p.title,
        description: p.description,
        url: `/workspace/${p.id}`,
        relevance: p.title.toLowerCase().includes(query.toLowerCase()) ? 100 : 80,
      });
    });

    // Search quotes
    const { data: quotes } = await supabase
      .from('quotes')
      .select('id, title, project_id')
      .eq('team_id', teamId)
      .ilike('title', searchTerm);

    quotes?.forEach((q) => {
      results.push({
        id: q.id,
        type: 'quote',
        title: q.title,
        url: `/workspace/${q.project_id}?tab=quotes&quote=${q.id}`,
        relevance: 90,
      });
    });

    // Search invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, project_id')
      .eq('team_id', teamId)
      .ilike('invoice_number', searchTerm);

    invoices?.forEach((i) => {
      results.push({
        id: i.id,
        type: 'invoice',
        title: `Invoice ${i.invoice_number}`,
        url: `/invoices/${i.id}`,
        relevance: 95,
      });
    });

    // Search tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, project_id')
      .eq('team_id', teamId)
      .ilike('title', searchTerm);

    tasks?.forEach((t) => {
      results.push({
        id: t.id,
        type: 'task',
        title: t.title,
        url: `/workspace/${t.project_id}?tab=tasks&task=${t.id}`,
        relevance: 85,
      });
    });

    // Search clients
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('team_id', teamId)
      .or(`name.ilike.${searchTerm}, email.ilike.${searchTerm}`);

    clients?.forEach((c) => {
      results.push({
        id: c.id,
        type: 'client',
        title: c.name,
        description: c.email,
        url: `/clients/${c.id}`,
        relevance: c.name.toLowerCase().includes(query.toLowerCase()) ? 100 : 75,
      });
    });

    // Search materials
    const { data: materials } = await supabase
      .from('materials')
      .select('id, name, project_id')
      .eq('team_id', teamId)
      .ilike('name', searchTerm);

    materials?.forEach((m) => {
      results.push({
        id: m.id,
        type: 'material',
        title: m.name,
        url: `/workspace/${m.project_id}?tab=materials`,
        relevance: 70,
      });
    });

    // Search notes
    const { data: notes } = await supabase
      .from('notes')
      .select('id, title, project_id, content')
      .eq('team_id', teamId)
      .or(`title.ilike.${searchTerm}, content.ilike.${searchTerm}`);

    notes?.forEach((n) => {
      results.push({
        id: n.id,
        type: 'note',
        title: n.title,
        description: n.content?.substring(0, 100),
        url: `/workspace/${n.project_id}?tab=notes&note=${n.id}`,
        relevance: n.title.toLowerCase().includes(query.toLowerCase()) ? 95 : 70,
      });
    });

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Get search suggestions while typing
 */
export async function getSearchSuggestions(teamId: string, query: string, limit: number = 10): Promise<SearchResult[]> {
  const results = await globalSearch(teamId, query);
  return results.slice(0, limit);
}

/**
 * Advanced search with filters
 */
export async function advancedSearch(
  teamId: string,
  query: string,
  filters: {
    type?: SearchResult['type'];
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
  }
): Promise<SearchResult[]> {
  let results = await globalSearch(teamId, query);

  // Filter by type
  if (filters.type) {
    results = results.filter((r) => r.type === filters.type);
  }

  // Filter by date range
  if (filters.dateFrom && filters.dateTo) {
    // TODO: Add date filtering once search index has timestamps
  }

  // Filter by amount range
  if (filters.minAmount || filters.maxAmount) {
    // TODO: Add amount filtering for invoices/quotes
  }

  return results;
}

/**
 * Get saved searches
 */
export async function getSavedSearches(teamId: string, userId: string) {
  const { data, error } = await supabase
    .from('saved_filters')
    .select('*')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Save a search
 */
export async function saveSearch(
  teamId: string,
  userId: string,
  name: string,
  query: string,
  filters: Record<string, any>
) {
  const { data, error } = await supabase
    .from('saved_filters')
    .insert({
      team_id: teamId,
      user_id: userId,
      name,
      entity_type: 'search',
      filters: { query, ...filters },
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Delete saved search
 */
export async function deleteSavedSearch(searchId: string) {
  const { error } = await supabase
    .from('saved_filters')
    .delete()
    .eq('id', searchId);

  return { error };
}
