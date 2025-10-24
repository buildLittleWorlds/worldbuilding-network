# Testing Guide

## Quick Start

```bash
npm run dev
```

Then visit http://localhost:3000

## End-to-End Testing Flow

### 1. Test Signup & Login ✅

**Signup:**
1. Click "Sign Up" in navigation
2. Fill in:
   - Email: your-email@example.com
   - Password: testpass123 (at least 6 chars)
   - Username: testuser (3-20 chars, alphanumeric + hyphens/underscores)
   - Display Name: Test User (optional)
3. Click "Sign Up"
4. Should redirect to home page
5. Navigation should show "@testuser" and "New Kernel" button

**Logout:**
1. Click "Logout" button
2. Navigation should show "Log In" and "Sign Up" buttons

**Login:**
1. Click "Log In"
2. Enter email and password
3. Should redirect to home page with your username visible

### 2. Test Route Protection ✅

**While logged out:**
1. Try to visit http://localhost:3000/kernel/new
2. Should redirect to login page
3. URL should include `?redirect=/kernel/new`

**After logging in from protected route:**
1. Should be redirected back to the protected page

**While logged in:**
1. Try to visit http://localhost:3000/auth/login
2. Should redirect to home page

### 3. Test Kernel Creation ✅

**Valid kernel:**
1. Make sure you're logged in
2. Click "New Kernel" button
3. Fill in the form:
   - Title: "The Crystal Caverns" (max 200 chars)
   - Description: "A vast underground network of luminescent crystal formations..." (max 5000 chars, markdown supported)
   - Tags: "fantasy, location, underground, magic" (comma-separated, max 10 tags)
   - License: Select one (default is "Open for remixing")
4. Watch character counters update as you type
5. Click "Create Kernel"
6. Should redirect to home page
7. Check Supabase dashboard to verify kernel was saved

**Validation testing:**
1. Try submitting empty form → should show required field errors
2. Enter title over 200 chars → counter turns red
3. Enter description over 5000 chars → counter turns red
4. Enter more than 10 tags → only first 10 will be saved
5. Enter tags over 30 chars each → should show error

**Cancel button:**
1. Fill in some data
2. Click "Cancel"
3. Should return to home page without saving

### 4. Verify Data in Supabase

1. Go to https://supabase.com/dashboard/project/tkcruglusoqwhoizsbnw
2. Navigate to Table Editor
3. Check `profiles` table:
   - Should see your user profile with username
4. Check `kernels` table:
   - Should see your created kernels
   - Verify title, description, tags, license, author_id

## What to Test Next (Not Ready Yet)

- ❌ Home page feed (kernels don't display yet)
- ❌ View individual kernels
- ❌ Fork kernels
- ❌ Edit kernels
- ❌ User profile pages
- ❌ Search functionality
- ❌ Tag filtering

## Known Issues / Expected Behavior

### Working as Expected:
- Home page is a placeholder (kernels saved but not shown)
- Profile link in navigation leads to 404 (page not built yet)
- After creating kernel, you're redirected to home but don't see your kernel (feed not built yet)

### To Verify:
- Can you sign up with a new account?
- Can you log in with existing credentials?
- Can you create a kernel with valid data?
- Does validation work (character limits, required fields)?
- Does route protection work (can't access /kernel/new when logged out)?
- Are kernels appearing in Supabase database?

## Test Data Suggestions

**Test Kernels to Create:**

1. **Character Kernel:**
   - Title: "Kira the Shadow Weaver"
   - Description: "A mysterious sorceress who can manipulate shadows as physical objects..."
   - Tags: character, fantasy, magic, sorceress

2. **Location Kernel:**
   - Title: "The Floating Markets of Zenith"
   - Description: "Sky-high marketplaces suspended by ancient magic, where traders from across dimensions gather..."
   - Tags: location, fantasy, marketplace, sky-city

3. **Magic System Kernel:**
   - Title: "Breath Magic"
   - Description: "Magic is drawn from controlled breathing patterns. Each breath type channels different elements..."
   - Tags: magic-system, fantasy, elemental, worldbuilding

4. **Minimal Kernel:**
   - Title: "Quick Test"
   - Description: "Testing basic functionality"
   - Tags: test

5. **Maximum Length Kernel:**
   - Title: (190 characters - push the limit)
   - Description: (4500 characters - lots of detail)
   - Tags: test, validation, limits, character-count, edge-case, testing-123, maximum, boundary, check, final

## Reporting Issues

If you find issues, note:
1. What you were trying to do
2. What happened vs. what you expected
3. Any error messages in browser console (F12 → Console tab)
4. Any error messages in terminal where `npm run dev` is running

## Success Criteria

✅ You can complete this flow without errors:
1. Sign up → 2. Log in → 3. Create kernel → 4. See it in Supabase

If all three steps work, the foundation is solid and we're ready to build the viewing/display features!
