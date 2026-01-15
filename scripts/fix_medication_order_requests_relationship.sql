-- Fix medication_order_requests relationship to patients table
-- This ensures the foreign key relationship exists and is properly named for Supabase

-- First, check if the foreign key already exists and drop it if needed
DO $$ 
BEGIN
    -- Drop existing foreign key if it exists (in case it's not properly named)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'medication_order_requests_patient_id_fkey'
        AND table_name = 'medication_order_requests'
    ) THEN
        ALTER TABLE medication_order_requests 
        DROP CONSTRAINT medication_order_requests_patient_id_fkey;
    END IF;
END $$;

-- Create the foreign key relationship with explicit naming
-- This ensures Supabase can properly detect and use the relationship
ALTER TABLE medication_order_requests
ADD CONSTRAINT medication_order_requests_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Verify the relationship was created
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'medication_order_requests'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'patient_id';
