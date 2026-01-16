-- Debug script to check medication order requests
-- Run this in Supabase SQL Editor to see what orders exist

-- Check total count
SELECT COUNT(*) as total_orders FROM medication_order_requests;

-- Check orders by status
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM medication_order_requests
GROUP BY status
ORDER BY count DESC;

-- Show all orders with details
SELECT 
  id,
  patient_id,
  order_type,
  current_dose_mg,
  requested_dose_mg,
  status,
  nurse_id,
  physician_id,
  created_at
FROM medication_order_requests
ORDER BY created_at DESC
LIMIT 20;

-- Check if RLS is blocking
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'medication_order_requests';

-- Check RLS policies
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'medication_order_requests';
