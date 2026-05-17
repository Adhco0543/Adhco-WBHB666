# 🎨 Modern Design System Guide

Complete guide to all new modern design components and features added to your app.

---

## ✨ New Components Created

### 1. **HeroSection** 
Beautiful gradient header sections with overlays

```tsx
import { HeroSection } from '@/components/HeroSection';

<HeroSection
  title="Welcome Back!"
  description="Your business overview"
  backgroundImage="https://..."
  height="md"
  overlay
/>
```

**Props:**
- `title` (string) - Main heading
- `description` (string, optional) - Subtitle
- `backgroundImage` (string, optional) - Background image URL
- `height` ('sm' | 'md' | 'lg' | 'full') - Section height
- `overlay` (boolean) - Dark overlay for text readability
- `children` (ReactNode, optional) - Custom content

---

### 2. **GlassCard**
Glass-morphism effect cards with frosted glass appearance

```tsx
import { GlassCard } from '@/components/GlassCard';

<GlassCard hover className="p-6">
  <p className="text-white">Frosted glass content</p>
</GlassCard>
```

**Props:**
- `children` (ReactNode) - Card content
- `className` (string, optional) - Additional Tailwind classes
- `hover` (boolean) - Enable hover effects

---

### 3. **EmptyState**
Beautiful empty state displays with icons

```tsx
import { EmptyState } from '@/components/EmptyState';

<EmptyState
  type="invoices"
  title="No invoices yet"
  description="Create your first invoice"
  action={{
    label: 'Create Invoice',
    onClick: () => navigate('/invoices/create')
  }}
/>
```

**Types:** 'invoices', 'projects', 'messages', 'team', 'default'

---

### 4. **Breadcrumb**
Navigation breadcrumbs

```tsx
import { Breadcrumb } from '@/components/Breadcrumb';

<Breadcrumb
  items={[
    { label: 'Dashboard', href: '/' },
    { label: 'Invoices', href: '/invoices' },
    { label: 'INV-001' }
  ]}
/>
```

---

### 5. **FloatingActionButton**
Fixed floating action buttons

```tsx
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { Plus } from 'lucide-react';

<FloatingActionButton
  icon={<Plus size={24} />}
  label="Create"
  onClick={handleCreate}
  position="bottom-right"
  color="blue"
  size="lg"
/>
```

**Props:**
- `position` ('bottom-right' | 'bottom-left' | 'top-right' | 'top-left')
- `color` ('blue' | 'green' | 'purple' | 'red')
- `size` ('sm' | 'md' | 'lg')

---

### 6. **ThemeToggle**
Dark mode toggle button

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';
import { useDarkMode } from '@/lib/hooks/useDarkMode';

<ThemeToggle />

// In your code:
const { isDark, toggle } = useDarkMode();
```

---

### 7. **Skeleton**
Loading skeleton screens

```tsx
import { Skeleton, SkeletonCard, SkeletonList } from '@/components/Skeleton';

// Single skeleton
<Skeleton width="100%" height="1rem" />

// Card skeleton
<SkeletonCard />

// List of skeletons
<SkeletonList count={5} />
```

---

### 8. **PatternBackground**
Background patterns and gradients

```tsx
import { PatternBackground } from '@/components/PatternBackground';

<PatternBackground pattern="dots">
  <div>Your content</div>
</PatternBackground>
```

**Patterns:** 'dots', 'grid', 'gradient', 'waves', 'none'

---

### 9. **Badge** ⭐ NEW
Status badges and labels

```tsx
import { Badge, StatusBadge } from '@/components/Badge';
import { CheckCircle } from 'lucide-react';

// Basic badge
<Badge label="Active" variant="success" />

// Status badge for invoices
<StatusBadge status="completed" />

// With icon
<Badge
  label="Approved"
  variant="success"
  icon={<CheckCircle size={16} />}
/>
```

**Variants:** 'success', 'warning', 'danger', 'info', 'neutral'  
**Sizes:** 'sm', 'md', 'lg'  
**Status Types:** 'active', 'inactive', 'pending', 'completed', 'overdue', 'draft'

---

### 10. **Progress** ⭐ NEW
Progress bars and indicators

```tsx
import { Progress, CircularProgress, StepsProgress } from '@/components/Progress';

