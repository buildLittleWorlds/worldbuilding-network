# World-Kernel Platform - MVP Specification

## Overview

A web platform for creative writing students to share, fork, and build upon "world-kernels" - minimal viable world-building elements (characters, places, concepts, magic systems, etc.). The platform enables collaborative world-building through a fork/branch model similar to GitHub, where users can create derivative works while maintaining clear attribution trails.

**Core Value Proposition:** Transform world-building from isolated creation into collaborative conversation by making it frictionless to share ideas and build on each other's work.

**Target Users:** Creative writing students and club members who value human collaboration and want infrastructure for building shared fictional universes.

---

## Technical Stack

- **Frontend/Backend:** Next.js 14+ (App Router)
- **UI Framework:** React with TypeScript
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui
- **Database/Auth:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Version Control:** Git/GitHub

---

## Database Schema

### Users Table
*Managed by Supabase Auth with extended profile*

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Kernels Table

```sql
CREATE TABLE kernels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES kernels(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  license TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT title_length CHECK (char_length(title) <= 200),
  CONSTRAINT description_length CHECK (char_length(description) <= 5000)
);

CREATE INDEX idx_kernels_author ON kernels(author_id);
CREATE INDEX idx_kernels_parent ON kernels(parent_id);
CREATE INDEX idx_kernels_created ON kernels(created_at DESC);
CREATE INDEX idx_kernels_tags ON kernels USING GIN(tags);
```

### Row Level Security Policies

```sql
-- Enable RLS
ALTER TABLE kernels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read kernels
CREATE POLICY "Kernels are viewable by everyone" 
  ON kernels FOR SELECT 
  USING (true);

-- Users can insert their own kernels
CREATE POLICY "Users can create kernels" 
  ON kernels FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own kernels
CREATE POLICY "Users can update own kernels" 
  ON kernels FOR UPDATE 
  USING (auth.uid() = author_id);

-- Users can delete their own kernels
CREATE POLICY "Users can delete own kernels" 
  ON kernels FOR DELETE 
  USING (auth.uid() = author_id);

-- Profile policies (similar pattern)
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

---

## Application Structure

### File Structure

```
world-kernel-platform/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with nav
│   │   ├── page.tsx                   # Home feed
│   │   ├── kernel/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Single kernel view
│   │   │   │   └── fork/
│   │   │   │       └── page.tsx      # Fork kernel form
│   │   │   └── new/
│   │   │       └── page.tsx          # Create new kernel
│   │   ├── profile/
│   │   │   └── [username]/
│   │   │       └── page.tsx          # User profile & kernels
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   │   └── signup/
│   │   │       └── page.tsx          # Signup page
│   │   └── api/
│   │       └── (API routes if needed beyond Supabase)
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   ├── KernelCard.tsx            # Kernel display card
│   │   ├── KernelForm.tsx            # Create/edit kernel form
│   │   ├── KernelTree.tsx            # Show fork ancestry
│   │   ├── Navigation.tsx            # Main nav component
│   │   └── UserAvatar.tsx            # User avatar component
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   └── server.ts             # Server Supabase client
│   │   └── utils.ts                  # Helper functions
│   └── types/
│       └── database.types.ts          # Generated from Supabase
├── public/
├── .env.local                         # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Page Specifications

### 1. Home Page (`/`)

**Purpose:** Display recent kernels in reverse chronological order

**Components:**
- Navigation header (logo, search bar, "New Kernel" button, user menu)
- Filter/sort controls (All, Following, Tags, Most Forked, Recent)
- Grid of KernelCard components
- Pagination (load more)

**Data Loading:**
```typescript
// Fetch 20 most recent kernels with author info
const { data: kernels } = await supabase
  .from('kernels')
  .select(`
    *,
    author:profiles(username, display_name),
    fork_count:kernels(count)
  `)
  .order('created_at', { ascending: false })
  .limit(20);
```

**UI Elements:**
- Each kernel card shows: title, excerpt (first 150 chars), author, tags, fork count, created date
- Click card to go to kernel detail page
- Hover shows fork button

