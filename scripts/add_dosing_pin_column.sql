-- Add dosing_pin_hash column to patients table for PIN verification
-- This allows patients to verify their identity at the dosing window

-- Check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'patients' 
    AND column_name = 'dosing_pin_hash'
  ) THEN
    ALTER TABLE patients 
    ADD COLUMN dosing_pin_hash VARCHAR(64);
    
    -- Add comment
    COMMENT ON COLUMN patients.dosing_pin_hash IS 'SHA-256 hash of patient 4-digit PIN for dosing window verification';
    
    RAISE NOTICE 'Column dosing_pin_hash added to patients table';
  ELSE
    RAISE NOTICE 'Column dosing_pin_hash already exists';
  END IF;
END $$;

-- Create index for faster PIN lookups (optional, but helpful)
CREATE INDEX IF NOT EXISTS idx_patients_dosing_pin ON patients(dosing_pin_hash) WHERE dosing_pin_hash IS NOT NULL;
