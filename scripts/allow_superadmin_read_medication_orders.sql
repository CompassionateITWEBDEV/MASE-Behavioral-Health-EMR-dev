-- Allow superadmin to read medication orders
-- Superadmin uses cookie-based auth, not Supabase auth.uid()
-- So we need a policy that allows access based on superadmin session check

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow superadmin to view medication orders" ON medication_order_requests;

-- Note: RLS policies can't directly check cookies or superadmin sessions
-- So we have two options:

-- OPTION 1: Allow service role (used by API endpoints) - RECOMMENDED
-- The API endpoints use createServiceClient() which bypasses RLS
-- So superadmin should access via API, not direct client queries

-- OPTION 2: Create a policy that allows if user is in super_admins table
-- But this requires the user to also have a Supabase auth account
-- which superadmin might not have

-- OPTION 3: Temporarily allow public read for development (NOT RECOMMENDED)
-- Only use this if you need superadmin to view directly from frontend

-- For now, the best approach is:
-- 1. Superadmin uses API endpoints (which bypass RLS via service client)
-- 2. OR create a function that checks superadmin session server-side

-- If you need superadmin to query directly from frontend, you can:
-- A) Create a Supabase function that checks superadmin session
-- B) Or temporarily allow public read (development only)

-- TEMPORARY FIX: Allow public read (DEVELOPMENT ONLY - REMOVE IN PRODUCTION)
-- Uncomment below if you need superadmin to view from frontend:
/*
DROP POLICY IF EXISTS "Allow authenticated users to view medication orders" ON medication_order_requests;

CREATE POLICY "Allow anyone to view medication orders (DEV ONLY)"
  ON medication_order_requests
  FOR SELECT
  TO public
  USING (true);
*/

-- RECOMMENDED: Keep authenticated-only policy
-- Superadmin should access via API endpoints which use service client

-- Verify current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'medication_order_requests';
