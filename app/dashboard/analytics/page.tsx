'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsMetrics, getRevenueTrends, getTopMetrics } from '@/lib/analytics/queries';

interface Metrics {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  profitMargin: number;
  completionRate: number;
  totalClients: number;
  repeatClientRate: number;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setIsLoading(true);
    try {
      // In a real app, would get teamId from auth context
      // const data = await getAnalyticsMetrics('team-id', startDate, endDate);
      // setMetrics(data);

      // For now, show placeholder
      setMetrics({
        totalRevenue: 54230,
        totalExpenses: 22150,
        grossProfit: 32080,
        profitMargin: 59.1,
        completionRate: 87,
        totalClients: 12,
        repeatClientRate: 58,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const MetricCard = ({ label, value, unit = '', color = '#007bff' }: any) => (
    <div
      style={{
        flex: 1,
        minWidth: '200px',
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #eee',
        borderRadius: '8px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color }}>
        {value}
        {unit}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Analytics Dashboard</h1>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Loading analytics...
        </div>
      ) : metrics ? (
        <div>
          {/* Key metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
            <MetricCard label="Total Revenue" value={`$${(metrics.totalRevenue / 1000).toFixed(1)}k`} color="#28a745" />
            <MetricCard label="Gross Profit" value={`$${(metrics.grossProfit / 1000).toFixed(1)}k`} color="#007bff" />
            <MetricCard label="Profit Margin" value={metrics.profitMargin.toFixed(1)} unit="%" color="#ffc107" />
            <MetricCard label="Total Clients" value={metrics.totalClients} color="#17a2b8" />
          </div>

          {/* Secondary metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
            <MetricCard label="Completion Rate" value={metrics.completionRate} unit="%" color="#28a745" />
            <MetricCard label="Repeat Client Rate" value={metrics.repeatClientRate} unit="%" color="#ffc107" />
            <MetricCard label="Total Expenses" value={`$${(metrics.totalExpenses / 1000).toFixed(1)}k`} color="#dc3545" />
          </div>

          {/* Placeholder for charts */}
          <div style={{ backgroundColor: '#f5f5f5', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#999', marginTop: '30px' }}>
            <p>📊 Revenue trends chart (requires chart library integration)</p>
          </div>

          {/* Top performers section */}
          <div style={{ marginTop: '30px' }}>
            <h2 style={{ marginBottom: '16px' }}>Top Performers</h2>
            <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
              <p style={{ color: '#999' }}>Top clients by revenue, projects by profit, and material costs will display here.</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No analytics data available
        </div>
      )}
    </div>
  );
}
