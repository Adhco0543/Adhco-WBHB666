'use client';

import { useState, useEffect } from 'react';
import { getInvoices, updateInvoice } from '@/lib/supabase/database';
import { stripe, createPaymentIntent } from '@/lib/payments/stripe';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  client_id: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, [filter]);

  async function loadInvoices() {
    setIsLoading(true);
    try {
      // Note: This requires user context/teamId - in real app would get from auth context
      // const { data } = await getInvoices('team-id', { status: filter !== 'all' ? filter : undefined });
      // setInvoices(data || []);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePayment(invoiceId: string, amount: number) {
    try {
      const paymentIntent = await createPaymentIntent(invoiceId, amount);
      // In a real app, redirect to Stripe payment page
      console.log('Payment intent created:', paymentIntent);
    } catch (error) {
      console.error('Payment error:', error);
    }
  }

  const statusColors: Record<string, string> = {
    draft: '#ffc107',
    sent: '#17a2b8',
    paid: '#28a745',
    overdue: '#dc3545',
    cancelled: '#6c757d',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Invoices</h1>
        <Link href="/invoices/new">
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + New Invoice
          </button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              border: filter === status ? '2px solid #007bff' : '1px solid #ddd',
              backgroundColor: filter === status ? '#e3f2fd' : 'transparent',
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Invoices table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Loading invoices...
        </div>
      ) : invoices.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Invoice #</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Due Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    <Link href={`/invoices/${invoice.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td style={{ padding: '12px' }}>${invoice.total_amount.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        backgroundColor: statusColors[invoice.status],
                        color: '#fff',
                        fontSize: '12px',
                        textTransform: 'capitalize',
                      }}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(invoice.due_date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handlePayment(invoice.id, invoice.total_amount)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '8px',
                      }}
                    >
                      Pay
                    </button>
                    <Link href={`/invoices/${invoice.id}`}>
                      <button
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#007bff',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No invoices found
        </div>
      )}
    </div>
  );
}
