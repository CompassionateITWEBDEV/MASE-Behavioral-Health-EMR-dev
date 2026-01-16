-- Patient Transfer Schema
-- This schema supports both external and internal patient transfers

-- ============================================================================
-- PATIENT TRANSFERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS patient_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Transfer Type
  transfer_type VARCHAR(20) NOT NULL CHECK (transfer_type IN ('external', 'internal')),
  
  -- Facility Information
  transfer_from_facility VARCHAR(255),
  transfer_to_facility VARCHAR(255) NOT NULL,
  
  -- Contact Information (for external transfers)
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  
  -- Transfer Details
  transfer_reason TEXT NOT NULL,
  documents_included TEXT[],
  
  -- Transfer Status
  transfer_status VARCHAR(20) DEFAULT 'initiated' CHECK (transfer_status IN ('initiated', 'in_progress', 'completed', 'cancelled')),
  
  -- Document Delivery
  pdf_url TEXT,
  fax_sent BOOLEAN DEFAULT false,
  fax_confirmation_number VARCHAR(100),
  email_sent BOOLEAN DEFAULT false,
  email_delivery_status VARCHAR(50),
  
  -- Staff Tracking
  initiated_by UUID NOT NULL REFERENCES staff(id),
  completed_by UUID REFERENCES staff(id),
  
  -- Timestamps
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Additional Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PATIENT TRANSFER PRESCRIPTIONS TABLE
-- ============================================================================
-- Tracks which prescriptions were cancelled due to transfer
CREATE TABLE IF NOT EXISTS patient_transfer_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES patient_transfers(id) ON DELETE CASCADE,
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  prescription_status_before VARCHAR(20),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_patient_transfers_patient_id ON patient_transfers(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_transfers_status ON patient_transfers(transfer_status);
CREATE INDEX IF NOT EXISTS idx_patient_transfers_initiated_at ON patient_transfers(initiated_at);
CREATE INDEX IF NOT EXISTS idx_patient_transfer_prescriptions_transfer_id ON patient_transfer_prescriptions(transfer_id);
CREATE INDEX IF NOT EXISTS idx_patient_transfer_prescriptions_prescription_id ON patient_transfer_prescriptions(prescription_id);

-- ============================================================================
-- UPDATE PATIENTS TABLE
-- ============================================================================
-- Add transfer-related columns if they don't exist
DO $$ 
BEGIN
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'patients' AND column_name = 'status') THEN
    ALTER TABLE patients ADD COLUMN status VARCHAR(50) DEFAULT 'active';
  END IF;
  
  -- Add is_transferred column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'patients' AND column_name = 'is_transferred') THEN
    ALTER TABLE patients ADD COLUMN is_transferred BOOLEAN DEFAULT false;
  END IF;
  
  -- Add transferred_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'patients' AND column_name = 'transferred_at') THEN
    ALTER TABLE patients ADD COLUMN transferred_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add transferred_to column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'patients' AND column_name = 'transferred_to') THEN
    ALTER TABLE patients ADD COLUMN transferred_to VARCHAR(255);
  END IF;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE patient_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_transfer_prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view patient transfers" ON patient_transfers;
DROP POLICY IF EXISTS "Staff can create patient transfers" ON patient_transfers;
DROP POLICY IF EXISTS "Staff can update patient transfers" ON patient_transfers;
DROP POLICY IF EXISTS "Staff can view transfer prescriptions" ON patient_transfer_prescriptions;
DROP POLICY IF EXISTS "Staff can create transfer prescriptions" ON patient_transfer_prescriptions;

-- Policy: Staff can view all transfers
CREATE POLICY "Staff can view patient transfers" ON patient_transfers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid()
    )
  );

-- Policy: Staff can create transfers
CREATE POLICY "Staff can create patient transfers" ON patient_transfers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid()
    )
  );

-- Policy: Staff can update transfers
CREATE POLICY "Staff can update patient transfers" ON patient_transfers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid()
    )
  );

-- Similar policies for patient_transfer_prescriptions
CREATE POLICY "Staff can view transfer prescriptions" ON patient_transfer_prescriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid()
    )
  );

CREATE POLICY "Staff can create transfer prescriptions" ON patient_transfer_prescriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_patient_transfers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_patient_transfers_timestamp ON patient_transfers;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_patient_transfers_timestamp
  BEFORE UPDATE ON patient_transfers
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_transfers_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE patient_transfers IS 'Tracks patient transfers between facilities or within organization';
COMMENT ON TABLE patient_transfer_prescriptions IS 'Tracks prescriptions cancelled due to patient transfer';
COMMENT ON COLUMN patient_transfers.transfer_type IS 'external: transfer to different organization, internal: transfer within same organization';
COMMENT ON COLUMN patient_transfers.transfer_status IS 'initiated: transfer started, in_progress: documents being prepared, completed: transfer finished, cancelled: transfer cancelled';
