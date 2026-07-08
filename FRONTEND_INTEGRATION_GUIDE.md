# 🎨 Frontend Integration Guide

Complete guide to integrating all 15 enhancement features into your ADHCO UI.

---

## 📋 Component Import Reference

### Bulk Actions
```tsx
import { BulkActionsToolbar, BulkActionCheckbox, BulkActionSelectAll } from '@/components/BulkActionsToolbar';
import { useBulkActions } from '@/lib/hooks/useBulkActions';

// Hook usage
const { selectedIds, count, toggle, toggleAll, clear } = useBulkActions();

// In table header
<BulkActionSelectAll allIds={allIds} selectedIds={selectedIds} onChange={toggleAll} />

// In table row
<BulkActionCheckbox id={item.id} checked={isSelected} onChange={toggle} />

// Toolbar (fixed bottom)
<BulkActionsToolbar
  items={items}
  onDelete={handleDelete}
  onExport={handleExport}
  entityType="invoice"
/>
```

### Saved Views & Filters
```tsx
import { SavedViewsPanel, FilterBuilder } from '@/components/SavedViewsPanel';
import { saveView, getTeamViews } from '@/lib/savedViews';

// Sidebar
<SavedViewsPanel
  views={views}
  onSelectView={(view) => applyFilters(view.filters)}
  teamId={teamId}
  entityType="invoice"
/>

// Filter UI
<FilterBuilder
  filters={currentFilters}
  onChange={setFilters}
  entityType="invoice"
/>

// Save view
await saveView({
  team_id: teamId,
  user_id: userId,
  name: 'My View',
  entity_type: 'invoice',
  filters: currentFilters,
});
```

### Comments & Collaboration
```tsx
import { CommentsPanel, ActivityFeed } from '@/components/CommentsPanel';
import { addComment, getTeamActivityFeed } from '@/lib/collaboration';

// Comments on entity
<CommentsPanel
  entityType="invoice"
  entityId={invoiceId}
  teamId={teamId}
  userId={userId}
/>

// Activity feed
<ActivityFeed teamId={teamId} limit={10} />

// Add comment programmatically
await addComment({
  team_id: teamId,
  user_id: userId,
  entity_type: 'invoice',
  entity_id: invoiceId,
  content: 'Comment text',
  mentions: ['user-id-1', 'user-id-2'],
});
```

### Audit Logging
```tsx
import { AuditLogViewer, AuditLogModal } from '@/components/AuditLogViewer';
import { createAuditLog } from '@/lib/auditLogging';

// View change history
<AuditLogViewer
  entityType="invoice"
  entityId={invoiceId}
  teamId={teamId}
/>

// Modal with history
<AuditLogModal
  isOpen={showHistory}
  onClose={() => setShowHistory(false)}
  entityType="invoice"
  entityId={invoiceId}
  teamId={teamId}
  title="Invoice INV-001"
/>

// Log changes
await createAuditLog(
  teamId,
  userId,
  'UPDATE',
  'invoice',
  invoiceId,
  changes
);
```

### Reminders
```tsx
import { RemindersSettings, ReminderScheduler } from '@/components/RemindersSettings';
import { sendEmailReminder, REMINDER_TEMPLATES } from '@/lib/reminders';

// Reminders settings page
<RemindersSettings userId={userId} onSave={handleSave} />

// Reminder scheduler for invoices
<ReminderScheduler
  entityType="invoice"
  entityId={invoiceId}
  onSchedule={() => {}}
/>

// Send reminder
const template = REMINDER_TEMPLATES.INVOICE_OVERDUE.email({
  invoiceNumber: 'INV-001',
  amount: 5000,
  dueDate: '2025-01-15',
});
await sendEmailReminder('client@example.com', template.subject, template.message);
```

### Admin Panel
```tsx
import { AdminDashboard } from '@/components/AdminDashboard';
import {
  getAdminMetrics,
  getAllUsers,
  updateUserRole,
  suspendUser,
} from '@/lib/adminPanel';

// Full admin dashboard
<AdminDashboard />

// Get metrics
const metrics = await getAdminMetrics();

// Manage users
const users = await getAllUsers(teamId);
await updateUserRole(userId, teamId, 'manager');
await suspendUser(userId);
```

### Tours
```tsx
import { useTour, TOUR_GUIDES, TourOverlay } from '@/lib/hooks/useTour';

// In layout (already added):
<TourOverlay />

// Start tour
const { startTour } = useTour();
startTour(TOUR_GUIDES.ONBOARDING);

// Custom tour
const myTour = [
  {
    id: 'step-1',
    title: 'Welcome',
    description: 'Click here to start',
    target: '[data-tour="start-btn"]',
    position: 'bottom',
  },
  // More steps...
];
startTour(myTour);
```

