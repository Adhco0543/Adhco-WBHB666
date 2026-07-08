# 🗂️ New Files Architecture Guide

Complete reference for all new files created as part of the 15 enhancement features implementation.

---

## 📁 File Structure

```
lib/
├── hooks/
│   ├── useBulkActions.ts         ← Bulk selection & batch operations
│   ├── useTour.ts                ← Interactive onboarding tours
│   ├── useKeyboardNavigation.ts   ← Keyboard shortcuts & navigation
│   ├── useNotifications.ts        ← Real-time notification system (existing)
│   └── usePreferences.ts          ← Dashboard personalization (existing)
├── auditLogging.ts               ← Audit trail & compliance logging
├── savedViews.ts                 ← Custom filter & view management
├── collaboration.ts              ← Comments, mentions, activity
├── reminders.ts                  ← Email (Resend) & SMS (Twilio) reminders
├── rateLimiting.ts               ← API rate limiting middleware
├── adminPanel.ts                 ← Admin user & team management
├── pwa.ts                        ← Progressive Web App utilities
├── pdfExport.ts                  ← PDF generation (existing)
└── assistantTypes.ts             ← Type definitions (existing)

components/
├── ErrorBoundary.tsx             ← Error catching (existing)
├── LoadingStates.tsx             ← Skeleton loaders (existing)
├── NotificationContainer.tsx      ← Toast UI (existing)
└── [other components]

migrations/
└── 001_create_all_tables.sql     ← Database schema (UPDATED)
    ├── audit_logs table
    ├── saved_views table
    ├── comments table
    ├── mentions table
    └── activity_logs table
```

---

## 🔧 Detailed File Reference

### **1. lib/hooks/useBulkActions.ts**
**Purpose:** Multi-item selection and batch operations  
**Exports:**
- `useBulkActionStore` - Zustand store
- `useBulkActions()` - Hook
- `bulkDeleteItems(ids, endpoint)` - Delete multiple
- `bulkUpdateItems(ids, updates, endpoint)` - Update multiple
- `bulkExportToCSV(items, filename)` - Export to CSV
- `bulkImportFromCSV(file, onData, onError)` - Import CSV
- `useBulkOperations(items, onUpdate)` - Full operation hook

**State:**
```typescript
selectedIds: Set<string>
isSelectAll: boolean
actions: { toggle, toggleAll, clear, isSelected }
```

**Usage:**
```typescript
import { useBulkActions } from '@/lib/hooks/useBulkActions';

const { selectedIds, count, toggle } = useBulkActions();
```

---

### **2. lib/hooks/useTour.ts**
**Purpose:** Interactive guided tours for onboarding  
**Exports:**
- `useTourStore` - Zustand store
- `TourOverlay` - React component
- `useTour()` - Hook
- `TOUR_GUIDES` - Pre-built guides

**Pre-built Tours:**
- `TOUR_GUIDES.ONBOARDING` - 8-step welcome
- `TOUR_GUIDES.INVOICE_WORKFLOW` - 5-step invoice
- `TOUR_GUIDES.PROJECT_WORKFLOW` - 4-step project

**Data Structure:**
```typescript
interface TourStep {
  id: string
  title: string
  description: string
  target: string // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: { label, onClick }
  skip?: boolean
}
```

**Usage:**
```typescript
import { useTour, TOUR_GUIDES } from '@/lib/hooks/useTour';

const { startTour } = useTour();
startTour(TOUR_GUIDES.ONBOARDING);
```

---

### **3. lib/hooks/useKeyboardNavigation.ts**
**Purpose:** Keyboard shortcuts and navigation  
**Exports:**
- `useKeyboardShortcut(key, callback)` - Single
- `useKeyboardShortcuts(shortcuts)` - Multiple
- `useArrowKeyNavigation(items)` - Navigate lists
- `useEnterEscapeKeys(onEnter, onEscape)` - Submit/cancel
- `useModifierKeys()` - Track Ctrl/Shift/Alt
- `APP_SHORTCUTS` - Constant of 8 shortcuts
- `formatShortcut(key)` - Display format

