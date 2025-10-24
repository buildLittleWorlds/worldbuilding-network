# Development Status

Last updated: 2025-10-24

## Project Overview

Building a collaborative world-building platform (MVP) for creative writing students. See [specification.md](specification.md) for complete requirements.

## Current Status: Create Kernel Functional (35% of MVP)

### 🧪 Ready for Testing!

**Complete end-to-end flow is now functional:**
1. ✅ Sign up with email/password/username
2. ✅ Log in to existing account
3. ✅ Click "New Kernel" button in navigation
4. ✅ Fill out kernel form (title, description, tags, license)
5. ✅ Submit → saves to database → redirects to home
6. ✅ Kernels are stored in Supabase (view in dashboard)

**To test:**
```bash
npm run dev
# Visit http://localhost:3000
# Create an account, then create a kernel!
```

**What's working:**
- Full authentication flow
- Kernel creation with validation
- Data persistence to Supabase
- Route protection

**What's not ready yet:**
- Home page feed (kernels are saved but not displayed)
- Viewing individual kernels
- Forking kernels
- User profiles

### ✅ Completed

#### 1. Project Setup
- [x] Next.js 14+ with App Router and TypeScript
- [x] Tailwind CSS configured
- [x] shadcn/ui installed (button, card components)
- [x] Package dependencies installed
- [x] Git repository initialized

#### 2. Supabase Backend
- [x] Project created: `worldbuilding-network` (ref: `tkcruglusoqwhoizsbnw`)
- [x] Region: East US (North Virginia)
- [x] Database schema deployed via migration
- [x] Tables created: `profiles`, `kernels`
- [x] Indexes created on author_id, parent_id, created_at, tags
- [x] Row Level Security (RLS) policies implemented
- [x] Supabase CLI installed and linked
- [x] Environment variables configured in `.env.local`
- [x] Database connection tested successfully

#### 3. Type Safety
- [x] Database types defined in `types/database.types.ts`
- [x] Helper types for Kernel, Profile, KernelWithAuthor, KernelWithRelations
- [x] Supabase clients configured (browser + server)

#### 4. Authentication System
- [x] `app/auth/login/page.tsx` - Login page with Supabase Auth
- [x] `app/auth/signup/page.tsx` - Signup page with profile creation
- [x] `proxy.ts` - Route protection for authenticated routes
- [x] `components/Navigation.tsx` - Navigation with auth state
- [x] Root layout updated with navigation
- [x] Username validation and uniqueness checking
- [x] Redirect logic for protected routes
- [x] Auto-redirect logged-in users away from auth pages

#### 5. Kernel Creation
- [x] `components/KernelForm.tsx` - Reusable form component
  - Title validation (200 char max)
  - Description validation (5000 char max)
  - Tag parsing (max 10 tags, 30 chars each)
  - License selection
  - Character counters
  - Markdown support
  - Works for create/fork/edit modes
- [x] `app/kernel/new/page.tsx` - Create new kernel
- [x] Database insertion working
- [x] User authentication check before creation

#### 6. Files Created
- `app/layout.tsx` - Root layout with navigation
- `app/page.tsx` - Placeholder home page
- `app/auth/login/page.tsx` - Login page
- `app/auth/signup/page.tsx` - Signup page
- `app/kernel/new/page.tsx` - Create kernel page
- `app/globals.css` - Global styles
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `lib/utils.ts` - Utility functions
- `components/ui/button.tsx` - shadcn/ui button
- `components/ui/card.tsx` - shadcn/ui card
- `components/Navigation.tsx` - Global navigation
- `components/KernelForm.tsx` - Reusable kernel form
- `proxy.ts` - Authentication middleware (Next.js 16)
- `supabase/migrations/20241024_initial_schema.sql` - Initial schema migration
- `.env.example` - Environment template

### 🚧 In Progress

Nothing currently in progress.

### ❌ Not Started (65% of MVP remaining)

#### Priority 2: Core Components (~2 hours)
- [ ] `components/KernelCard.tsx` - Reusable kernel display card
- [ ] `components/KernelTree.tsx` - Fork ancestry visualization

