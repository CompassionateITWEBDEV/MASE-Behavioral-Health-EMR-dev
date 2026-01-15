-- Create a database function to fetch medication orders with patient names using explicit JOIN
-- This ensures patient names are always included even if Supabase relationship detection fails

CREATE OR REPLACE FUNCTION get_medication_orders_with_patients(
  p_status TEXT DEFAULT NULL,
  p_patient_id UUID DEFAULT NULL,
  p_physician_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  -- Order fields
  id UUID,
  patient_id UUID,
  order_type VARCHAR,
  current_dose_mg NUMERIC,
  requested_dose_mg NUMERIC,
  clinical_justification TEXT,
  physician_id VARCHAR,
  nurse_id VARCHAR,
  nurse_signature TEXT,
  physician_signature TEXT,
  status VARCHAR,
  physician_review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  -- Patient fields
  patient_first_name TEXT,
  patient_last_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mor.id,
    mor.patient_id,
    mor.order_type,
    mor.current_dose_mg,
    mor.requested_dose_mg,
    mor.clinical_justification,
    mor.physician_id,
    mor.nurse_id,
    mor.nurse_signature,
    mor.physician_signature,
    mor.status,
    mor.physician_review_notes,
    mor.reviewed_at,
    mor.created_at,
    mor.updated_at,
    p.first_name as patient_first_name,
    p.last_name as patient_last_name
  FROM medication_order_requests mor
  INNER JOIN patients p ON mor.patient_id = p.id
  WHERE 
    (p_status IS NULL OR mor.status = p_status)
    AND (p_patient_id IS NULL OR mor.patient_id = p_patient_id)
    AND (p_physician_id IS NULL OR mor.physician_id = p_physician_id)
  ORDER BY mor.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_medication_orders_with_patients TO authenticated;
GRANT EXECUTE ON FUNCTION get_medication_orders_with_patients TO anon;

-- Test the function
SELECT * FROM get_medication_orders_with_patients() LIMIT 5;
