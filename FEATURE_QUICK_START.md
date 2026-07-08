# Quick Reference: Using the 35 Features

This guide shows how to use each feature with code examples.

---

## Feature Hooks Quick Start

### 1. Time Tracking

**Import**:
```typescript
import { useTimeTracking } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { isTracking, startTime, startTracking, stopTracking } = useTimeTracking();

// In your component:
<button onClick={startTracking}>Start</button>
{isTracking && <span>⏱️ Tracking...</span>}
<button onClick={() => stopTracking(projectId, true)}>Stop</button>
```

**API Call**:
```typescript
POST /api/features/time-tracking
{
  "action": "create_entry",
  "entry": {
    "projectId": "...",
    "billable": true,
    "durationMinutes": 240,
    "hourlyRate": 75
  }
}
```

---

### 2. Expense Tracking

**Import**:
```typescript
import { useExpenseTracking } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { expenses, addExpense } = useExpenseTracking();

// Add expense
await addExpense(projectId, {
  category: 'materials',
  amount: 2000,
  description: 'Lumber',
  expenseDate: new Date()
});

// Display expenses
{expenses.map(exp => (
  <div>{exp.description}: ${exp.amount}</div>
))}
```

---

### 3. Project Photos

**Import**:
```typescript
import { useProjectPhotos } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { photos, uploadPhoto } = useProjectPhotos();

// Upload photo
await uploadPhoto(projectId, imageFile, 'before');

// Display gallery
<div className="grid">
  {photos.map(photo => (
    <img src={photo.imageUrl} alt={photo.title} />
  ))}
</div>
```

---

### 4. Profitability Tracking

**Import**:
```typescript
import { useProfitability } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { profitability, calculate } = useProfitability();

// Calculate on load
useEffect(() => {
  calculate(projectId);
}, [projectId, calculate]);

// Display KPIs
{profitability && (
  <>
    <p>Revenue: ${profitability.actual_revenue}</p>
    <p>Costs: ${profitability.total_costs}</p>
    <p>Profit Margin: {profitability.profit_margin_percent}%</p>
  </>
)}
```

---

### 5. Document Management

**Import**:
```typescript
import { useDocuments } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { documents, uploadDocument } = useDocuments();

// Upload blueprint or contract
await uploadDocument(projectId, pdfFile, 'blueprint');

// List documents
{documents.map(doc => (
  <a href={doc.fileUrl}>{doc.title}</a>
))}
```

---

### 6. Client Communications

**Import**:
```typescript
import { useClientCommunications } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { messages, sendMessage } = useClientCommunications();

// Send progress update
await sendMessage(projectId, 'Framing 80% complete', 'update');

// Display chat
{messages.map(msg => (
  <div className="message">
    <strong>{msg.senderName}:</strong> {msg.content}
  </div>
))}
```

---

### 7. Approval Workflows

**Import**:
```typescript
import { useApprovals } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { approvals, createApproval, updateApprovalStatus } = useApprovals();

// Create approval for quote
await createApproval(projectId, 'quote', ['manager@example.com']);

// Approve as manager
await updateApprovalStatus(approvalId, managerId, true);

// Check status
{approvals.map(a => (
  <p>Status: {a.status}</p> // pending, approved, rejected
))}
```

---

### 8. Safety Incidents

**Import**:
```typescript
import { useSafetyLogs } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { logs, logIncident } = useSafetyLogs();

// Log incident
await logIncident(projectId, {
  logType: 'incident',
  severity: 'high',
  description: 'Fall hazard on scaffolding'
});

// Show safety dashboard
{logs.map(log => (
  <div className={`severity-${log.severity}`}>
    {log.description}
  </div>
))}
```

---

### 9. Equipment Tracking

**Import**:
```typescript
import { useEquipment } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { equipment, logMaintenance } = useEquipment();

// Log maintenance
await logMaintenance(equipmentId, {
  maintenanceType: 'preventive',
  cost: 500,
  description: 'Oil change and filter'
});
```

---

### 10. Warranty Tracking

**Import**:
```typescript
import { useWarranty } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { warranties, createWarranty } = useWarranty();

// Create warranty
await createWarranty(projectId, {
  itemDescription: 'Roof shingles',
  warrantyType: 'material',
  coveragePeriodMonths: 36
});
```

---

### 11. Workflows & Automation

**Import**:
```typescript
import { useWorkflows } from '@/lib/hooks/useFeatures';
```

**Usage**:
```typescript
const { workflows, createWorkflow, executeWorkflow } = useWorkflows();

// Create automation: "When invoice sent, email client"
await createWorkflow(teamId, {
  name: 'Invoice Email',
  triggerEvent: 'invoice_sent',
  actions: [
    { type: 'send_email', template: 'invoice_notification' }
  ]
});

// Execute workflow
await executeWorkflow(workflowId, 'invoice', invoiceId);
```

---

## Integration Utilities

### Initialize Project with All Features

**Import**:
```typescript
import { initializeProjectFeatures } from '@/lib/integration/featureWorkflows';
```

**Usage**:
```typescript
// When creating new project
const { budget, profitability } = await initializeProjectFeatures(
  projectId,
  teamId,
  50000 // initial budget
);
```

### Log Time and Update Budget Automatically

**Import**:
```typescript
import { logTimeAndUpdateBudget } from '@/lib/integration/featureWorkflows';
```

