# Login Requirement for Medication Order Management

## Question: Need ba jud mag-login para makita ang data?

**Short Answer: OO, karon need mag-login** tungod sa RLS (Row Level Security) policies.

## Why Login is Required

Ang RLS policies nanginahanglan ug authentication:

```sql
CREATE POLICY "Allow authenticated users to view medication orders"
  ON medication_order_requests
  FOR SELECT
  TO authenticated  -- ← Requires login
  USING (true);
```

**Meaning:**
- `TO authenticated` = Only logged-in users can access
- Without login = RLS blocks the query = No data displayed

## Options

### Option 1: Keep Login Required (RECOMMENDED for Production)
✅ **Secure** - Only authorized users can see orders
✅ **Compliant** - Follows security best practices
❌ **Requires login** - Users must authenticate first

**Steps:**
1. User must login at `/auth/login`
2. Then can view orders at `/order-management`

### Option 2: Allow Anonymous Access (Development Only)
⚠️ **Less Secure** - Anyone can view orders without login
✅ **No login needed** - Data displays immediately
❌ **Security risk** - Not recommended for production

**To enable:**
Run `scripts/allow_anonymous_read_medication_orders.sql` in Supabase SQL Editor

**This will:**
- Allow anyone (even without login) to VIEW orders
- Still require login for INSERT/UPDATE/DELETE (for security)

### Option 3: Disable RLS Completely (NOT RECOMMENDED)
❌ **No security** - Anyone can do anything
❌ **Dangerous** - Can delete/modify data without auth

**Only use for testing:**
```sql
ALTER TABLE medication_order_requests DISABLE ROW LEVEL SECURITY;
```

---

## Recommendation

**For Development/Testing:**
- Use Option 2 (allow anonymous read) if you want to test without login
- Remember to revert to Option 1 before production

**For Production:**
- **MUST use Option 1** (require login)
- This protects patient data and complies with HIPAA/42 CFR Part 2

---

## Current Setup

Right now, your system uses **Option 1** (login required). 

If you want to change to **Option 2** (no login needed to view):
1. Run `scripts/allow_anonymous_read_medication_orders.sql`
2. Refresh `/order-management` page
3. Data should display without login

---

## Summary

| Option | Login Required? | Security Level | Use Case |
|--------|----------------|----------------|----------|
| Option 1 (Current) | ✅ Yes | 🔒 High | Production |
| Option 2 | ❌ No (view only) | ⚠️ Medium | Development |
| Option 3 | ❌ No (all actions) | ❌ None | Never |

**Answer to your question:** 
- **Karon:** OO, need mag-login
- **Pwede ma-change:** OO, pero less secure
- **Recommended:** Keep login required for security