---

### 2. Kernel Detail Page (`/kernel/[id]`)

**Purpose:** Display full kernel with ancestry and derivatives

**Components:**
- Full kernel display (title, complete description, metadata)
- Author info with link to profile
- Tags (clickable to filter)
- License badge
- Action buttons: Fork, Edit (if owner)
- Ancestry section: "Forked from: [parent kernel]" (if applicable)
- Derivatives section: "Forked by: [list of child kernels]" (if any)

**Data Loading:**
```typescript
// Fetch kernel with parent and children
const { data: kernel } = await supabase
  .from('kernels')
  .select(`
    *,
    author:profiles(username, display_name),
    parent:parent_id(id, title, author:profiles(username)),
    children:kernels(id, title, author:profiles(username))
  `)
  .eq('id', kernelId)
  .single();
```

**UI Elements:**
- Markdown rendering for description
- Attribution trail breadcrumb: "Origin → Parent → This Kernel"
- Visual tree diagram if >2 levels of ancestry (simple SVG)
- Fork button (prominent CTA)

---

### 3. New Kernel Page (`/kernel/new`)

**Purpose:** Create a new original kernel

**Form Fields:**
- Title (text input, max 200 chars, required)
- Description (textarea, max 5000 chars, required, markdown supported)
- Tags (multi-select or text input with comma separation)
- License (dropdown: "Open for remixing", "Attribution required", "Ask permission")

**Validation:**
- Title: non-empty, ≤200 chars
- Description: non-empty, ≤5000 chars
- Tags: max 10 tags, each ≤30 chars
- Must be authenticated

**Submit Action:**
```typescript
const { data, error } = await supabase
  .from('kernels')
  .insert({
    title,
    description,
    tags,
    license,
    author_id: user.id
  })
  .select()
  .single();

// Redirect to /kernel/[id] on success
```

**UI Elements:**
- Character counters on title and description
- Real-time markdown preview for description
- Tag suggestions based on existing popular tags
- Clear cancel/save buttons

---

### 4. Fork Kernel Page (`/kernel/[id]/fork`)

**Purpose:** Create a derivative kernel

**Behavior:**
- Pre-populate form with parent kernel data
- Set `parent_id` to the forked kernel
- Add label: "Forking from: [Parent Title]"
- User can modify all fields

**Form Fields:** Same as New Kernel, plus:
- "Forking from" display (non-editable, shows parent kernel)
- Optional "Fork notes" field to explain what you're changing/adding

**Submit Action:**
```typescript
const { data, error } = await supabase
  .from('kernels')
  .insert({
    title,
    description,
    tags,
    license,
    author_id: user.id,
    parent_id: parentKernelId  // KEY DIFFERENCE
  })
  .select()
  .single();
```

**UI Elements:**
- Visual indicator this is a fork (different color scheme/badge)
- Link back to parent kernel
- Side-by-side comparison option (show parent description alongside)

---

### 5. User Profile Page (`/profile/[username]`)

**Purpose:** Display user's created kernels and basic info

**Components:**
- User header (avatar, display name, username, bio)
- Edit profile button (if viewing own profile)
- Tabs: "Created Kernels" | "Forked Kernels"
- Grid of KernelCard components for each tab

**Data Loading:**
```typescript
// Fetch user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('username', username)
  .single();

// Fetch user's kernels
const { data: kernels } = await supabase
  .from('kernels')
  .select('*, fork_count:kernels(count)')
  .eq('author_id', profile.id)
  .order('created_at', { ascending: false });
```

**UI Elements:**
- Stats: total kernels created, total forks received, member since date
- Empty state if no kernels: "No kernels yet" with CTA to create

---

### 6. Authentication Pages

#### Login Page (`/auth/login`)
- Email/password form
- "Sign up" link
- Use Supabase Auth

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

#### Signup Page (`/auth/signup`)
- Email/password form
- Username field (unique, required for profile)
- Display name field (optional)
- Create profile after auth signup