**App Shortcuts:**
- `Ctrl+K` - Search
- `Ctrl+I` - Invoice
- `Ctrl+P` - Project
- `Ctrl+E` - Expense
- `Ctrl+T` - Time entry
- `Ctrl+S` - Save
- `Escape` - Close
- `?` - Help

**Usage:**
```typescript
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardNavigation';

useKeyboardShortcut('ctrl+k', () => openSearch());
```

---

### **4. lib/auditLogging.ts**
**Purpose:** Track all data changes for compliance  
**Exports:**
- `logAuditEvent(log)` - Record action
- `getEntityAuditLogs(type, id, teamId)` - View history
- `getUserAuditLogs(userId, teamId)` - User actions
- `getTeamAuditLogs(teamId)` - Team audit
- `trackChanges(old, new)` - Diff detection
- `createAuditLog(...)` - Helper
- `AUDIT_ACTIONS` - Action types constant
- `AUDITABLE_ENTITIES` - Entity types constant

**Database Table:**
```sql
audit_logs (
  id UUID
  team_id UUID
  user_id UUID
  action TEXT
  entity_type TEXT
  entity_id TEXT
  changes JSONB
  ip_address TEXT
  user_agent TEXT
  timestamp TIMESTAMP
)
```

**Usage:**
```typescript
import { createAuditLog } from '@/lib/auditLogging';

await createAuditLog(
  'team-1', 'user-1', 'UPDATE', 'invoice', 'inv-123', changes
);
```

---

### **5. lib/savedViews.ts**
**Purpose:** Save and manage custom filter views  
**Exports:**
- `saveView(view)` - Create view
- `updateView(id, updates)` - Modify
- `deleteView(id)` - Remove
- `getTeamViews(teamId)` - List all
- `buildFilterQuery(filters)` - Convert to query
- `duplicateView(id, name)` - Clone
- `setDefaultView(teamId, type, id)` - Set default
- `SAVED_VIEW_TEMPLATES` - Pre-built templates

**Database Table:**
```sql
saved_views (
  id UUID
  team_id UUID
  user_id UUID
  name TEXT
  description TEXT
  entity_type TEXT
  filters JSONB
  sort JSONB
  columns TEXT[]
  is_default BOOLEAN
  created_at TIMESTAMP
  updated_at TIMESTAMP
)
```

**Filter Types:**
```typescript
type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'startsWith'
```

**Usage:**
```typescript
import { saveView, getTeamViews } from '@/lib/savedViews';

const views = await getTeamViews('team-1', 'invoice');
```

---

### **6. lib/collaboration.ts**
**Purpose:** Team comments, mentions, and activity  
**Exports:**
- `addComment(comment)` - Add with mentions
- `getEntityComments(type, id, teamId)` - View
- `deleteComment(id)` - Remove
- `getUserMentions(userId, teamId)` - Notifications
- `readMention(id)` - Mark read
- `logActivity(activity)` - Record action
- `getTeamActivityFeed(teamId)` - Team feed
- `getEntityActivityFeed(type, id, teamId)` - Entity feed
- `ACTIVITY_TYPES` - Action constants
- `formatActivityMessage(activity)` - Display

**Database Tables:**
```sql
comments (id, team_id, user_id, entity_type, entity_id, content, mentions[], created_at)
mentions (id, team_id, mentioned_user_id, user_id, entity_type, entity_id, is_read)
activity_logs (id, team_id, user_id, action, entity_type, entity_id, entity_title, description, metadata, created_at)
```

**Usage:**
```typescript
import { addComment, getTeamActivityFeed } from '@/lib/collaboration';

await addComment({
  team_id: 'team-1',
  user_id: 'user-1',
  entity_type: 'invoice',
  entity_id: 'inv-123',
  content: 'Great work!',
  mentions: ['user-2', 'user-3']
});
```

---

