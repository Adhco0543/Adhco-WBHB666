// Determines which dashboard widgets to show based on user preferences

export interface DashboardWidget {
  id: string;
  title: string;
  category: string;
  priority: number; // 1 = highest priority
  requiredFocus?: string[];
  suggestedTeamSize?: string[];
  component: string; // Component name to render
}

export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  // INVOICING WIDGETS
  {
    id: 'invoice_overview',
    title: 'Invoice Overview',
    category: 'invoicing',
    priority: 1,
    requiredFocus: ['invoicing'],
    component: 'InvoiceOverviewWidget',
  },
  {
    id: 'revenue_tracking',
    title: 'Revenue Tracking',
    category: 'invoicing',
    priority: 2,
    requiredFocus: ['invoicing'],
    component: 'RevenueTrackingWidget',
  },
  {
    id: 'overdue_invoices',
    title: 'Overdue Invoices',
    category: 'invoicing',
    priority: 3,
    requiredFocus: ['invoicing'],
    component: 'OverdueInvoicesWidget',
  },

  // TIME TRACKING WIDGETS
  {
    id: 'time_tracking_summary',
    title: 'Time Tracking Summary',
    category: 'time_tracking',
    priority: 1,
    requiredFocus: ['time_tracking'],
    component: 'TimeTrackingSummaryWidget',
  },
  {
    id: 'billable_hours',
    title: 'Billable Hours',
    category: 'time_tracking',
    priority: 2,
    requiredFocus: ['time_tracking'],
    component: 'BillableHoursWidget',
  },
  {
    id: 'team_productivity',
    title: 'Team Productivity',
    category: 'time_tracking',
    priority: 3,
    requiredFocus: ['time_tracking'],
    suggestedTeamSize: ['small_team', 'medium_team', 'large_team'],
    component: 'TeamProductivityWidget',
  },

  // EXPENSE TRACKING WIDGETS
  {
    id: 'expense_summary',
    title: 'Expense Summary',
    category: 'expense_tracking',
    priority: 1,
    requiredFocus: ['expense_tracking'],
    component: 'ExpenseSummaryWidget',
  },
  {
    id: 'expense_by_category',
    title: 'Expenses by Category',
    category: 'expense_tracking',
    priority: 2,
    requiredFocus: ['expense_tracking'],
    component: 'ExpenseByCategoryWidget',
  },

  // PROFITABILITY WIDGETS
  {
    id: 'profit_margin',
    title: 'Profit Margin Analysis',
    category: 'profitability',
    priority: 1,
    requiredFocus: ['profitability'],
    component: 'ProfitMarginWidget',
  },
  {
    id: 'project_profitability',
    title: 'Project Profitability',
    category: 'profitability',
    priority: 2,
    requiredFocus: ['profitability'],
    component: 'ProjectProfitabilityWidget',
  },
  {
    id: 'cost_breakdown',
    title: 'Cost Breakdown',
    category: 'profitability',
    priority: 3,
    requiredFocus: ['profitability'],
    component: 'CostBreakdownWidget',
  },

  // SAFETY WIDGETS
  {
    id: 'safety_incidents',
    title: 'Safety Incidents',
    category: 'safety',
    priority: 1,
    requiredFocus: ['safety'],
    component: 'SafetyIncidentsWidget',
  },
  {
    id: 'compliance_alerts',
    title: 'Compliance Alerts',
    category: 'safety',
    priority: 2,
    requiredFocus: ['safety'],
    component: 'ComplianceAlertsWidget',
  },

  // EQUIPMENT WIDGETS
  {
    id: 'equipment_status',
    title: 'Equipment Status',
    category: 'equipment',
    priority: 1,
    requiredFocus: ['equipment'],
    suggestedTeamSize: ['mid_contractor', 'large_contractor'],
    component: 'EquipmentStatusWidget',
  },
  {
    id: 'maintenance_schedule',
    title: 'Maintenance Schedule',
    category: 'equipment',
    priority: 2,
    requiredFocus: ['equipment'],
    component: 'MaintenanceScheduleWidget',
  },

  // CLIENT COMMUNICATION
  {
    id: 'client_messages',
    title: 'Client Messages',
    category: 'client_communication',
    priority: 1,
    requiredFocus: ['client_communication'],
    component: 'ClientMessagesWidget',
  },
  {
    id: 'pending_approvals',
    title: 'Pending Approvals',
    category: 'client_communication',
    priority: 2,
    requiredFocus: ['client_communication'],
    component: 'PendingApprovalsWidget',
  },

  // TEAM MANAGEMENT
  {
    id: 'team_overview',
    title: 'Team Overview',
    category: 'team_management',
    priority: 1,
    requiredFocus: ['team_management'],
    suggestedTeamSize: ['small_team', 'medium_team', 'large_team'],
    component: 'TeamOverviewWidget',
  },
  {
    id: 'task_distribution',
    title: 'Task Distribution',
    category: 'team_management',
    priority: 2,
    requiredFocus: ['team_management'],
    suggestedTeamSize: ['small_team', 'medium_team', 'large_team'],
    component: 'TaskDistributionWidget',
  },

  // GENERAL WIDGETS (always shown)
  {
    id: 'quick_actions',
    title: 'Quick Actions',
    category: 'general',
    priority: 1,
    component: 'QuickActionsWidget',
  },
  {
    id: 'recent_activity',
    title: 'Recent Activity',
    category: 'general',
    priority: 2,
    component: 'RecentActivityWidget',
  },
  {
    id: 'upcoming_deadlines',
    title: 'Upcoming Deadlines',
    category: 'general',
    priority: 3,
    component: 'UpcomingDeadlinesWidget',
  },
];