**Usage**:
```typescript
// Time entry automatically updates budget
await logTimeAndUpdateBudget(projectId, {
  startTime: new Date('2024-01-15T08:00'),
  endTime: new Date('2024-01-15T12:00'),
  durationMinutes: 240,
  hourlyRate: 75,
  totalCost: 300
});
// ✅ Automatically: updates spent amount, calculates profitability
```

### Log Expense and Monitor Budget

**Import**:
```typescript
import { logExpenseAndUpdateBudget, checkBudgetWarnings } from '@/lib/integration/featureWorkflows';
```

**Usage**:
```typescript
// Expense automatically updates budget and checks warnings
await logExpenseAndUpdateBudget(projectId, {
  category: 'materials',
  amount: 2000,
  description: 'Lumber'
});
// ✅ Automatically: updates budget, checks if 80%+ spent, alerts team
```

### Create Invoice with Automation

**Import**:
```typescript
import { createInvoiceWithWorkflow } from '@/lib/integration/featureWorkflows';
```

**Usage**:
```typescript
// Invoice automatically triggers workflows
await createInvoiceWithWorkflow(teamId, {
  projectId,
  amount: 5000,
  dueDate: '2024-02-28'
}, userId);
// ✅ Automatically: executes workflows, triggers emails, logs activity
```

---

## API Endpoints Reference

### Time Tracking
```
POST /api/features/time-tracking
Actions: create_entry, get_billable_hours, update_entry
```

### Expenses
```
POST /api/features/expenses
Actions: create, get_expenses, get_category_totals
```

### Documents
```
POST /api/features/documents
Actions: upload, get_project_docs, delete
```

### Photos
```
POST /api/features/photos
Actions: upload, get_photos, get_comparisons
```

### Profitability
```
POST /api/features/profitability
Actions: calculate, get_cost_breakdown, forecast
```

### Approvals
```
POST /api/features/approvals
Actions: create, update_status, get_pending
```

### Safety
```
POST /api/features/safety
Actions: log_incident, get_logs, get_alerts
```

### Warranty
```
POST /api/features/warranty
Actions: create, get_warranties, claim
```

### Communications
```
POST /api/features/communications
Actions: create_message, get_messages, create_request
```

### Equipment
```
POST /api/features/equipment
Actions: log_maintenance, get_equipment, update_status
```

### Workflows
```
POST /api/features/workflows
Actions: create, execute, get_active
```

---

## Complete Example: New Project Workflow

```typescript
import { useProject } from '@/lib/hooks/useProject';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { initializeProjectFeatures, logTimeAndUpdateBudget } from '@/lib/integration/featureWorkflows';
import { useTimeTracking, useExpenseTracking, useProfitability } from '@/lib/hooks/useFeatures';

export function NewProjectPage() {
  const { createProject } = useProject();
  const { createInvoice } = useInvoices();
  const { startTracking, stopTracking } = useTimeTracking();
  const { addExpense } = useExpenseTracking();
  const { profitability, calculate } = useProfitability();

  async function setupNewProject() {
    // 1. Create project
    const project = await createProject({
      name: 'Bathroom Remodel',
      budget: 25000
    });

    // 2. Initialize all features (budget, profitability, tracking)
    await initializeProjectFeatures(project.id, teamId, 25000);

    // 3. Start tracking work
    startTracking();
    // ... work happens ...
    await stopTracking(project.id, true);
    // ✅ Time logged, budget updated, profitability recalculated

    // 4. Log materials
    await addExpense(project.id, {
      category: 'materials',
      amount: 5000,
      description: 'Tile and fixtures'
    });
    // ✅ Budget updated, warnings checked

    // 5. View profitability
    await calculate(project.id);
    console.log(`Margin: ${profitability.profit_margin_percent}%`);

    // 6. Create invoice
    const invoice = await createInvoice({
      projectId: project.id,
      amount: 25000,
      dueDate: '2024-02-28'
    });
    // ✅ Workflows triggered, client notified, activities logged

    return { project, invoice, profitability };
  }

  return (
    <button onClick={setupNewProject}>
      Start New Project
    </button>
  );
}
```

---

## Testing Example

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTimeTracking } from '@/lib/hooks/useFeatures';

describe('Time Tracking', () => {
  test('should track time and update budget', async () => {
    const { result } = renderHook(() => useTimeTracking());

    act(() => {
      result.current.startTracking();
    });

    expect(result.current.isTracking).toBe(true);

    await act(async () => {
      await result.current.stopTracking('project-id', true);
    });

    expect(result.current.isTracking).toBe(false);
  });
});
```

---

## Environment Variables Check

Before using features, verify `.env.local` has:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Payments (for invoices)
STRIPE_SECRET_KEY=sk_...

# Email (for notifications)
RESEND_API_KEY=re_...

# Optional: Integrations
SLACK_BOT_TOKEN=xoxb-...
GOOGLE_CALENDAR_CLIENT_ID=...
```

Missing variables won't break the app but features will fail silently.

---

## Debugging

### Check if feature is working:
```typescript
// In browser console:
const response = await fetch('/api/features/time-tracking', {
  method: 'POST',
  body: JSON.stringify({
    action: 'create_entry',
    entry: { projectId: 'test', durationMinutes: 60 }
  })
});
console.log(await response.json());
```

### Check database:
- Go to Supabase Dashboard
- SQL Editor
- Query table: `SELECT * FROM time_entries LIMIT 10;`

### Check logs:
- Vercel Dashboard → Logs
- Search for error messages
- Check network tab in browser DevTools

---

**Need help?** See `SETUP_GUIDE.md` or `IMPLEMENTATION_LOG.md`
