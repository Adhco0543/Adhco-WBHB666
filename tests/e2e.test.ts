/**
 * End-to-End Test Suite for 35 Features
 * Run with: npx jest tests/e2e.test.ts
 */

import { test, describe, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for tests
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

let testUserId: string;
let testTeamId: string;
let testProjectId: string;
let testClientId: string;
let testInvoiceId: string;

// ==================== TEST SETUP ====================

describe('End-to-End Feature Tests', () => {
  beforeAll(async () => {
    // This would require setting up test auth in a real scenario
    console.log('Setting up test environment...');
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('Cleaning up test data...');
  });

  // ==================== CORE FEATURES ====================

  describe('User Authentication', () => {
    test('should sign up a new user', async () => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!',
          name: 'Test User',
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user).toBeDefined();
      testUserId = data.user.id;
    });

    test('should sign in existing user', async () => {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!',
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.session).toBeDefined();
    });
  });

  describe('Team Management', () => {
    test('should create a new team', async () => {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          name: 'Test Team',
          description: 'Team for testing',
        }),
      });
      expect(response.status).toBe(201);
      const data = await response.json();
      testTeamId = data.team.id;
      expect(data.team.name).toBe('Test Team');
    });

    test('should invite team member', async () => {
      const response = await fetch(`/api/teams/${testTeamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          email: 'member@example.com',
          role: 'editor',
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.invitation).toBeDefined();
    });
  });

  describe('Project Management', () => {
    test('should create a new project', async () => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          team_id: testTeamId,
          name: 'Test Project',
          description: 'Project for testing all features',
          start_date: '2024-01-01',
          end_date: '2024-03-31',
        }),
      });
      expect(response.status).toBe(201);
      const data = await response.json();
      testProjectId = data.project.id;
    });

    test('should initialize project features', async () => {
      const response = await fetch('/api/projects/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          project_id: testProjectId,
          team_id: testTeamId,
          initial_budget: 50000,
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.budget).toBeDefined();
      expect(data.profitability).toBeDefined();
    });
  });

  // ==================== INVOICING & PAYMENTS ====================

  describe('Invoicing Features', () => {
    test('should create an invoice', async () => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          team_id: testTeamId,
          project_id: testProjectId,
          invoice_number: 'INV-001',
          amount: 5000,
          tax_amount: 500,
          total_amount: 5500,
          due_date: '2024-02-28',
        }),
      });
      expect(response.status).toBe(201);
      const data = await response.json();
      testInvoiceId = data.invoice.id;
      expect(data.invoice.status).toBe('draft');
    });

    test('should send invoice', async () => {
      const response = await fetch(`/api/invoices/${testInvoiceId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.invoice.status).toBe('sent');
    });

    test('should generate PDF', async () => {
      const response = await fetch(`/api/invoices/${testInvoiceId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
      });
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/pdf');
    });
  });

  // ==================== TIME TRACKING ====================

  describe('Time Tracking', () => {
    test('should create time entry', async () => {
      const response = await fetch('/api/features/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'create_entry',
          entry: {
            team_id: testTeamId,
            project_id: testProjectId,
            start_time: '2024-01-15T08:00:00Z',
            end_time: '2024-01-15T12:00:00Z',
            duration_minutes: 240,
            billable: true,
            hourly_rate: 75,
          },
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.duration_minutes).toBe(240);
      expect(data.data.total_cost).toBe(300); // 4 hours * $75
    });

    test('should calculate billable hours', async () => {
      const response = await fetch('/api/features/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'get_billable_hours',
          project_id: testProjectId,
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.total_hours).toBeGreaterThan(0);
      expect(data.data.total_cost).toBeGreaterThan(0);
    });
  });

  // ==================== EXPENSE TRACKING ====================

  describe('Expense Tracking', () => {
    test('should log expense', async () => {
      const response = await fetch('/api/features/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'create',
          expense: {
            team_id: testTeamId,
            project_id: testProjectId,
            category: 'materials',
            amount: 2000,
            description: 'Lumber for framing',
            expense_date: '2024-01-15',
          },
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.amount).toBe(2000);
    });

    test('should get project expenses', async () => {
      const response = await fetch('/api/features/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'get_expenses',
          project_id: testProjectId,
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  // ==================== PHOTO GALLERY ====================

  describe('Photo Gallery', () => {
    test('should upload project photo', async () => {
      const response = await fetch('/api/features/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'upload',
          photo: {
            team_id: testTeamId,
            project_id: testProjectId,
            title: 'Before - Front Exterior',
            phase: 'before',
            image_url: 'https://example.com/before.jpg',
            taken_at: new Date().toISOString(),
          },
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.phase).toBe('before');
    });

    test('should get before/after comparison', async () => {
      const response = await fetch('/api/features/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'get_comparisons',
          project_id: testProjectId,
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  // ==================== PROJECT PROFITABILITY ====================

  describe('Project Profitability', () => {
    test('should calculate project profitability', async () => {
      const response = await fetch('/api/features/profitability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'calculate',
          project_id: testProjectId,
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('total_costs');
      expect(data.data).toHaveProperty('gross_profit');
      expect(data.data).toHaveProperty('profit_margin_percent');
    });

    test('should track materials cost', async () => {
      const response = await fetch('/api/features/profitability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'get_cost_breakdown',
          project_id: testProjectId,
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.material_costs).toBeGreaterThanOrEqual(0);
      expect(data.data.labor_costs).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== APPROVALS ====================

  describe('Project Approvals', () => {
    test('should create approval workflow', async () => {
      const response = await fetch('/api/features/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'create',
          approval: {
            team_id: testTeamId,
            project_id: testProjectId,
            entity_type: 'quote',
            approvers: ['user1@example.com', 'user2@example.com'],
          },
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.status).toBe('pending');
    });

    test('should approve entity', async () => {
      // First create an approval
      const createResponse = await fetch('/api/features/approvals', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
          approval: {
            team_id: testTeamId,
            project_id: testProjectId,
            entity_type: 'quote',
            approvers: ['user1@example.com'],
          },
        }),
      });
      const approval = await createResponse.json();

      // Then approve it
      const approveResponse = await fetch('/api/features/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'update_status',
          approval_id: approval.data.id,
          approved: true,
        }),
      });
      expect(approveResponse.status).toBe(200);
      const data = await approveResponse.json();
      expect(data.data.status).toBe('approved');
    });
  });

  // ==================== SAFETY LOGS ====================

  describe('Safety & Compliance', () => {
    test('should log safety incident', async () => {
      const response = await fetch('/api/features/safety', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'log_incident',
          log: {
            team_id: testTeamId,
            project_id: testProjectId,
            log_type: 'incident',
            title: 'Near miss - tool drop',
            severity: 'medium',
            description: 'Wrench dropped from scaffolding',
          },
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.log_type).toBe('incident');
    });

    test('should get safety compliance alerts', async () => {
      const response = await fetch('/api/features/safety', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'get_alerts',
          team_id: testTeamId,
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  // ==================== WARRANTY TRACKING ====================

  describe('Warranty Tracking', () => {
    test('should create warranty record', async () => {
      const response = await fetch('/api/features/warranty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'create',
          warranty: {
            team_id: testTeamId,
            project_id: testProjectId,
            item_description: 'Roof shingles installation',
            warranty_type: 'material',
            coverage_period_months: 36,
            start_date: '2024-01-15',
          },
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.coverage_period_months).toBe(36);
    });
  });

  // ==================== CLIENT COMMUNICATIONS ====================

  describe('Client Communications', () => {
    test('should send message to client', async () => {
      const response = await fetch('/api/features/communications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'create_message',
          message: {
            team_id: testTeamId,
            project_id: testProjectId,
            content: 'Progress update: Framing 80% complete',
            message_type: 'update',
            priority: 'normal',
          },
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.message_type).toBe('update');
    });
  });

  // ==================== ANALYTICS ====================

  describe('Analytics & Reports', () => {
    test('should calculate KPIs', async () => {
      const response = await fetch('/api/features/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'get_team_kpis',
          team_id: testTeamId,
        }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('total_revenue');
      expect(data.data).toHaveProperty('active_projects');
    });
  });

  // ==================== INTEGRATION TESTS ====================

  describe('Feature Integration', () => {
    test('should create invoice and track payment', async () => {
      // Create invoice
      const invoiceResponse = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          team_id: testTeamId,
          project_id: testProjectId,
          invoice_number: 'INV-002',
          total_amount: 3000,
          due_date: '2024-02-28',
        }),
      });
      const invoice = await invoiceResponse.json();

      // Record payment
      const paymentResponse = await fetch(`/api/invoices/${invoice.data.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          amount: 3000,
          payment_method: 'stripe',
        }),
      });
      expect(paymentResponse.status).toBe(200);

      // Verify profitability updated
      const profitResponse = await fetch('/api/features/profitability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          action: 'calculate',
          project_id: testProjectId,
        }),
      });
      const profit = await profitResponse.json();
      expect(profit.data.actual_revenue).toBeGreaterThan(0);
    });
  });
});

// ==================== PERFORMANCE TESTS ====================

describe('Performance Tests', () => {
  test('should fetch team dashboard under 2 seconds', async () => {
    const startTime = Date.now();
    const response = await fetch(`/api/dashboard?team_id=${testTeamId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
      },
    });
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(2000);
    expect(response.status).toBe(200);
  });

  test('should search entities quickly', async () => {
    const startTime = Date.now();
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        query: 'test',
        team_id: testTeamId,
      }),
    });
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(500);
    expect(response.status).toBe(200);
  });
});
