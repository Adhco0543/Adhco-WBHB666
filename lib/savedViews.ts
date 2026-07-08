import { createClient } from '@/lib/supabase/server';

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'startsWith';
  value: any;
}

export interface SavedView {
  id: string;
  team_id: string;
  user_id: string;
  name: string;
  description?: string;
  entity_type: string; // 'invoice', 'expense', 'time_entry', etc.
  filters: FilterCondition[];
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  columns?: string[]; // which columns to display
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Save a custom view
 */
export async function saveView(view: Omit<SavedView, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('saved_views')
      .insert({
        ...view,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving view:', error);
    throw error;
  }
}

/**
 * Update a saved view
 */
export async function updateView(viewId: string, updates: Partial<SavedView>) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('saved_views')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', viewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating view:', error);
    throw error;
  }
}

/**
 * Delete a saved view
 */
export async function deleteView(viewId: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase.from('saved_views').delete().eq('id', viewId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting view:', error);
    throw error;
  }
}

/**
 * Get all saved views for a team
 */
export async function getTeamViews(teamId: string, entityType?: string) {
  try {
    const supabase = createClient();

    let query = supabase
      .from('saved_views')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching views:', error);
    return [];
  }
}

/**
 * Apply filters to a query
 */
export function buildFilterQuery(filters: FilterCondition[]) {
  return filters.map(filter => {
    switch (filter.operator) {
      case 'eq':
        return `${filter.field}=eq.${filter.value}`;
      case 'neq':
        return `${filter.field}=neq.${filter.value}`;
      case 'gt':
        return `${filter.field}=gt.${filter.value}`;
      case 'gte':
        return `${filter.field}=gte.${filter.value}`;
      case 'lt':
        return `${filter.field}=lt.${filter.value}`;
      case 'lte':
        return `${filter.field}=lte.${filter.value}`;
      case 'in':
        return `${filter.field}=in.(${filter.value.join(',')})`;
      case 'contains':
        return `${filter.field}=ilike.%${filter.value}%`;
      case 'startsWith':
        return `${filter.field}=ilike.${filter.value}%`;
      default:
        return '';
    }
  });
}

/**
 * Common saved view templates
 */
export const SAVED_VIEW_TEMPLATES = {
  INVOICES: {
    OVERDUE: {
      name: 'Overdue Invoices',
      entity_type: 'invoice',
      filters: [
        { field: 'status', operator: 'eq', value: 'overdue' },
      ],
      sort: { field: 'due_date', direction: 'asc' },
    },
    UNPAID: {
      name: 'Unpaid Invoices',
      entity_type: 'invoice',
      filters: [
        { field: 'status', operator: 'neq', value: 'paid' },
      ],
      sort: { field: 'issue_date', direction: 'desc' },
    },
    THIS_MONTH: {
      name: 'This Month',
      entity_type: 'invoice',
      filters: [],
      sort: { field: 'issue_date', direction: 'desc' },
    },
  },

  EXPENSES: {
    UNBILLED: {
      name: 'Unbilled Expenses',
      entity_type: 'expense',
      filters: [
        { field: 'billable', operator: 'eq', value: false },
      ],
      sort: { field: 'expense_date', direction: 'desc' },
    },
    HIGH_VALUE: {
      name: 'High Value (>$500)',
      entity_type: 'expense',
      filters: [
        { field: 'amount', operator: 'gte', value: 500 },
      ],
      sort: { field: 'amount', direction: 'desc' },
    },
    BY_CATEGORY: {
      name: 'By Category',
      entity_type: 'expense',
      filters: [],
      sort: { field: 'category', direction: 'asc' },
    },
  },

  TIME_ENTRIES: {
    BILLABLE: {
      name: 'Billable Hours',
      entity_type: 'time_entry',
      filters: [
        { field: 'billable', operator: 'eq', value: true },
      ],
      sort: { field: 'start_time', direction: 'desc' },
    },
    THIS_WEEK: {
      name: 'This Week',
      entity_type: 'time_entry',
      filters: [],
      sort: { field: 'start_time', direction: 'desc' },
    },
    BY_PROJECT: {
      name: 'By Project',
      entity_type: 'time_entry',
      filters: [],
      sort: { field: 'project_id', direction: 'asc' },
    },
  },

  PROJECTS: {
    ACTIVE: {
      name: 'Active Projects',
      entity_type: 'project',
      filters: [
        { field: 'status', operator: 'eq', value: 'active' },
      ],
      sort: { field: 'start_date', direction: 'desc' },
    },
    COMPLETED: {
      name: 'Completed Projects',
      entity_type: 'project',
      filters: [
        { field: 'status', operator: 'eq', value: 'completed' },
      ],
      sort: { field: 'end_date', direction: 'desc' },
    },
    AT_RISK: {
      name: 'At Risk (No Recent Activity)',
      entity_type: 'project',
      filters: [],
      sort: { field: 'updated_at', direction: 'asc' },
    },
  },
};

/**
 * Duplicate a saved view
 */
export async function duplicateView(viewId: string, newName: string) {
  try {
    const supabase = createClient();

    const { data: original, error: fetchError } = await supabase
      .from('saved_views')
      .select('*')
      .eq('id', viewId)
      .single();

    if (fetchError) throw fetchError;

    const { id, created_at, updated_at, ...viewData } = original;

    const { data: duplicate, error: createError } = await supabase
      .from('saved_views')
      .insert({
        ...viewData,
        name: newName,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) throw createError;
    return duplicate;
  } catch (error) {
    console.error('Error duplicating view:', error);
    throw error;
  }
}

/**
 * Set a view as default
 */
export async function setDefaultView(teamId: string, entityType: string, viewId: string) {
  try {
    const supabase = createClient();

    // Clear current default
    await supabase
      .from('saved_views')
      .update({ is_default: false })
      .eq('team_id', teamId)
      .eq('entity_type', entityType)
      .eq('is_default', true);

    // Set new default
    const { data, error } = await supabase
      .from('saved_views')
      .update({ is_default: true })
      .eq('id', viewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error setting default view:', error);
    throw error;
  }
}