// Linear progress bar
<Progress value={65} label="Invoice Payment" showPercent />

// Circular progress
<CircularProgress value={45} color="blue" />

// Steps progress
<StepsProgress
  steps={[
    { label: 'Quotation', status: 'completed' },
    { label: 'Accepted', status: 'current' },
    { label: 'In Progress', status: 'upcoming' },
  ]}
/>
```

**Colors:** 'blue', 'green', 'orange', 'red', 'purple'  
**Sizes:** 'sm', 'md', 'lg'

---

### 11. **Tabs** ⭐ NEW
Tab navigation components

```tsx
import { Tabs, VerticalTabs } from '@/components/Tabs';

// Horizontal tabs
<Tabs
  tabs={[
    { id: 'tab1', label: 'Overview', content: <OverviewTab /> },
    { id: 'tab2', label: 'Details', content: <DetailsTab /> },
  ]}
/>

// Vertical tabs
<VerticalTabs
  tabs={[
    { id: 'profile', label: 'Profile', content: <ProfileTab /> },
    { id: 'settings', label: 'Settings', content: <SettingsTab /> },
  ]}
/>
```

**Variants:** 'default', 'pills', 'underline'

---

### 12. **Modal** ⭐ NEW
Modals, dialogs, and sheets

```tsx
import { Modal, ConfirmDialog, AlertDialog, Sheet } from '@/components/Modal';

// Basic modal
<Modal isOpen={isOpen} onClose={onClose} title="Edit">
  <form>...</form>
</Modal>

// Confirmation dialog
<ConfirmDialog
  isOpen={isOpen}
  title="Delete Invoice?"
  message="This action cannot be undone"
  onConfirm={handleDelete}
  onCancel={handleCancel}
  variant="danger"
/>

// Alert dialog
<AlertDialog
  isOpen={isOpen}
  title="Success"
  message="Invoice created successfully"
  variant="success"
/>

// Slide-out sheet
<Sheet isOpen={isOpen} onClose={onClose} title="Filters" position="right">
  <FilterPanel />
</Sheet>
```

**Modal Sizes:** 'sm', 'md', 'lg', 'xl', 'full'

---

### 13. **Card** ⭐ NEW
Flexible card components for layouts

```tsx
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  StatCard,
  ImageCard,
} from '@/components/Card';
import { TrendingUp } from 'lucide-react';

// Composite card
<Card>
  <CardHeader title="Invoice Summary" subtitle="Q4 2024" />
  <CardBody>Invoice details here</CardBody>
  <CardFooter>
    <button>Action</button>
  </CardFooter>
</Card>

// Stat card
<StatCard
  label="Revenue"
  value="$45.2K"
  icon={<TrendingUp size={24} />}
  color="green"
  trend={{ value: 12.5, direction: 'up' }}
/>

// Image card
<ImageCard
  image="/project.jpg"
  title="Project Name"
  description="Project description"
  onClick={() => navigate('/projects/1')}
/>
```

**Card Variants:** 'default', 'elevated', 'outlined', 'filled'

---

## 🎬 Animations

### Built-in Animation Classes

Use these classes directly in your components:

```tsx
// Fade animations
<div className="animate-fade-in">Content</div>
<div className="animate-fade-out">Content</div>

// Slide animations
<div className="animate-slide-in-up">Content</div>
<div className="animate-slide-in-down">Content</div>
<div className="animate-slide-in-left">Content</div>
<div className="animate-slide-in-right">Content</div>

// Scale animations
<div className="animate-scale-in">Content</div>
<div className="animate-scale-out">Content</div>

// Bounce animation
<div className="animate-bounce-in">Content</div>
```

### Animation Utilities

```tsx
import { 
  fadeInOnScroll, 
  slideInOnScroll,
  animationClasses 
} from '@/lib/animations';

// Use in component
useEffect(() => {
  fadeInOnScroll();
  slideInOnScroll();
}, []);

// Add animations programmatically
<div data-fade-in>Fades in on scroll</div>
<div data-slide-in="up">Slides up on scroll</div>
```

---

## 🌙 Dark Mode

### Using Dark Mode

Dark mode is automatically detected from system preferences and stored in localStorage.

```tsx
import { useDarkMode } from '@/lib/hooks/useDarkMode';

