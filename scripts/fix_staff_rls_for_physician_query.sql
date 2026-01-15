-- =====================================================
-- Fix Staff Table RLS to Allow Reading Staff Members
-- This allows authenticated staff to read other staff members
-- which is needed for queries like finding physicians
-- =====================================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "staff_select_own_or_admin" ON public.staff;
DROP POLICY IF EXISTS "staff_select_authenticated" ON public.staff;

-- Create a simple policy that allows all authenticated users to read staff
-- This avoids recursion issues and allows features like dosing window to work
-- Note: This assumes all authenticated users are staff members
CREATE POLICY "staff_select_authenticated" ON public.staff
  FOR SELECT 
  TO authenticated
  USING (true);

-- Keep the existing insert/update policies for security
-- (These remain unchanged - only admins can insert/update)
