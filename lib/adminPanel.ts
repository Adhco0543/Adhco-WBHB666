import { createClient } from '@/lib/supabase/server';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  team_id: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
}

export interface AdminTeam {
  id: string;
  name: string;
  owner_id: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  member_count: number;
  created_at: string;
  settings: Record<string, any>;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTeams: number;
  invoicesThisMonth: number;
  revenueThisMonth: number;
  systemHealth: {
    dbConnections: number;
    apiLatency: number;
    uptime: number;
  };
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(teamId?: string) {
  try {
    const supabase = createClient();

    let query = supabase.from('users').select('*, team_members(role)');

    if (teamId) {
      query = query.eq('team_members.team_id', teamId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get all teams (admin only)
 */
export async function getAllTeams() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('teams')
      .select(
        `
        *,
        members:team_members(count),
        invoices(count)
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, teamId: string, role: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('user_id', userId)
      .eq('team_id', teamId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Suspend user account
 */
export async function suspendUser(userId: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('users')
      .update({ status: 'suspended' })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
}

/**
 * Reactivate user account
 */
export async function reactivateUser(userId: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('users')
      .update({ status: 'active' })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error reactivating user:', error);
    throw error;
  }
}

/**
 * Delete user account
 */
export async function deleteUser(userId: string) {
  try {
    const supabase = createClient();

    // Delete user data first
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Update team subscription
 */
export async function updateTeamSubscription(
  teamId: string,
  tier: 'free' | 'pro' | 'enterprise'
) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('teams')
      .update({ subscription_tier: tier })
      .eq('id', teamId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Get admin metrics/dashboard
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  try {
    const supabase = createClient();

    // Get user counts
    const { data: users } = await supabase.from('users').select('id, last_login');

    // Get team count
    const { count: teamCount } = await supabase
      .from('teams')
      .select('id', { count: 'exact' });

    // Get this month's invoices
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount')
      .gte('created_at', startOfMonth.toISOString());

    const activeUsers = users?.filter(u => {
      if (!u.last_login) return false;
      const lastLogin = new Date(u.last_login);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastLogin > thirtyDaysAgo;
    }).length || 0;

    const revenue = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

    return {
      totalUsers: users?.length || 0,
      activeUsers,
      totalTeams: teamCount || 0,
      invoicesThisMonth: invoices?.length || 0,
      revenueThisMonth: revenue,
      systemHealth: {
        dbConnections: 0, // Would need monitoring service
        apiLatency: 0,
        uptime: 99.9,
      },
    };
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalTeams: 0,
      invoicesThisMonth: 0,
      revenueThisMonth: 0,
      systemHealth: {
        dbConnections: 0,
        apiLatency: 0,
        uptime: 0,
      },
    };
  }
}

/**
 * Get team usage statistics
 */
export async function getTeamUsageStats(teamId: string) {
  try {
    const supabase = createClient();

    const [
      { count: memberCount },
      { count: invoiceCount },
      { count: projectCount },
      { count: timeEntryCount },
      { data: invoices },
    ] = await Promise.all([
      supabase
        .from('team_members')
        .select('id', { count: 'exact' })
        .eq('team_id', teamId),
      supabase
        .from('invoices')
        .select('id', { count: 'exact' })
        .eq('team_id', teamId),
      supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('team_id', teamId),
      supabase
        .from('time_entries')
        .select('id', { count: 'exact' })
        .eq('team_id', teamId),
      supabase.from('invoices').select('amount').eq('team_id', teamId),
    ]);

    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

    return {
      teamId,
      members: memberCount || 0,
      invoices: invoiceCount || 0,
      projects: projectCount || 0,
      timeEntries: timeEntryCount || 0,
      totalRevenue,
    };
  } catch (error) {
    console.error('Error fetching team usage:', error);
    throw error;
  }
}

/**
 * Admin roles and permissions
 */
export const ADMIN_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    permissions: ['all'],
    description: 'Full system access',
  },
  ADMIN: {
    name: 'Admin',
    permissions: [
      'manage_teams',
      'manage_users',
      'manage_subscriptions',
      'view_analytics',
      'system_settings',
    ],
    description: 'Team and system management',
  },
  MANAGER: {
    name: 'Manager',
    permissions: [
      'manage_team_members',
      'view_team_analytics',
      'manage_projects',
    ],
    description: 'Team management',
  },
  USER: {
    name: 'User',
    permissions: ['view_own_data', 'create_own_items'],
    description: 'Standard user',
  },
};

/**
 * Check admin permission
 */
export function hasAdminPermission(userRole: string, permission: string): boolean {
  const role = Object.values(ADMIN_ROLES).find(r => r.name === userRole);
  if (!role) return false;

  if (role.permissions.includes('all')) return true;
  return role.permissions.includes(permission);
}

/**
 * System settings update
 */
export async function updateSystemSettings(settings: Record<string, any>) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'admin_settings',
        value: settings,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
}
