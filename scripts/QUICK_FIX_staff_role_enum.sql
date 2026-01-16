-- QUICK FIX: Update RLS policies to cast text to ENUM
-- Run this in Supabase SQL Editor immediately

-- Fix staff table policies
DROP POLICY IF EXISTS "staff_select_own_or_admin" ON public.staff;
CREATE POLICY "staff_select_own_or_admin" ON public.staff
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role::text = 'admin'
    )
  );

DROP POLICY IF EXISTS "staff_insert_admin_only" ON public.staff;
CREATE POLICY "staff_insert_admin_only" ON public.staff
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role::text = 'admin'
    )
  );

DROP POLICY IF EXISTS "staff_update_own_or_admin" ON public.staff;
CREATE POLICY "staff_update_own_or_admin" ON public.staff
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role::text = 'admin'
    )
  );

-- Fix staff_permissions policies
DROP POLICY IF EXISTS "staff_permissions_select" ON public.staff_permissions;
CREATE POLICY "staff_permissions_select" ON public.staff_permissions
  FOR SELECT USING (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role::text = 'admin'
    )
  );

DROP POLICY IF EXISTS "staff_permissions_admin_only" ON public.staff_permissions;
CREATE POLICY "staff_permissions_admin_only" ON public.staff_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role::text = 'admin'
    )
  );

-- Fix patient_medications policies
DROP POLICY IF EXISTS "patient_medications_prescriber_insert" ON public.patient_medications;
CREATE POLICY "patient_medications_prescriber_insert" ON public.patient_medications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role::text IN ('doctor', 'rn') AND s.is_active = true
    )
  );

DROP POLICY IF EXISTS "patient_medications_prescriber_update" ON public.patient_medications;
CREATE POLICY "patient_medications_prescriber_update" ON public.patient_medications
  FOR UPDATE USING (
    prescribed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role::text IN ('doctor', 'admin') AND s.is_active = true
    )
  );

-- Fix prescriptions policies
DROP POLICY IF EXISTS "prescriptions_doctor_only" ON public.prescriptions;
CREATE POLICY "prescriptions_doctor_only" ON public.prescriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role::text = 'doctor' AND s.is_active = true
    )
  );

DROP POLICY IF EXISTS "prescriptions_prescriber_update" ON public.prescriptions;
CREATE POLICY "prescriptions_prescriber_update" ON public.prescriptions
  FOR UPDATE USING (
    prescribed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role::text IN ('doctor', 'admin') AND s.is_active = true
    )
  );

-- Fix staff_activity_log policy
DROP POLICY IF EXISTS "staff_activity_log_own_or_admin" ON public.staff_activity_log;
CREATE POLICY "staff_activity_log_own_or_admin" ON public.staff_activity_log
  FOR SELECT USING (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role::text = 'admin'
    )
  );