### **7. lib/reminders.ts**
**Purpose:** Send email and SMS reminders  
**Exports:**
- `sendEmailReminder(email, subject, message)` - Resend
- `sendSMSReminder(phone, message)` - Twilio
- `scheduleInvoiceReminders(id, dueDate)` - Schedule
- `formatPhoneNumber(phone)` - Normalize
- `isValidEmail(email)` - Validate email
- `isValidPhoneNumber(phone)` - Validate phone
- `REMINDER_TEMPLATES` - Pre-built templates

**Reminder Templates:**
- INVOICE_OVERDUE
- INVOICE_DUE_SOON
- BUDGET_WARNING
- PAYMENT_RECEIVED
- TASK_ASSIGNED
- TEAM_INVITATION
- DAILY_DIGEST
- SAFETY_ALERT

**Environment Variables:**
```env
RESEND_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

**Usage:**
```typescript
import { sendEmailReminder, REMINDER_TEMPLATES } from '@/lib/reminders';

const template = REMINDER_TEMPLATES.INVOICE_OVERDUE.email({
  invoiceNumber: 'INV-001',
  amount: 5000,
  dueDate: '2025-01-15'
});

await sendEmailReminder('client@example.com', template.subject, template.message);
```

---

### **8. lib/rateLimiting.ts**
**Purpose:** API rate limiting middleware  
**Exports:**
- `createRateLimiter(config)` - Middleware factory
- `checkRateLimit(req, config)` - Validate
- `getRateLimitRemaining(req, config)` - Check quota
- `resetRateLimit(identifier)` - Admin reset
- `cleanupExpiredLimits()` - Cleanup
- `RATE_LIMITS` - Pre-configured limits

**Pre-configured Limits:**
```typescript
RATE_LIMITS.API_GENERAL: 100/min
RATE_LIMITS.AUTH_LOGIN: 5/15min
RATE_LIMITS.AUTH_SIGNUP: 3/hour
RATE_LIMITS.INVOICE_CREATE: 30/min
RATE_LIMITS.PAYMENT_PROCESS: 10/min
RATE_LIMITS.FILE_UPLOAD: 20/min
RATE_LIMITS.SEARCH: 30/min
RATE_LIMITS.EXPORT: 10/min
RATE_LIMITS.EMAIL_SEND: 5/hour
```

**Response Headers:**
```
X-RateLimit-Limit: number
X-RateLimit-Remaining: number
X-RateLimit-Reset: ISO timestamp
Retry-After: seconds
```

**Usage:**
```typescript
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimiting';

// In API route
const error = await checkRateLimit(req, RATE_LIMITS.API_GENERAL);
if (error) return error;
```

---

### **9. lib/adminPanel.ts**
**Purpose:** Admin user and team management  
**Exports:**
- `getAllUsers(teamId)` - List users
- `getAllTeams()` - List teams
- `updateUserRole(userId, teamId, role)` - Change role
- `suspendUser(userId)` - Disable account
- `reactivateUser(userId)` - Re-enable
- `deleteUser(userId)` - Remove user
- `updateTeamSubscription(teamId, tier)` - Manage plan
- `getAdminMetrics()` - Dashboard stats
- `getTeamUsageStats(teamId)` - Analytics
- `hasAdminPermission(role, permission)` - Check
- `ADMIN_ROLES` - Role definitions
- `updateSystemSettings(settings)` - Global config

**Admin Roles:**
- Super Admin: All permissions
- Admin: Teams, users, subscriptions, analytics
- Manager: Team members, team analytics, projects
- User: Own data only

**Metrics:**
```typescript
interface AdminMetrics {
  totalUsers: number
  activeUsers: number
  totalTeams: number
  invoicesThisMonth: number
  revenueThisMonth: number
  systemHealth: { dbConnections, apiLatency, uptime }
}
```

**Usage:**
```typescript
import { getAdminMetrics, updateUserRole } from '@/lib/adminPanel';

