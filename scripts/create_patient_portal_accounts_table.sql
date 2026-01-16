-- Create Patient Portal Accounts Table
-- This table stores patient portal login credentials and account information

CREATE TABLE IF NOT EXISTS patient_portal_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  password_hash TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret_encrypted TEXT,
  last_login_at TIMESTAMPTZ,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMPTZ,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_patient_portal_accounts_patient 
    FOREIGN KEY (patient_id) 
    REFERENCES patients(id) 
    ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_portal_accounts_patient 
  ON patient_portal_accounts(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_portal_accounts_email 
  ON patient_portal_accounts(email);

-- Enable Row Level Security
ALTER TABLE patient_portal_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_portal_accounts
-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Patients can view own portal account" ON patient_portal_accounts;
DROP POLICY IF EXISTS "Service role can manage portal accounts" ON patient_portal_accounts;
DROP POLICY IF EXISTS "Providers can view portal accounts" ON patient_portal_accounts;

-- Policy: Patients can view their own portal account
CREATE POLICY "Patients can view own portal account"
  ON patient_portal_accounts
  FOR SELECT
  USING (auth.uid()::text = patient_id::text);

-- Policy: Service role can manage all portal accounts (for admin operations)
CREATE POLICY "Service role can manage portal accounts"
  ON patient_portal_accounts
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Authenticated providers/staff can view portal accounts (for patient chart)
CREATE POLICY "Providers can view portal accounts"
  ON patient_portal_accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM providers 
      WHERE providers.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.id = auth.uid()
    )
  );

-- Add comment to table
COMMENT ON TABLE patient_portal_accounts IS 'Stores patient portal login credentials and account status';
