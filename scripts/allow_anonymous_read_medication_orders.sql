-- OPTION: Allow anonymous/unauthenticated users to READ medication orders
-- ⚠️ WARNING: This reduces security! Only use for development/testing
-- In production, you should require authentication

-- Drop the existing authenticated-only policy
DROP POLICY IF EXISTS "Allow authenticated users to view medication orders" ON medication_order_requests;

-- Create a new policy that allows ANYONE (including unauthenticated) to view orders
-- This means no login required to see orders
CREATE POLICY "Allow anyone to view medication orders"
  ON medication_order_requests
  FOR SELECT
  TO public  -- 'public' means anyone, even without login
  USING (true);

-- Keep INSERT/UPDATE/DELETE restricted to authenticated users for security
-- (These policies remain unchanged)

-- Verify the policy
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'medication_order_requests'
AND policyname = 'Allow anyone to view medication orders';
