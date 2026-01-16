-- Fix RLS policies to properly cast text to staff_role ENUM
-- This fixes the "operator does not exist: staff_role = text" error

-- Drop existing policies
DROP POLICY IF EXISTS "staff_select_own_or_admin" ON public.staff;
DROP POLICY IF EXISTS "staff_insert_admin_only" ON public.staff;
DROP POLICY IF EXISTS "staff_update_own_or_admin" ON public.staff;
DROP POLICY IF EXISTS "staff_permissions_select" ON public.staff_permissions;
DROP POLICY IF EXISTS "staff_permissions_admin_only" ON public.staff_permissions;
DROP POLICY IF EXISTS "patient_medications_healthcare_staff" ON public.patient_medications;
DROP POLICY IF EXISTS "patient_medications_prescriber_insert" ON public.patient_medications;
DROP POLICY IF EXISTS "patient_medications_prescriber_update" ON public.patient_medications;
DROP POLICY IF EXISTS "prescriptions_healthcare_staff_select" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions_doctor_only" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions_prescriber_update" ON public.prescriptions;
DROP POLICY IF EXISTS "staff_activity_log_own_or_admin" ON public.staff_activity_log;
DROP POLICY IF EXISTS "staff_activity_log_insert_own" ON public.staff_activity_log;

-- Recreate RLS Policies for staff table with proper ENUM casting
CREATE POLICY "staff_select_own_or_admin" ON public.staff
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role = 'admin'::staff_role
    )
  );

CREATE POLICY "staff_insert_admin_only" ON public.staff
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role = 'admin'::staff_role
    )
  );

CREATE POLICY "staff_update_own_or_admin" ON public.staff
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role = 'admin'::staff_role
    )
  );

-- RLS Policies for staff permissions
CREATE POLICY "staff_permissions_select" ON public.staff_permissions
  FOR SELECT USING (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role = 'admin'::staff_role
    )
  );

CREATE POLICY "staff_permissions_admin_only" ON public.staff_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role = 'admin'::staff_role
    )
  );

-- RLS Policies for patient medications
CREATE POLICY "patient_medications_healthcare_staff" ON public.patient_medications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.is_active = true
    )
  );

CREATE POLICY "patient_medications_prescriber_insert" ON public.patient_medications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role IN ('doctor'::staff_role, 'rn'::staff_role) AND s.is_active = true
    )
  );

CREATE POLICY "patient_medications_prescriber_update" ON public.patient_medications
  FOR UPDATE USING (
    prescribed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role IN ('doctor'::staff_role, 'admin'::staff_role) AND s.is_active = true
    )
  );

-- RLS Policies for prescriptions
CREATE POLICY "prescriptions_healthcare_staff_select" ON public.prescriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.is_active = true
    )
  );

CREATE POLICY "prescriptions_doctor_only" ON public.prescriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role = 'doctor'::staff_role AND s.is_active = true
    )
  );

CREATE POLICY "prescriptions_prescriber_update" ON public.prescriptions
  FOR UPDATE USING (
    prescribed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role IN ('doctor'::staff_role, 'admin'::staff_role) AND s.is_active = true
    )
  );

-- RLS Policies for activity log
CREATE POLICY "staff_activity_log_own_or_admin" ON public.staff_activity_log
  FOR SELECT USING (
    staff_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() AND s.role = 'admin'::staff_role
    )
  );

CREATE POLICY "staff_activity_log_insert_own" ON public.staff_activity_log
  FOR INSERT WITH CHECK (staff_id = auth.uid());