```typescript
// 1. Sign up
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password
});

// 2. Create profile
const { error: profileError } = await supabase
  .from('profiles')
  .insert({
    id: authData.user.id,
    username,
    display_name
  });
```

---

## Component Specifications

### KernelCard Component

**Props:**
```typescript
interface KernelCardProps {
  kernel: {
    id: string;
    title: string;
    description: string;
    created_at: string;
    tags: string[];
    author: {
      username: string;
      display_name: string;
    };
    fork_count?: number;
    parent_id?: string;
  };
  variant?: 'default' | 'compact';
}
```

**Display:**
- Card with hover effect
- Title (bold, link to detail)
- Description excerpt (first 150 chars + "...")
- Author byline with avatar
- Tags as badges
- Metadata footer: created date, fork count icon + number
- Fork badge if derivative
- Fork button on hover

---

### KernelForm Component

**Props:**
```typescript
interface KernelFormProps {
  mode: 'create' | 'fork';
  initialData?: {
    title: string;
    description: string;
    tags: string[];
    license: string;
  };
  parentId?: string;
  parentTitle?: string;
  onSubmit: (data: KernelFormData) => Promise<void>;
}
```

**Features:**
- Controlled form with React Hook Form
- Real-time validation
- Character counters
- Markdown preview toggle for description
- Tag input with autocomplete
- License dropdown
- Submit/cancel buttons

---

### KernelTree Component

**Props:**
```typescript
interface KernelTreeProps {
  currentKernelId: string;
  ancestry: Array<{
    id: string;
    title: string;
    author: { username: string };
  }>;
  descendants: Array<{
    id: string;
    title: string;
    author: { username: string };
  }>;
}
```

**Display:**
- Simple SVG tree visualization
- Current kernel highlighted
- Parent(s) above
- Children below
- Each node clickable to navigate
- Max 3 levels displayed (truncate with "..." if deeper)

---

### Navigation Component

**Features:**
- Logo/site title (links to home)
- Search bar (searches kernel titles/descriptions)
- "New Kernel" button (prominent, authenticated users only)
- User menu dropdown:
  - Profile link
  - Settings (future)
  - Logout
- Login/Signup buttons (if not authenticated)

**Responsive:**
- Mobile: hamburger menu
- Desktop: full horizontal nav

---

## Authentication & Authorization

### Authentication Flow

1. **Supabase Auth** handles all authentication
2. **Session management** via cookies (Next.js middleware)
3. **Protected routes**: New kernel, fork, edit require authentication
4. **Redirect logic**: Unauthenticated users redirected to login with return URL

### Middleware Setup

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Protected routes
  const protectedPaths = ['/kernel/new', '/kernel/*/fork', '/kernel/*/edit']
  
  // Check if path matches protected routes
  // If not authenticated, redirect to login
  // Pass through if authenticated
}
```

---

## Search Functionality

### Basic Search (MVP)

**Implementation:**
- Search bar in navigation
- Search page: `/search?q=[query]`
- PostgreSQL full-text search on title + description

```typescript
const { data: results } = await supabase
  .from('kernels')
  .select(`
    *,
    author:profiles(username, display_name)
  `)
  .textSearch('title', query, {
    type: 'websearch',
    config: 'english'
  })
  .order('created_at', { ascending: false });
```

**UI:**
- Search results page with kernel cards
- "No results" state with suggestions
- Show result count

---

## Tag System

### Tag Behavior

- **Input:** Comma-separated or multi-select
- **Storage:** PostgreSQL array
- **Common tags:** Pre-populate suggestions from existing tags
- **Clickable:** Tag clicks filter to kernels with that tag
- **Case-insensitive:** Normalize to lowercase
- **Max tags:** 10 per kernel
- **Max length:** 30 chars per tag

### Tag Filter Page

**URL:** `/tags/[tag]`
**Display:** All kernels with that tag

```typescript
const { data: kernels } = await supabase
  .from('kernels')
  .select('*, author:profiles(*)')
  .contains('tags', [tag])
  .order('created_at', { ascending: false });
