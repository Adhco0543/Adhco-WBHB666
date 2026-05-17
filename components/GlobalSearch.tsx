'use client';

import { useState, useEffect, useRef } from 'react';
import { globalSearch, type SearchResult } from '@/lib/search/global';
import Link from 'next/link';

interface GlobalSearchProps {
  teamId: string;
}

export function GlobalSearch({ teamId }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSearch = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await globalSearch(teamId, query);
        setResults(searchResults.slice(0, 10));
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, teamId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <input
        type="text"
        placeholder="Search projects, quotes, invoices... (Cmd+K)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length > 0 && setIsOpen(true)}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          fontSize: '14px',
          boxSizing: 'border-box',
        }}
      />

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {isLoading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
              Loading...
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <Link key={`${result.type}-${result.id}`} href={result.url}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{result.title}</div>
                    {result.description && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          marginTop: '4px',
                        }}
                      >
                        {result.description}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      backgroundColor: '#e3f2fd',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: '#007bff',
                    }}
                  >
                    {result.type}
                  </span>
                </div>
              </Link>
            ))
          ) : query.length > 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
              No results found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
