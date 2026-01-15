# How to Create Medication Order for Patient
## Para makadispense sa Dosing Window

Ang error "No Active Medication Order" nagpasabot nga ang patient wala’y active medication order. Kinahanglan nimo i-create ang order una.

---

## Option 1: Create Order via SQL (Quick for Testing)

Run this sa Supabase SQL Editor:

```sql
-- Replace PATIENT_ID with actual patient ID gikan sa patients table
-- Replace PRESCRIBER_ID with doctor/staff ID

INSERT INTO medication_order (
  patient_id,
  daily_dose_mg,
  max_takehome,
  prescriber_id,
  status,
  start_date
) VALUES (
  'PATIENT_ID_HERE'::uuid,  -- Replace with actual patient UUID
  80.0,                      -- Daily dose in mg
  0,                         -- Max take-home bottles
  'physician-001',           -- Prescriber ID
  'active',                  -- Status must be 'active'
  CURRENT_DATE               -- Start date
);
```

**Example:**
```sql
-- First, find a patient ID
SELECT id, first_name, last_name FROM patients LIMIT 5;

-- Then create order (replace with actual patient_id)
INSERT INTO medication_order (
  patient_id,
  daily_dose_mg,
  max_takehome,
  prescriber_id,
  status,
  start_date
) VALUES (
  '04b5b5d2-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid,  -- Use actual patient ID
  80.0,
  0,
  'physician-001',
  'active',
  CURRENT_DATE
);
```

---

## Option 2: Find Patient with Existing Order

Para sa testing, mas sayon kung maghanap ka ug patient nga naa na’y active order:

```sql
-- Find patients with active medication orders
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  mo.daily_dose_mg,
  mo.status,
  mo.start_date
FROM patients p
INNER JOIN medication_order mo ON p.id = mo.patient_id
WHERE mo.status = 'active'
ORDER BY mo.created_at DESC
LIMIT 10;
```

Use one of these patients para sa testing.

---

## Option 3: Create Order via API

Kung naa ka sa UI, pwede ka mag-create via API:

**Endpoint:** `POST /api/dispensing/orders`

**Request Body:**
```json
{
  "patient_id": "patient-uuid-here",
  "daily_dose_mg": 80.0,
  "max_takehome": 0,
  "prescriber_id": "physician-001"
}
```

---

## What the Error Means:

**"No Active Medication Order"** = Ang patient wala’y record sa `medication_order` table nga `status = 'active'`

**Requirements:**
- Patient must exist sa `patients` table
- Must have record sa `medication_order` table
- Status must be `'active'`
- `start_date` must be today or in the past
- `stop_date` must be NULL or in the future

---

## Quick Test Script

Run this sa Supabase SQL Editor para ma-create ug test order:

```sql
-- Create medication order for first available patient
DO $$
DECLARE
  test_patient_id UUID;
BEGIN
  -- Get first patient
  SELECT id INTO test_patient_id FROM patients LIMIT 1;
  
  IF test_patient_id IS NOT NULL THEN
    -- Create active medication order
    INSERT INTO medication_order (
      patient_id,
      daily_dose_mg,
      max_takehome,
      prescriber_id,
      status,
      start_date
    ) VALUES (
      test_patient_id,
      80.0,
      0,
      'physician-001',
      'active',
      CURRENT_DATE
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created medication order for patient: %', test_patient_id;
  ELSE
    RAISE NOTICE 'No patients found. Create a patient first.';
  END IF;
END $$;
```

---

## Summary

**Para makadispense:**
1. ✅ Patient must exist
2. ✅ Patient must have active medication order
3. ✅ Order status = 'active'
4. ✅ Order start_date <= today

**Para sa testing:**
- Use patient nga naa na’y active order, OR
- Create order via SQL script above
