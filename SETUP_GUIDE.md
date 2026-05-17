# Complete 4-Step Setup Guide - Adhco WBHB666

This guide walks through the complete setup and deployment of all 35 features for the construction management SaaS platform.

## Overview

The setup consists of 4 sequential phases:

1. **Supabase Database Setup** - Create PostgreSQL schema with all tables
2. **API Credentials Configuration** - Add environment variables and external service keys
3. **Feature Integration** - Wire features into application workflow
4. **End-to-End Testing** - Verify all features work correctly

---

## Step 1: Supabase Database Setup ✅

### Objective
Create the PostgreSQL database schema with all 30+ tables, indexes, and Row Level Security policies.

### Required Files
- `migrations/001_create_all_tables.sql` - Complete SQL schema

### Instructions

1. **Create Supabase Project** (if you don't have one)
   - Go to https://supabase.com
   - Click "New project"
   - Choose your region (recommended: closest to your users)
   - Set a strong password for the postgres user

2. **Access SQL Editor**
   - Open your Supabase project dashboard
   - Go to **SQL Editor** (left sidebar)

3. **Execute Migration**
   - Open `migrations/001_create_all_tables.sql`
   - Copy entire contents
   - Paste into Supabase SQL Editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to **Table Editor** in Supabase
   - Verify you see 30+ tables:
     - Core: `users`, `teams`, `team_members`, `projects`, `clients`
     - Invoicing: `invoices`, `payments`
     - Tracking: `time_entries`, `expenses`, `budget_tracking`
     - Documents: `documents`, `project_photos`
     - Approvals: `project_approvals`, `change_orders`
     - Operations: `subcontractors`, `equipment`, `material_inventory`
     - Safety: `safety_logs`, `compliance_alerts`, `warranties`
     - Communications: `client_messages`, `client_requests`
     - Intelligence: `prediction_models`, `predictions`
     - Integrations: `integration_configs`, `sync_logs`

### Validation
- ✅ All tables created successfully
- ✅ Indexes present for performance
- ✅ Row Level Security policies in place
- ✅ Can view schema in SQL Editor

---

## Step 2: API Credentials Configuration ✅

### Objective
Add all required environment variables and external service API keys.

### Required Files
- `.env.example` - Template with all required keys
- `.env.local` - Your actual credentials (create from template)

### Services to Configure

#### 2.1 Supabase
1. Go to your Supabase project dashboard
2. Click **Settings** (bottom of left sidebar)
3. Click **API**
4. Copy your credentials:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** (optional, for server-side operations)

#### 2.2 Stripe (Payments)
1. Go to https://dashboard.stripe.com
2. Click **Developers** → **API Keys**
3. Copy credentials:
   - **Secret Key** → `STRIPE_SECRET_KEY`
   - **Publishable Key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

#### 2.3 Resend (Email)
1. Go to https://resend.com
2. Click **API Keys**
3. Create new API key
4. Copy → `RESEND_API_KEY`

#### 2.4 QuickBooks (Accounting Integration)
1. Go to https://developer.intuit.com
2. Create a new app
3. Get OAuth credentials:
   - **Client ID** → `QUICKBOOKS_CLIENT_ID`
   - **Client Secret** → `QUICKBOOKS_CLIENT_SECRET`
   - **Realm ID** (your company ID) → `QUICKBOOKS_REALM_ID`

#### 2.5 Google Calendar (Scheduling)
1. Go to https://console.cloud.google.com
2. Create new OAuth 2.0 credentials (Desktop application)
3. Copy credentials:
   - **Client ID** → `GOOGLE_CALENDAR_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CALENDAR_CLIENT_SECRET`

#### 2.6 Slack (Team Communications)
1. Go to https://api.slack.com/apps
2. Create new app
3. Go to **OAuth & Permissions**
4. Copy credentials:
   - **Bot Token** → `SLACK_BOT_TOKEN`
   - **Signing Secret** → `SLACK_SIGNING_SECRET`

#### 2.7 Twilio (SMS Notifications)
1. Go to https://console.twilio.com
2. Get your credentials:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`
   - **Phone Number** → `TWILIO_PHONE_NUMBER`

#### 2.8 Zapier (Workflow Automation)
1. Go to https://zapier.com/developer
2. Create API key
3. Copy → `ZAPIER_API_KEY`

### Setup Instructions

1. **Create `.env.local`**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in Credentials**
   - Open `.env.local`
   - Replace all `your_*_here` values with actual credentials
   - Keep the `NEXT_PUBLIC_*` prefix for browser-accessible keys
   - Never commit `.env.local` to git (it's in `.gitignore`)

3. **Verify Configuration**
   ```bash
   npm run dev
   ```
   - Check for any configuration warnings in terminal
   - App should start without auth errors

### Validation
- ✅ `.env.local` created and filled
- ✅ All required keys present
- ✅ Development server starts without errors
- ✅ Can access authenticated pages

---

## Step 3: Feature Integration ✅

### Objective
Wire all features into application workflows.

### Required Files
- `lib/hooks/useFeatures.ts` - React hooks for all features
- `lib/integration/featureWorkflows.ts` - Integration helpers
- Feature API routes in `app/api/features/`

### Core Integration Points

#### 3.1 Time Tracking Integration
```typescript
import { useTimeTracking } from '@/lib/hooks/useFeatures';

const { isTracking, startTracking, stopTracking } = useTimeTracking();

// In project view:
<button onClick={startTracking}>Start Timer</button>
```

**Where to integrate:**
- `app/dashboard/page.tsx` - Add timer widget
- `app/projects/[id]/page.tsx` - Add time entry form

#### 3.2 Expense Tracking Integration
```typescript
import { useExpenseTracking } from '@/lib/hooks/useFeatures';

const { expenses, addExpense } = useExpenseTracking();

// Track expenses for project
await addExpense(projectId, { amount, category, description });
```

**Where to integrate:**
- `app/projects/[id]/page.tsx` - Expense form
- `app/dashboard/advanced.tsx` - Expense summary

#### 3.3 Project Profitability Integration
```typescript
import { useProfitability } from '@/lib/hooks/useFeatures';

const { profitability, calculate } = useProfitability();

// On project load:
useEffect(() => {
  calculate(projectId);
}, [projectId, calculate]);
```

**Where to integrate:**
- `app/dashboard/page.tsx` - Profit metrics
- `app/projects/[id]/page.tsx` - Real-time profitability

#### 3.4 Client Communications Integration
```typescript
import { useClientCommunications } from '@/lib/hooks/useFeatures';

const { messages, sendMessage } = useClientCommunications();

// Send update to client
await sendMessage(projectId, 'Framing complete', 'update');
```

**Where to integrate:**
- `app/chat/page.tsx` - Messages with clients
- `app/projects/[id]/page.tsx` - Communication panel

#### 3.5 Document Management Integration
```typescript
import { useDocuments } from '@/lib/hooks/useFeatures';

const { documents, uploadDocument } = useDocuments();

// Upload blueprints, contracts, permits
await uploadDocument(projectId, file, 'blueprint');
```

**Where to integrate:**
- `app/materials/page.tsx` - Specs/documents
- `app/projects/[id]/page.tsx` - Document panel

#### 3.6 Photo Gallery Integration
```typescript
import { useProjectPhotos } from '@/lib/hooks/useFeatures';

const { photos, uploadPhoto, fetchPhotos } = useProjectPhotos();

// Upload before/after photos
await uploadPhoto(projectId, file, 'before');
```

**Where to integrate:**
- `app/dashboard/page.tsx` - Photo carousel
- `app/projects/[id]/page.tsx` - Photo gallery

#### 3.7 Safety Logs Integration
```typescript
import { useSafetyLogs } from '@/lib/hooks/useFeatures';

const { logIncident } = useSafetyLogs();

// Log safety incident
await logIncident(projectId, { logType: 'incident', severity: 'high' });
```

**Where to integrate:**
- New route: `app/safety/page.tsx`
- `app/dashboard/page.tsx` - Safety alerts

#### 3.8 Approval Workflows Integration
```typescript
import { useApprovals } from '@/lib/hooks/useFeatures';

const { createApproval, updateApprovalStatus } = useApprovals();

// Create approval for quote
const approval = await createApproval(projectId, 'quote', ['manager@example.com']);

// Approve/reject
await updateApprovalStatus(approvalId, managerId, true);
```

**Where to integrate:**
- `app/quotes/page.tsx` - Quote approval
- `app/dashboard/page.tsx` - Approval queue

### Configuration

Each integration requires:
1. **Import the hook** from `lib/hooks/useFeatures.ts`
2. **Add UI component** to display feature
3. **Connect to API** route in `app/api/features/`
4. **Test functionality** with test data

### Validation Checklist
- [ ] Time tracking appears in dashboard
- [ ] Expenses update project budget
- [ ] Profitability updates in real-time
- [ ] Photos upload and display
- [ ] Messages send to clients
- [ ] Safety logs persist
- [ ] Approvals route correctly
- [ ] Budgets trigger warnings at 80%+

---

## Step 4: End-to-End Testing ✅

### Objective
Verify all features work correctly in production-like environment.

### Required Files
- `tests/e2e.test.ts` - Comprehensive test suite
- `jest.config.js` - Jest configuration
- `tests/setup.ts` - Test setup

### Setup Test Environment

1. **Install Test Dependencies**
   ```bash
   npm install --save-dev jest ts-jest @types/jest @jest/globals
   ```

2. **Create Test Database** (recommended: separate from production)
   - Create new Supabase project for testing
   - Or use your dev project with test prefix tables

3. **Add Test Credentials to `.env.local`**
   ```
   TEST_AUTH_TOKEN=your_test_jwt_token
   TEST_USER_ID=test_user_uuid
   TEST_TEAM_ID=test_team_uuid
   ```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/e2e.test.ts

# Run with coverage report
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Test Scenarios Covered

#### Core Features
- ✅ User authentication (signup, signin, logout)
- ✅ Team creation and member invitation
- ✅ Project creation and initialization

#### Invoicing
- ✅ Invoice creation and draft status
- ✅ Invoice sending (status update to "sent")
- ✅ PDF generation

#### Time Tracking
- ✅ Time entry creation
- ✅ Billable hours calculation
- ✅ Budget impact on project

#### Expenses
- ✅ Expense logging by category
- ✅ Budget updates
- ✅ Cost tracking aggregation

#### Profitability
- ✅ Profitability calculation
- ✅ Cost breakdown by category
- ✅ Margin analysis

#### Approvals
- ✅ Approval workflow creation
- ✅ Entity approval and rejection
- ✅ Multi-stage approval chains

#### Safety
- ✅ Incident logging
- ✅ Compliance alerts
- ✅ Alert retrieval

#### Integration
- ✅ Invoice to payment tracking
- ✅ Revenue recognition
- ✅ Cross-feature data consistency

### Validation Results

After running all tests, verify:
- [ ] All tests pass (0 failures)
- [ ] Coverage > 70% for critical paths
- [ ] Performance tests < 2 seconds for dashboard loads
- [ ] Search performance < 500ms
- [ ] No console errors or warnings

---

## Production Deployment Checklist

After completing all 4 steps:

- [ ] **Step 1**: Supabase schema created and verified
- [ ] **Step 2**: All credentials in `.env.local`
- [ ] **Step 3**: Features integrated into UI
- [ ] **Step 4**: All tests passing

### Deploy to Vercel

```bash
# Commit all changes
git add .
git commit -m "Complete 4-step feature integration"

# Push to main branch
git push origin main

# Vercel automatically deploys on push
# Check deployment status at https://vercel.com/dashboard
```

### Post-Deployment Verification

1. **Check Production Environment**
   - Visit https://adhco-wbhb-666-dun.vercel.app
   - Test authentication
   - Create test project
   - Log time entry
   - Create invoice

2. **Monitor Error Logs**
   - Vercel Logs: https://vercel.com/dashboard
   - Sentry (if configured): https://sentry.io
   - Check browser console for errors

3. **Performance Monitoring**
   - Dashboard load time < 2s
   - Invoice creation < 500ms
   - Search < 500ms

---

## Next Steps After Setup

### Recommended Priorities
1. **Connect more integrations** (QB Online, Stripe Connect)
2. **Create mobile app** (React Native with Expo)
3. **Build analytics dashboard** (advanced KPIs)
4. **Implement automation** (Zapier workflows)
5. **Add team training** (user onboarding flow)

### Additional Resources
- Supabase Docs: https://supabase.com/docs
- Stripe API: https://stripe.com/docs/api
- Next.js: https://nextjs.org/docs
- React: https://react.dev

---

## Troubleshooting

### Database Connection Issues
**Problem**: "Cannot connect to Supabase"
**Solution**:
1. Verify URL and key in `.env.local`
2. Check Supabase project is active
3. Restart dev server

### Test Failures
**Problem**: "Tests failing in CI/CD"
**Solution**:
1. Verify test credentials in CI/CD environment
2. Create separate test database
3. Check database is seeded with test data

### Performance Issues
**Problem**: "Dashboard loading slowly"
**Solution**:
1. Check database indexes created
2. Verify Row Level Security policies optimized
3. Add caching layer (Redis)
4. Optimize queries with explains

---

## Support & Questions

- Documentation: See `UNIVERSAL_ONBOARDING.md`
- Implementation Details: See `IMPLEMENTATION_LOG.md`
- Code Examples: See `lib/hooks/useFeatures.ts`
- API Routes: See `app/api/features/`
