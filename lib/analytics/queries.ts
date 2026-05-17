import { supabase } from '../supabase/client';

interface AnalyticsMetrics {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  profitMargin: number;
  averageProjectValue: number;
  totalProjects: number;
  completedProjects: number;
  completionRate: number;
  totalClients: number;
  repeatClientRate: number;
  averageProjectDuration: number;
}

interface RevenueByPeriod {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface TopMetrics {
  topClientsByRevenue: Array<{ name: string; revenue: number; projectCount: number }>;
  topProjectsByProfit: Array<{ name: string; profit: number; margin: number }>;
  topMaterialCosts: Array<{ name: string; totalCost: number; usageCount: number }>;
}

/**
 * Get analytics metrics for a team
 */
export async function getAnalyticsMetrics(teamId: string, startDate: string, endDate: string): Promise<AnalyticsMetrics | null> {
  try {
    // Get all invoices for period
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount, status')
      .eq('team_id', teamId)
      .gte('issue_date', startDate)
      .lte('issue_date', endDate);

    // Get all projects for period
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, status, created_at')
      .eq('team_id', teamId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Get all budgets to calculate expenses
    const { data: budgets } = await supabase
      .from('budget_tracking')
      .select('spent_amount, project_id');

    // Calculate metrics
    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
    const totalExpenses = budgets?.reduce((sum, budget) => sum + (budget.spent_amount || 0), 0) || 0;
    const grossProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    const totalProjects = projects?.length || 0;
    const completedProjects = projects?.filter((p) => p.status === 'completed').length || 0;
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    
    const averageProjectValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;

    // Get unique clients
    const { data: clients } = await supabase
      .from('invoices')
      .select('client_id')
      .eq('team_id', teamId)
      .gte('issue_date', startDate)
      .lte('issue_date', endDate);

    const uniqueClients = new Set(clients?.map((c) => c.client_id) || []);
    const totalClients = uniqueClients.size;

    // Calculate repeat client rate
    const { data: allTimeClients } = await supabase
      .from('invoices')
      .select('client_id')
      .eq('team_id', teamId);

    const clientCounts: Record<string, number> = {};
    allTimeClients?.forEach((inv) => {
      clientCounts[inv.client_id] = (clientCounts[inv.client_id] || 0) + 1;
    });

    const repeatClients = Object.values(clientCounts).filter((count) => count > 1).length;
    const repeatClientRate = totalClients > 0 ? (repeatClients / totalClients) * 100 : 0;

    // Calculate average project duration (simplified)
    const averageProjectDuration = projects && projects.length > 0 ? 14 : 0; // Placeholder

    return {
      totalRevenue,
      totalExpenses,
      grossProfit,
      profitMargin,
      averageProjectValue,
      totalProjects,
      completedProjects,
      completionRate,
      totalClients,
      repeatClientRate,
      averageProjectDuration,
    };
  } catch (error) {
    console.error('Error calculating analytics metrics:', error);
    return null;
  }
}

/**
 * Get revenue trends
 */
export async function getRevenueTrends(teamId: string, months: number = 12): Promise<RevenueByPeriod[]> {
  try {
    const trends: RevenueByPeriod[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

      const { data: monthlyInvoices } = await supabase
        .from('invoices')
        .select('total_amount, status')
        .eq('team_id', teamId)
        .gte('issue_date', startOfMonth)
        .lte('issue_date', endOfMonth);

      const revenue = monthlyInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      // Get expenses for the month
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('team_id', teamId)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

      let expenses = 0;
      if (projects) {
        const { data: budgets } = await supabase
          .from('budget_tracking')
          .select('spent_amount')
          .in('project_id', projects.map((p) => p.id));

        expenses = budgets?.reduce((sum, b) => sum + (b.spent_amount || 0), 0) || 0;
      }

      trends.push({
        period: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue,
        expenses,
        profit: revenue - expenses,
      });
    }

    return trends;
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    return [];
  }
}

/**
 * Get top performers
 */
export async function getTopMetrics(teamId: string, limit: number = 5): Promise<TopMetrics> {
  try {
    // Top clients by revenue
    const { data: clientRevenue } = await supabase
      .from('invoices')
      .select('client_id, total_amount')
      .eq('team_id', teamId);

    const clientStats: Record<string, { revenue: number; count: number; name: string }> = {};
    clientRevenue?.forEach((inv) => {
      if (!clientStats[inv.client_id]) {
        clientStats[inv.client_id] = { revenue: 0, count: 0, name: '' };
      }
      clientStats[inv.client_id].revenue += inv.total_amount || 0;
      clientStats[inv.client_id].count += 1;
    });

    const topClientsByRevenue = Object.entries(clientStats)
      .map(([id, stats]) => ({
        name: stats.name || id.slice(0, 8),
        revenue: stats.revenue,
        projectCount: stats.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    // Top projects by profit (simplified)
    const topProjectsByProfit: TopMetrics['topProjectsByProfit'] = [];

    // Top material costs
    const topMaterialCosts: TopMetrics['topMaterialCosts'] = [];

    return {
      topClientsByRevenue,
      topProjectsByProfit,
      topMaterialCosts,
    };
  } catch (error) {
    console.error('Error fetching top metrics:', error);
    return {
      topClientsByRevenue: [],
      topProjectsByProfit: [],
      topMaterialCosts: [],
    };
  }
}

/**
 * Get forecast
 */
export async function getRevenueForecast(teamId: string, months: number = 3) {
  try {
    // Get average monthly revenue from last 6 months
    const lastSixMonths: RevenueByPeriod[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

      const { data: monthlyInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('team_id', teamId)
        .gte('issue_date', startOfMonth)
        .lte('issue_date', endOfMonth);

      const revenue = monthlyInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      lastSixMonths.push({
        period: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue,
        expenses: 0,
        profit: 0,
      });
    }

    const avgMonthlyRevenue = lastSixMonths.reduce((sum, m) => sum + m.revenue, 0) / lastSixMonths.length;
    const forecast = Array.from({ length: months }).map((_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      return {
        period: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue: avgMonthlyRevenue,
        expenses: 0,
        profit: avgMonthlyRevenue,
      };
    });

    return forecast;
  } catch (error) {
    console.error('Error calculating forecast:', error);
    return [];
  }
}