#### Priority 3: Kernel Viewing & Forking (~5 hours)
- [ ] Update `app/page.tsx` - Home feed with kernels list
- [ ] `app/kernel/[id]/page.tsx` - View kernel detail
- [ ] `app/kernel/[id]/fork/page.tsx` - Fork existing kernel
- [ ] `app/kernel/[id]/edit/page.tsx` - Edit own kernels
- [ ] Test viewing, forking flow

#### Priority 4: User Profiles (~2 hours)
- [ ] `app/profile/[username]/page.tsx` - User profile with kernels
- [ ] Profile editing functionality

#### Priority 5: Discovery (~2 hours)
- [ ] Search functionality
- [ ] Tag filtering
- [ ] `app/tags/[tag]/page.tsx` - Tag-filtered kernels

#### Priority 6: Polish (~3 hours)
- [ ] Responsive design testing
- [ ] Loading states
- [ ] Error states
- [ ] UI refinement

## Database Schema

### Tables

**profiles**
- `id` (UUID, FK to auth.users)
- `username` (TEXT, UNIQUE, NOT NULL)
- `display_name` (TEXT)
- `bio` (TEXT)
- `created_at` (TIMESTAMP)

**kernels**
- `id` (UUID, PRIMARY KEY)
- `title` (TEXT, max 200 chars)
- `description` (TEXT, max 5000 chars)
- `author_id` (UUID, FK to profiles)
- `parent_id` (UUID, FK to kernels, nullable)
- `tags` (TEXT[])
- `license` (TEXT, default 'open')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Row Level Security

- Anyone can read kernels and profiles
- Only authors can update/delete their own kernels
- Users can insert/update their own profiles

## Environment Setup

### Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tkcruglusoqwhoizsbnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[see .env.local]
```

### Supabase Project Details

- **Project Name**: worldbuilding-network
- **Project Ref**: tkcruglusoqwhoizsbnw
- **Region**: us-east-1 (North Virginia)
- **Dashboard**: https://supabase.com/dashboard/project/tkcruglusoqwhoizsbnw

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# View at http://localhost:3000
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deployment**: Vercel (planned)

## Key Design Decisions

1. **Fork-based model**: Using `parent_id` foreign key to track kernel lineage
2. **PostgreSQL arrays**: Using TEXT[] for tags with GIN index
3. **Row Level Security**: Database-level security instead of application-level
4. **Server/Client components**: Following Next.js App Router best practices
5. **shadcn/ui**: Copy-paste components for full control vs. package dependency

## Testing Checklist (from specification)

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

## Timeline Estimate (from specification)

- ~~Setup (Supabase + Next.js): 1 hour~~ ✅
- ~~Authentication pages: 2 hours~~ ✅
- ~~Database schema + RLS: 2 hours~~ ✅
- Kernel create/view pages: 4 hours
- Fork functionality: 3 hours
- Profile page: 2 hours
- Search functionality: 2 hours
- UI polish + responsive: 3 hours
- Testing + bug fixes: 3 hours
- Deployment: 1 hour

**Total**: ~23 hours (5 hours complete, 18 hours remaining)

## Next Session Priorities

1. **KernelCard Component** - Reusable component for displaying kernels
2. **Create Kernel Page** - Enable content creation (`/kernel/new`)
3. **Home Feed** - Display actual kernels from database
4. **Kernel Detail View** - View individual kernels (`/kernel/[id]`)

## Notes for Future Sessions

- **IMPORTANT**: Create `.env.local` file with Supabase credentials before running dev server
  - Copy from `.env.example` and fill in your Supabase URL and anon key
  - Get credentials from https://supabase.com/dashboard/project/tkcruglusoqwhoizsbnw/settings/api
- Supabase CLI is configured and working
- Migration files are in `supabase/migrations/`
- Database password: WorldKernel2024!SecureDB (for reference)
- All RLS policies are in place and tested
- Type generation: `supabase gen types typescript --project-id tkcruglusoqwhoizsbnw`
- Authentication system is complete and ready to test once env vars are set