export interface UserPreferences {
  businessType: 'small_contractor' | 'mid_contractor' | 'large_contractor' | '';
  primaryFocus: string[];
  teamSize: 'solo' | 'small_team' | 'medium_team' | 'large_team' | '';
  painPoints: string[];
  integrations: string[];
}

export function getRelevantWidgets(preferences: UserPreferences): DashboardWidget[] {
  // Filter widgets based on user preferences
  const relevant = DASHBOARD_WIDGETS.filter(widget => {
    // Always show general widgets
    if (widget.category === 'general') return true;

    // Check if widget matches user's focus areas
    if (widget.requiredFocus && widget.requiredFocus.length > 0) {
      if (!widget.requiredFocus.some(focus => preferences.primaryFocus.includes(focus))) {
        return false;
      }
    }

    // Check if widget is suitable for team size
    if (widget.suggestedTeamSize && widget.suggestedTeamSize.length > 0) {
      if (!widget.suggestedTeamSize.includes(preferences.teamSize)) {
        // Still show if it's high priority
        return widget.priority <= 2;
      }
    }

    return true;
  });

  // Sort by priority
  return relevant.sort((a, b) => a.priority - b.priority);
}

export function getPainPointWidgets(preferences: UserPreferences): DashboardWidget[] {
  // Map pain points to relevant widgets
  const painPointWidgetMap: Record<string, string[]> = {
    cash_flow: ['revenue_tracking', 'profit_margin'],
    budget_overruns: ['project_profitability', 'cost_breakdown', 'expense_summary'],
    team_coordination: ['team_overview', 'task_distribution', 'client_messages'],
    invoicing_delays: ['overdue_invoices', 'invoice_overview'],
    compliance: ['compliance_alerts', 'safety_incidents'],
    visibility: ['recent_activity', 'upcoming_deadlines'],
  };

  const relevantWidgetIds = new Set<string>();

  preferences.painPoints.forEach(painPoint => {
    const widgets = painPointWidgetMap[painPoint] || [];
    widgets.forEach(id => relevantWidgetIds.add(id));
  });

  // Get widgets and prioritize pain-point widgets higher
  const widgets = getRelevantWidgets(preferences);
  return widgets.sort((a, b) => {
    const aIsPainPoint = relevantWidgetIds.has(a.id) ? 0 : 1;
    const bIsPainPoint = relevantWidgetIds.has(b.id) ? 0 : 1;
    return aIsPainPoint - bIsPainPoint || a.priority - b.priority;
  });
}

export function getSuggestedWidgets(preferences: UserPreferences): DashboardWidget[] {
  // Return high-priority widgets that aren't yet in the dashboard
  return DASHBOARD_WIDGETS.filter(
    widget => widget.priority === 1 || widget.priority === 2
  ).slice(0, 3);
}
