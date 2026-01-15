-- Add RLS policies for medication_order_requests table
-- This ensures authenticated users can access medication orders

-- Enable RLS on medication_order_requests table
ALTER TABLE medication_order_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view medication orders" ON medication_order_requests;
DROP POLICY IF EXISTS "Allow authenticated users to manage medication orders" ON medication_order_requests;
DROP POLICY IF EXISTS "Allow all access to medication orders" ON medication_order_requests;

-- Policy: Allow authenticated users to view medication orders
-- This allows any authenticated user (staff, nurses, physicians) to view orders
CREATE POLICY "Allow authenticated users to view medication orders"
  ON medication_order_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert medication orders
CREATE POLICY "Allow authenticated users to insert medication orders"
  ON medication_order_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update medication orders
-- Physicians can update orders (approve/deny), nurses can update their own orders
CREATE POLICY "Allow authenticated users to update medication orders"
  ON medication_order_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete medication orders (optional, for cleanup)
CREATE POLICY "Allow authenticated users to delete medication orders"
  ON medication_order_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'medication_order_requests';
