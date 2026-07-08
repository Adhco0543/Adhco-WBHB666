'use client';

import { Users, Building2, TrendingUp, Shield, Ban, RotateCcw, Trash2 } from 'lucide-react';
import {
  getAdminMetrics,
  getAllUsers,
  getAllTeams,
  updateUserRole,
  suspendUser,
  reactivateUser,
  deleteUser,
  updateTeamSubscription,
} from '@/lib/adminPanel';
import { useState, useEffect } from 'react';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'teams'>('metrics');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsData, usersData, teamsData] = await Promise.all([
        getAdminMetrics(),
        getAllUsers(),
        getAllTeams(),
      ]);

      setMetrics(metricsData);
      setUsers(usersData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {(['metrics', 'users', 'teams'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'metrics' && <TrendingUp className="inline mr-2" size={16} />}
            {tab === 'users' && <Users className="inline mr-2" size={16} />}
            {tab === 'teams' && <Building2 className="inline mr-2" size={16} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Metrics Tab */}
      {activeTab === 'metrics' && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={<Users className="text-blue-600" />}
            change="+2.5%"
          />
          <MetricCard
            title="Active Users (30d)"
            value={metrics.activeUsers}
            icon={<Users className="text-green-600" />}
            change={`${Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% active`}
          />
          <MetricCard
            title="Total Teams"
            value={metrics.totalTeams}
            icon={<Building2 className="text-purple-600" />}
            change="+1 new"
          />
          <MetricCard
            title="Invoices (This Month)"
            value={metrics.invoicesThisMonth}
            icon={<TrendingUp className="text-orange-600" />}
          />
          <MetricCard
            title="Revenue (This Month)"
            value={`$${(metrics.revenueThisMonth / 1000).toFixed(1)}K`}
            icon={<TrendingUp className="text-green-600" />}
          />
          <MetricCard
            title="Uptime"
            value={`${metrics.systemHealth.uptime}%`}
            icon={<Shield className="text-emerald-600" />}
            status="healthy"
          />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <UserManagement users={users} onUpdate={loadData} />
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <TeamManagement teams={teams} onUpdate={loadData} />
      )}
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({
  title,
  value,
  icon,
  change,
  status,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  status?: 'healthy' | 'warning' | 'critical';
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="text-4xl font-bold text-gray-900">{value}</div>
        <div className="p-3 bg-gray-100 rounded">{icon}</div>
      </div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
      {change && (
        <div className="text-xs text-gray-500 mt-2">{change}</div>
      )}
      {status && (
        <div className={`text-xs font-medium mt-2 ${
          status === 'healthy' ? 'text-green-600' :
          status === 'warning' ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {status === 'healthy' && '● Healthy'}
          {status === 'warning' && '● Warning'}
          {status === 'critical' && '● Critical'}
        </div>
      )}
    </div>
  );
}

/**
 * User Management Component
 */
function UserManagement({
  users,
  onUpdate,
}: {
  users: any[];
  onUpdate: () => void;
}) {
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleSuspend = async (userId: string) => {
    setActionInProgress(userId);
    try {
      await suspendUser(userId);
      onUpdate();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReactivate = async (userId: string) => {
    setActionInProgress(userId);
    try {
      await reactivateUser(userId);
      onUpdate();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure? This cannot be undone.')) {
      setActionInProgress(userId);
      try {
        await deleteUser(userId);
        onUpdate();
      } finally {
        setActionInProgress(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : user.status === 'suspended'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status || 'active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {user.status === 'suspended' ? (
                    <button
                      onClick={() => handleReactivate(user.id)}
                      disabled={actionInProgress === user.id}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition"
                    >
                      <RotateCcw size={14} className="inline mr-1" />
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(user.id)}
                      disabled={actionInProgress === user.id}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50 transition"
                    >
                      <Ban size={14} className="inline mr-1" />
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={actionInProgress === user.id}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 transition"
                  >
                    <Trash2 size={14} className="inline mr-1" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Team Management Component
 */
function TeamManagement({
  teams,
  onUpdate,
}: {
  teams: any[];
  onUpdate: () => void;
}) {
  const [updatingTeam, setUpdatingTeam] = useState<string | null>(null);

  const handleSubscriptionChange = async (teamId: string, newTier: string) => {
    setUpdatingTeam(teamId);
    try {
      await updateTeamSubscription(teamId, newTier as any);
      onUpdate();
    } finally {
      setUpdatingTeam(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Team Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Members</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Subscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{team.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{team.members?.[0]?.count || 0}</td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={team.subscription_tier || 'free'}
                    onChange={(e) => handleSubscriptionChange(team.id, e.target.value)}
                    disabled={updatingTeam === team.id}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(team.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