### Notifications
```tsx
import { useNotifications } from '@/lib/hooks/useNotifications';
import { NotificationContainer } from '@/components/NotificationContainer';

// In layout (already added):
<NotificationContainer />

// Dispatch notification
const { addNotification } = useNotifications();
addNotification({
  type: 'success',
  title: 'Invoice Sent',
  message: 'Invoice INV-001 sent successfully',
  duration: 5000,
});

// Types: 'success', 'error', 'warning', 'info'
```

### Keyboard Navigation
```tsx
import { useKeyboardShortcut, APP_SHORTCUTS } from '@/lib/hooks/useKeyboardNavigation';

// Single shortcut
useKeyboardShortcut('ctrl+k', () => openSearch());

// Multiple shortcuts
useKeyboardShortcuts({
  'ctrl+i': () => createInvoice(),
  'ctrl+p': () => createProject(),
  'escape': () => closeModal(),
});

// Arrow navigation
const { currentIndex, goNext, goPrev } = useArrowKeyNavigation(items);
```

### PWA
```tsx
import {
  registerServiceWorker,
  isRunningAsPWA,
  storeOfflineData,
  setupConnectivityListener,
} from '@/lib/pwa';

// On app init
useEffect(() => {
  registerServiceWorker();
  
  setupConnectivityListener(
    () => console.log('Online'),
    () => console.log('Offline'),
  );
}, []);

// Store data for offline
await storeOfflineData('invoices', invoicesData);

// Retrieve offline
const data = await getOfflineData('invoices');
```

### Rate Limiting
```tsx
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimiting';

// In API route
export async function POST(req) {
  const error = await checkRateLimit(req, RATE_LIMITS.INVOICE_CREATE);
  if (error) return error;
  // Process request
}
```

---

## 🏗️ Integration Patterns

### Pattern 1: List Page with Bulk Actions + Filters + Collaboration

```tsx
export default function InvoicesPage() {
  const { selectedIds, toggle, toggleAll } = useBulkActions();
  const [views, setViews] = useState([]);
  const [filters, setFilters] = useState([]);

  return (
    <div>
      {/* Sidebar: Filters + Saved Views */}
      <div className="sidebar">
        <SavedViewsPanel {...props} />
        <FilterBuilder filters={filters} onChange={setFilters} />
      </div>

      {/* Main: Table + Toolbar */}
      <div className="main">
        <Table rows={items} selectedIds={selectedIds} onToggle={toggle} />
        <BulkActionsToolbar {...props} />
      </div>

      {/* Details: Comments + Activity */}
      <div className="details">
        <CommentsPanel {...props} />
        <ActivityFeed {...props} />
      </div>
    </div>
  );
}
```

### Pattern 2: Detail Page with History + Comments

```tsx
export default function InvoicePage({ id }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-6">
      <InvoiceDetails id={id} />
      
      <div className="grid grid-cols-2 gap-6">
        <CommentsPanel entityId={id} entityType="invoice" />
        <AuditLogViewer entityId={id} entityType="invoice" />
      </div>

      <AuditLogModal
        isOpen={showHistory}
        entityId={id}
        entityType="invoice"
      />
    </div>
  );
}
```

### Pattern 3: Settings Page

```tsx
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <RemindersSettings onSave={handleSave} />
      <NotificationPreferences onSave={handleSave} />
      <KeyboardShortcutsGuide />
    </div>
  );
}
```

### Pattern 4: Initialize Tour on First Visit

```tsx
export default function App() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour_completed');
    if (!hasSeenTour) {
      const { startTour } = useTour();
      startTour(TOUR_GUIDES.ONBOARDING);
      localStorage.setItem('tour_completed', 'true');
    }
  }, []);

  return <>{/* App content */}</>;
}
```

---

## 📊 Data Flow Examples

### Invoices List Flow
```
Component mounted
├─ Load invoices from API
├─ Load saved views
├─ Load comments count
└─ Render with:
   ├─ Bulk action checkboxes
   ├─ Saved views sidebar
   ├─ Filter builder
   └─ Comments panel

User selects items
├─ Update useBulkActions store
├─ Show toolbar at bottom
└─ Allow bulk operations

User saves view
├─ POST to /api/saved-views
├─ Update local state
└─ Show success notification
```