```

---

## Styling Guidelines

### Design System

**Colors:**
- Primary: Indigo (for CTAs, links)
- Secondary: Slate (for text, borders)
- Accent: Amber (for fork badges, highlights)
- Background: White/light gray
- Cards: White with subtle shadow

**Typography:**
- Headings: Sans-serif (Inter or similar)
- Body: Sans-serif
- Code/markdown: Monospace

**Components:**
- Use shadcn/ui defaults
- Consistent spacing (Tailwind scale: 4, 8, 16, 24, 32px)
- Rounded corners (md: 0.375rem)
- Subtle shadows for elevation

**Responsive:**
- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Kernel grid: 1 col mobile, 2 col tablet, 3 col desktop

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Deployment Steps

### 1. Supabase Setup
1. Create new Supabase project
2. Run SQL schema (create tables, indexes, RLS policies)
3. Enable email authentication
4. Note project URL and anon key

### 2. Vercel Setup
1. Connect GitHub repository
2. Add environment variables
3. Deploy (automatic on push to main)

### 3. Custom Domain (Optional)
- Add custom domain in Vercel settings
- Update Supabase auth redirect URLs

---

## Testing Checklist

### Core Functionality
- [ ] User can sign up and login
- [ ] User can create a new kernel
- [ ] User can view a kernel detail page
- [ ] User can fork a kernel
- [ ] Forked kernel shows parent attribution
- [ ] Parent kernel shows derivative list
- [ ] User can view their profile with their kernels
- [ ] User can edit their own kernels only
- [ ] Tags work and are clickable
- [ ] Search returns relevant results
- [ ] Authentication redirects work correctly

### Edge Cases
- [ ] Cannot submit empty kernel
- [ ] Character limits enforced
- [ ] Cannot access edit page for others' kernels
- [ ] Forking deleted parent kernel (parent_id becomes null)
- [ ] No kernels state displays correctly
- [ ] Loading states display
- [ ] Error states display (network errors, etc.)

### Responsive Design
- [ ] Works on mobile (320px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1024px+ width)
- [ ] Navigation adapts properly

---

## Performance Considerations

### Optimization
- Use Next.js server components where possible (less JS shipped)
- Image optimization via Next.js Image component
- Paginate kernel lists (20 per page)
- Database indexes on frequently queried columns
- Cache static pages (home, profile) for 60 seconds

### Monitoring
- Vercel analytics (built-in)
- Supabase dashboard for database performance
- Monitor RLS policy performance

---

## Future Extensions (Not in MVP, for Reference)

- Comments/discussions on kernels
- Collections/bundles of kernels
- Following users
- Notifications (when someone forks your kernel)
- Rich text editor with better markdown support
- Export functionality (PDF world bible)
- Advanced tree visualization
- Collaborative editing
- Private kernels/drafts

---

## Success Metrics for MVP

**Must Have:**
- 20+ kernels created in first 2 weeks
- 5+ forks created
- 10+ active users (creative writing club members)
- Zero critical bugs blocking core workflow

**Nice to Have:**
- Users discover derivatives of their work organically
- At least one "chain" of 3+ derivatives
- Positive feedback from workshop sessions

---

## Deliverables

1. **Codebase:** GitHub repository with clean, commented code
2. **Deployment:** Live site on Vercel with custom domain (optional)
3. **Documentation:** README with setup instructions
4. **Admin access:** Supabase dashboard credentials
5. **Brief walkthrough:** 5-min video demo of core functionality

---

## Timeline Estimate

- **Setup (Supabase + Next.js):** 1 hour
- **Authentication pages:** 2 hours
- **Database schema + RLS:** 2 hours
- **Kernel create/view pages:** 4 hours
- **Fork functionality:** 3 hours
- **Profile page:** 2 hours
- **Search functionality:** 2 hours
- **UI polish + responsive:** 3 hours
- **Testing + bug fixes:** 3 hours
- **Deployment:** 1 hour

**Total:** ~23 hours for experienced Next.js developer
