'use client';

import { useState, useEffect } from 'react';
import { ClientProfile } from '@/lib/workspaceTypes';
import {
  getAllClients,
  getClientByName,
  getTopClients,
  searchClients,
  getClientStats,
} from '@/lib/clientDatabase';

interface ClientDatabaseBrowserProps {
  onClientSelect?: (client: ClientProfile) => void;
  selectableMode?: boolean;
  maxClients?: number;
}

type ViewMode = 'all' | 'top' | 'search';

export function ClientDatabaseBrowser({
  onClientSelect,
  selectableMode = false,
  maxClients = 10,
}: ClientDatabaseBrowserProps) {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<ReturnType<typeof getClientStats> | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      try {
        const allClients = getAllClients();
        setClients(allClients.slice(0, maxClients));
        setStats(getClientStats());
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [maxClients]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchClients(query);
      setClients(results.slice(0, maxClients));
      setViewMode('search');
    } else {
      const allClients = getAllClients();
      setClients(allClients.slice(0, maxClients));
      setViewMode('all');
    }
  };

  const handleViewTopClients = () => {
    const topClients = getTopClients(maxClients);
    setClients(topClients);
    setViewMode('top');
    setSearchQuery('');
  };

  const handleClientSelect = (client: ClientProfile) => {
    setSelectedClient(client.id);
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-900">{stats.totalClients}</div>
            <div className="text-xs text-blue-700 mt-1">Total Clients</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(stats.totalSpent)}
            </div>
            <div className="text-xs text-green-700 mt-1">Total Revenue</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-900">
              {formatCurrency(stats.averageSpendPerClient)}
            </div>
            <div className="text-xs text-orange-700 mt-1">Avg per Client</div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search clients by name, email, phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleViewTopClients}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'top'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ⭐ Top Clients
        </button>
      </div>

      {/* View Mode Indicator */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-600">
          {viewMode === 'search'
            ? `Search results: ${clients.length} client${clients.length !== 1 ? 's' : ''}`
            : viewMode === 'top'
            ? 'Top clients by spend'
            : `All clients: ${clients.length}`}
        </p>
      </div>

      {/* Clients List */}
      {clients.length > 0 ? (
        <div className="space-y-2">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => selectableMode && handleClientSelect(client)}
              className={`border rounded-lg p-4 transition-all ${
                selectableMode
                  ? 'cursor-pointer hover:shadow-md hover:border-blue-300'
                  : ''
              } ${
                selectedClient === client.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{client.name}</h4>

                  {/* Contact Info */}
                  <div className="mt-2 space-y-1">
                    {client.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span>📧</span> {client.email}
                      </p>
                    )}
                    {client.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span>📱</span> {client.phone}
                      </p>
                    )}
                    {client.company && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span>🏢</span> {client.company}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {client.tags && client.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {client.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(client.totalSpent)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {client.projectIds.length} project{client.projectIds.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Added: {formatDate(client.createdAt)}
                </span>
                {client.lastInteractionAt && (
                  <span>
                    Last active: {formatDate(client.lastInteractionAt)}
                  </span>
                )}
              </div>

              {selectableMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClientSelect(client);
                  }}
                  className={`mt-3 w-full px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    selectedClient === client.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedClient === client.id ? '✓ Selected' : 'Select Client'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {searchQuery
              ? 'No clients found matching your search'
              : 'No clients yet. Create your first project to add a client!'}
          </p>
        </div>
      )}
    </div>
  );
}