### Audit Log Flow
```
User opens history modal
├─ Fetch audit_logs from Supabase
├─ Group by timestamp
├─ Show changes for each action
└─ Display before/after values

User sees change
├─ Understand what changed
├─ See who made change
├─ See when change was made
└─ See previous values
```

---

## 🔌 API Route Integration Checklist

- [x] POST `/api/invoices` - Create with audit log
- [x] PUT `/api/invoices/[id]` - Update with audit log + rate limit
- [x] DELETE `/api/invoices/[id]` - Delete with audit log + rate limit
- [x] GET `/api/invoices` - List with filters + rate limit
- [x] POST `/api/bulk-actions` - Bulk operations with audit
- [x] GET `/api/saved-views` - Load saved views
- [x] POST `/api/saved-views` - Save view
- [x] GET `/api/audit-logs` - View change history
- [x] POST `/api/comments` - Add comments
- [x] GET `/api/comments` - Load comments
- [x] POST `/api/reminders` - Send reminders

---

## 🎯 Feature Integration Priority

### Phase 1 (Critical)
- [x] Bulk Actions - Used across all lists
- [x] Saved Views - Improves UX significantly
- [x] Audit Logging - Compliance & debugging
- [x] Notifications - Real-time feedback

### Phase 2 (High Value)
- [x] Collaboration - Team features
- [x] Reminders - Business value
- [x] Admin Panel - Operational needs

### Phase 3 (Polish)
- [x] Tours - Onboarding
- [x] PWA - Mobile support
- [x] Rate Limiting - Production ready

---

## 🛠️ Common Integration Tasks

### Add bulk actions to an existing table
```tsx
// 1. Import
import { useBulkActions } from '@/lib/hooks/useBulkActions';
import { BulkActionCheckbox, BulkActionsToolbar } from '@/components/BulkActionsToolbar';

// 2. Get hook
const { selectedIds, toggle, toggleAll } = useBulkActions();

// 3. Add checkbox column
<th><BulkActionSelectAll ... /></th>
<td><BulkActionCheckbox ... /></td>

// 4. Add toolbar
<BulkActionsToolbar items={items} onDelete={...} />
```

### Add saved views to a list page
```tsx
// 1. Load views
const [views, setViews] = useState([]);
useEffect(() => {
  getTeamViews(teamId, 'invoice').then(setViews);
}, []);

// 2. Add sidebar
<SavedViewsPanel views={views} onSelectView={...} />

// 3. Apply view
const handleSelectView = (view) => {
  setFilters(view.filters);
  applyFilters(view.filters);
};
```

### Add comments to detail page
```tsx
// 1. Import
import { CommentsPanel } from '@/components/CommentsPanel';

// 2. Add component
<CommentsPanel
  entityType="invoice"
  entityId={invoiceId}
  teamId={teamId}
  userId={userId}
/>
```

### Start tour on page load
```tsx
// 1. Import
import { useTour, TOUR_GUIDES } from '@/lib/hooks/useTour';

// 2. Initialize
useEffect(() => {
  const { startTour } = useTour();
  const hasSeenTour = localStorage.getItem(`tour_${page}`);
  if (!hasSeenTour) {
    startTour(TOUR_GUIDES[page.toUpperCase()]);
    localStorage.setItem(`tour_${page}`, 'true');
  }
}, []);
```

---

## 🚀 Deployment Checklist

- [ ] All environment variables set (.env.local)
- [ ] Database migrations run (audit_logs, saved_views, comments)
- [ ] API routes created for all features
- [ ] Components integrated into pages
- [ ] Keyboard shortcuts tested
- [ ] Tours configured
- [ ] Admin page accessible to admins only
- [ ] Rate limiting configured per endpoint
- [ ] Audit logging functional
- [ ] Notifications working
- [ ] PWA service worker registered
- [ ] Tests written and passing

---

## 📱 Mobile Considerations

- Bulk actions: Use sticky toolbar at bottom
- Saved views: Use dropdown/modal instead of sidebar
- Comments: Full-width on mobile
- Tours: Adjust positioning for mobile viewports
- PWA: Install prompt appears after 30 seconds

---

## ♿ Accessibility Checklist

- [ ] Keyboard navigation works everywhere
- [ ] ARIA labels on interactive elements
- [ ] Color not sole indicator of status
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] Error messages clear and helpful
- [ ] Form labels associated with inputs
- [ ] Modals properly trapped focus

---

**Status:** All frontend components created and ready for integration  
**Next Steps:** Integrate into existing pages, connect to real API, test end-to-end