const metrics = await getAdminMetrics();
await updateUserRole('user-1', 'team-1', 'manager');
```

---

### **10. lib/pwa.ts**
**Purpose:** Progressive Web App (offline, installable)  
**Exports:**
- `registerServiceWorker()` - Enable PWA
- `unregisterServiceWorker()` - Disable
- `storeOfflineData(key, data)` - Save offline
- `getOfflineData(key)` - Retrieve
- `syncOfflineChanges()` - Sync when online
- `setupConnectivityListener(onOnline, onOffline)` - Events
- `isOnline()` - Check status
- `isPWAInstallable()` - Can install
- `isRunningAsPWA()` - Detect mode
- `requestPWAInstall()` - Prompt install
- `getStorageInfo()` - Quota info
- `requestPersistentStorage()` - Request quota
- `DEFAULT_PWA_CONFIG` - Manifest config

**PWA Features:**
- Standalone display mode
- Offline-first support
- Home screen shortcuts
- Persistent storage
- Background sync

**Storage:**
- IndexedDB for large data
- LocalStorage fallback
- Configurable quota

**Usage:**
```typescript
import { registerServiceWorker, isOnline } from '@/lib/pwa';

// Register on app init
await registerServiceWorker();

// Store data
await storeOfflineData('invoices', data);

// Listen to connectivity
setupConnectivityListener(
  () => console.log('Back online!'),
  () => console.log('Gone offline')
);
```

---

## 📊 Integration Matrix

| Feature | Backend | Database | Frontend | API Routes |
|---------|---------|----------|----------|-----------|
| Bulk Actions | ✅ useBulkActions.ts | - | Pending | Pending |
| Saved Views | ✅ savedViews.ts | ✅ saved_views | Pending | Pending |
| Audit Log | ✅ auditLogging.ts | ✅ audit_logs | - | ✅ Ready |
| Collaboration | ✅ collaboration.ts | ✅ comments/mentions | Pending | Pending |
| Reminders | ✅ reminders.ts | - | Pending | Pending |
| Rate Limit | ✅ rateLimiting.ts | - | - | ✅ Ready |
| Admin Panel | ✅ adminPanel.ts | - | Pending | Pending |
| PWA | ✅ pwa.ts | - | Pending | ✅ Ready |
| Tours | ✅ useTour.ts | - | ✅ Component | - |
| Keyboard | ✅ useKeyboardNavigation.ts | - | ✅ Hooks | - |

---

## 🔗 Import Examples

```typescript
// Bulk Actions
import { useBulkActions } from '@/lib/hooks/useBulkActions';

// Saved Views
import { saveView, getTeamViews } from '@/lib/savedViews';

// Audit Logging
import { createAuditLog } from '@/lib/auditLogging';

// Collaboration
import { addComment, getTeamActivityFeed } from '@/lib/collaboration';

// Reminders
import { sendEmailReminder, REMINDER_TEMPLATES } from '@/lib/reminders';

// Rate Limiting
import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimiting';

// Admin Panel
import { getAdminMetrics, getAllUsers } from '@/lib/adminPanel';

// PWA
import { registerServiceWorker, isOnline } from '@/lib/pwa';

// Tours
import { useTour, TOUR_GUIDES } from '@/lib/hooks/useTour';

// Keyboard
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardNavigation';
```

---

## 🗄️ Database Migrations

The migration file has been updated with:

```sql
-- New tables
CREATE TABLE audit_logs (...)
CREATE TABLE saved_views (...)
CREATE TABLE comments (...)
CREATE TABLE mentions (...)
CREATE TABLE activity_logs (...)

-- All with proper indexes:
CREATE INDEX idx_audit_logs_team ...
CREATE INDEX idx_saved_views_team ...
CREATE INDEX idx_comments_entity ...
CREATE INDEX idx_mentions_user ...
CREATE INDEX idx_activity_logs_team ...
```

Run migrations:
```bash
npx supabase migration up
```

---

## 🚀 Next Steps

1. **Create UI Components** - React components using these utilities
2. **API Routes** - Next.js route handlers that use these functions
3. **Integrate with Pages** - Add to existing dashboard, invoice, project pages
4. **Environment Setup** - Add RESEND_API_KEY and TWILIO credentials
5. **Testing** - Write unit and integration tests
6. **Deployment** - Deploy with new environment variables

---

**Created:** 2025  
**Version:** 1.0  
**Status:** Ready for frontend integration