function MyComponent() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="bg-white dark:bg-gray-900">
      <button onClick={toggle}>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
}
```

### Tailwind Dark Mode Classes

```tsx
// Automatically applies in dark mode
<div className="text-black dark:text-white">Text</div>
<div className="bg-white dark:bg-gray-900">Background</div>
<div className="border-gray-200 dark:border-gray-700">Border</div>
```

---

## 🎨 Color Scheme

### Tailwind Classes

```tsx
// Use standard Tailwind color utilities
className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-900"
className="text-gray-900 dark:text-white"
className="border-gray-200 dark:border-gray-700"
```

### Available Colors

- Blue (primary): `blue-600`, `blue-700`, `blue-900`
- Gray (neutral): `gray-200`, `gray-600`, `gray-900`
- Green (success): `green-600`, `green-700`
- Red (danger): `red-600`, `red-700`
- Yellow (warning): `yellow-600`, `yellow-700`
- Purple (accent): `purple-600`, `purple-700`

---

## 📖 Integration Examples

### Example 1: Dashboard with All Features

```tsx
import { HeroSection } from '@/components/HeroSection';
import { GlassCard } from '@/components/GlassCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with theme toggle */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="flex justify-between items-center p-6">
          <Breadcrumb items={[{ label: 'Dashboard' }]} />
          <ThemeToggle />
        </div>
      </header>

      {/* Hero section */}
      <HeroSection
        title="Welcome!"
        description="Your business dashboard"
        height="md"
      />

      {/* Content with glass cards */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <p className="text-white">$45.2K Revenue</p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-white">5 Invoices</p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-white">24 Clients</p>
          </GlassCard>
        </div>
      </div>

      {/* FAB */}
      <FloatingActionButton
        icon={<Plus size={24} />}
        onClick={() => alert('Create new')}
      />
    </div>
  );
}
```

### Example 2: Page with Empty State

```tsx
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { SkeletonList } from '@/components/Skeleton';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <SkeletonList count={5} />;
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        type="invoices"
        title="No invoices yet"
        description="Create your first invoice to get started"
        action={{
          label: 'Create Invoice',
          onClick: () => navigate('/create')
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map(invoice => (
        <GlassCard key={invoice.id} className="p-4">
          <p>{invoice.number}</p>
          <p className="text-sm text-gray-400">{invoice.amount}</p>
        </GlassCard>
      ))}
    </div>
  );
}
```

---

## 🎯 Pages Using Modern Design

### Demo Pages

Visit these pages to see all modern features in action:

- `/dashboard/modern` - Full modern dashboard with all components
- Check individual component examples in docs above

---

## 📱 Responsive Design

All components are fully responsive:

```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <GlassCard>...</GlassCard>
  {/* More cards */}
</div>

// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>

// Responsive padding
<div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
  Content
</div>
```

---

## ♿ Accessibility

All components include:
- Proper semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- High contrast for dark mode
- Focus management
- Color not sole indicator of status

---

## 🚀 Performance Tips

1. **Use Skeleton loading** instead of spinners
2. **Lazy load images** in HeroSection
3. **Debounce animations** on scroll
4. **Use CSS animations** over JavaScript
5. **Code-split heavy components** 

---

## 🎨 Customization

### Add Custom Gradient Background

```tsx
<HeroSection
  title="Title"
  backgroundImage="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
/>
```

### Custom Glass Card

```tsx
<GlassCard className="p-8 bg-gradient-to-br from-blue-400/10 to-purple-400/10">
  Custom glass effect
</GlassCard>
```

---

## 📊 Status

✅ All modern components implemented (13 total)  
✅ Dark mode fully functional  
✅ Animations ready to use  
✅ Responsive design  
✅ Accessibility compliant  
✅ Badge component (status indicators)  
✅ Progress indicators (linear, circular, steps)  
✅ Tabs component (horizontal & vertical)  
✅ Modal & Dialog system (modal, confirm, alert, sheet)  
✅ Card system (flexible card layouts)  

---

**Next Steps:**
1. Integrate components into existing pages
2. Customize colors/spacing for your brand
3. Add background images to hero sections
4. Test dark mode across all pages
5. Gather user feedback

**Questions?** Check individual component files for more details!
