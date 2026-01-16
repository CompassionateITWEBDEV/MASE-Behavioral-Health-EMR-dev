-- Create a database function to get all staff members
-- This bypasses RLS and avoids ENUM casting issues
CREATE OR REPLACE FUNCTION get_all_staff_members()
RETURNS TABLE (
  id UUID,
  employee_id TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT, -- Return as TEXT to avoid ENUM issues
  department TEXT,
  license_number TEXT,
  license_type TEXT,
  license_expiry DATE,
  hire_date DATE,
  is_active BOOLEAN,
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.employee_id,
    s.first_name,
    s.last_name,
    s.email,
    s.phone,
    s.role::TEXT, -- Cast ENUM to TEXT
    s.department,
    s.license_number,
    s.license_type,
    s.license_expiry,
    s.hire_date,
    s.is_active,
    s.permissions,
    s.created_at,
    s.updated_at
  FROM public.staff s
  ORDER BY s.last_name ASC;
END;
$$;
