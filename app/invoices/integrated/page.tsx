'use client';

import { Plus, History } from 'lucide-react';
import { BulkActionsToolbar, BulkActionCheckbox, BulkActionSelectAll } from '@/components/BulkActionsToolbar';
import { SavedViewsPanel, FilterBuilder } from '@/components/SavedViewsPanel';
import { CommentsPanel, ActivityFeed } from '@/components/CommentsPanel';
import { AuditLogModal } from '@/components/AuditLogViewer';
import { useBulkActions } from '@/lib/hooks/useBulkActions';
import { useState, useEffect } from 'react';

const MOCK_INVOICES = [
  {
    id: 'inv-001',
    number: 'INV-001',
    client: 'Acme Corp',
    amount: 5000,
    status: 'overdue',
    due_date: '2025-01-15',
    created_at: '2025-01-01',
  },
  {
    id: 'inv-002',
    number: 'INV-002',
    client: 'BuildCo',
    amount: 8500,
    status: 'unpaid',
    due_date: '2025-02-15',
    created_at: '2025-01-10',
  },
  {
    id: 'inv-003',
    number: 'INV-003',
    client: 'ConstructPro',
    amount: 12000,
    status: 'paid',
    due_date: '2025-01-20',
    created_at: '2025-01-05',
  },
];

export default function InvoicesIntegratedPage() {
  const { selectedIds, count, toggle, toggleAll, clear } = useBulkActions();
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [views, setViews] = useState<any[]>([]);
  const [showAuditLog, setShowAuditLog] = useState<string | null>(null);
  const [filters, setFilters] = useState<any[]>([]);

  const handleBulkDelete = async (ids: string[]) => {
    setInvoices(invoices.filter(inv => !ids.includes(inv.id)));
  };

  const handleExport = (items: any[]) => {
    console.log('Exporting:', items);
  };

  const allIds = invoices.map(inv => inv.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Plus size={20} />
            New Invoice
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters & Views */}
          <div className="lg:col-span-1 space-y-6">
            <SavedViewsPanel
              views={views}
              onSelectView={(view) => setFilters(view.filters || [])}
              teamId="team-1"
              entityType="invoice"
              onRefresh={() => {}}
            />

            <FilterBuilder
              filters={filters}
              onChange={setFilters}
              entityType="invoice"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Invoices Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left w-12">
                        <BulkActionSelectAll
                          allIds={allIds}
                          selectedIds={selectedIds}
                          onChange={toggleAll}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className={selectedIds.includes(invoice.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      >
                        <td className="px-6 py-4">
                          <BulkActionCheckbox
                            id={invoice.id}
                            checked={selectedIds.includes(invoice.id)}
                            onChange={toggle}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.number}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{invoice.client}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">${invoice.amount}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setShowAuditLog(invoice.id)}
                            className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                          >
                            <History size={14} />
                            History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments & Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
                <CommentsPanel
                  entityType="invoice"
                  entityId={invoices[0]?.id || 'inv-001'}
                  teamId="team-1"
                  userId="user-1"
                />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <ActivityFeed teamId="team-1" limit={5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        items={invoices}
        onDelete={handleBulkDelete}
        onExport={handleExport}
        entityType="invoice"
        allowedActions={['delete', 'export', 'view']}
      />

      {/* Audit Log Modal */}
      {showAuditLog && (
        <AuditLogModal
          isOpen={!!showAuditLog}
          onClose={() => setShowAuditLog(null)}
          entityType="invoice"
          entityId={showAuditLog}
          teamId="team-1"
          title={`Invoice ${invoices.find(inv => inv.id === showAuditLog)?.number}`}
        />
      )}
    </div>
  );
}
