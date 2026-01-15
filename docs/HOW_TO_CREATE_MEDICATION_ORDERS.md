# How to Create Medication Orders (Real System Data)
## Unsaon pag-create ug real medication orders sa system

Ang medication orders dapat gikan sa actual workflow sa system, dili gikan sa seed data. Ania ang steps:

---

## Prerequisites (Kinahanglan Una)

### 1. Setup Database
Run these scripts sa Supabase SQL Editor (in order):

```sql
-- Step 1: Create the table
-- File: scripts/create_medication_order_requests.sql

-- Step 2: Setup RLS policies (IMPORTANT - para makasave ang orders)
-- File: scripts/add_medication_order_requests_rls.sql

-- Step 3: Fix patient relationship
-- File: scripts/fix_medication_order_requests_relationship.sql
```

### 2. Ensure You Have:
- ✅ At least 1 patient sa `patients` table
- ✅ At least 1 physician sa `staff` table (with role = 'doctor')
- ✅ Patient must have an active medication order sa `medication_order` table

---

## How to Create Orders Through the System

### Step 1: Go to Dosing Window
1. Navigate to `/dosing-window` sa browser
2. Search for a patient (must have active medication order)

### Step 2: Select Patient
1. Click on a patient from search results
2. Patient details will load
3. Make sure patient has an active medication order (shown sa patient info)

### Step 3: Submit Medication Order Request
1. Look for **"Medication Order Request"** button or dialog
2. Click to open the order request form
3. Fill out:
   - **Order Type**: Increase or Decrease
   - **Current Dose**: Auto-filled from patient's medication order
   - **Requested Dose**: Enter new dose amount
   - **Clinical Justification**: Reason for the change
   - **Select Physician**: Choose from dropdown
   - **Nurse Signature**: Enter PIN or use biometric
4. Click **"Submit Order Request"**

### Step 4: Order Appears in Order Management
1. Go to `/order-management` page
2. The order will appear sa **"Pending"** tab
3. Physician can review and approve/deny

---

## What Happens Behind the Scenes

1. **Nurse submits order** → Calls `/api/medication-order-requests` POST endpoint
2. **API validates** → Checks patient, physician, required fields
3. **Order saved** → Inserted into `medication_order_requests` table
4. **Status set** → `pending_physician_review` (if signed) or `draft` (if not signed)
5. **Order appears** → Shows up in Order Management page

---

## Requirements for Order Creation

### Patient Must Have:
- ✅ Active record sa `patients` table
- ✅ Active medication order sa `medication_order` table
  - This provides the `current_dose_mg` value

### Staff Must Have:
- ✅ At least 1 physician (role = 'doctor') sa `staff` table
- ✅ Nurse must be authenticated/logged in

### Order Request Needs:
- ✅ `patient_id` - From selected patient
- ✅ `order_type` - "increase" or "decrease"
- ✅ `current_dose_mg` - From patient's medication_order
- ✅ `requested_dose_mg` - Entered by nurse
- ✅ `clinical_justification` - Reason for change
- ✅ `physician_id` - Selected physician
- ✅ `nurse_id` - Current logged-in nurse
- ✅ `nurse_signature` - PIN or biometric (optional but recommended)

---

## Troubleshooting

### "No patients found"
- Create a patient first sa patients table
- Or use existing patient

### "Patient does not have an active medication order"
- Create medication order for patient first
- Go to Medications page or use API to create order

### "No physicians found"
- Make sure you have staff with role = 'doctor'
- Run `scripts/fix_staff_rls_for_physician_query.sql` if physicians not loading

### "Failed to submit order request"
- Check browser console (F12) for errors
- Verify RLS policies are set up (`add_medication_order_requests_rls.sql`)
- Make sure you're authenticated/logged in

### Order not appearing in Order Management
- Check if order was created (browser console logs)
- Verify RLS policies allow SELECT on `medication_order_requests`
- Check if order status is `pending_physician_review` (not `draft`)

---

## Creating Test Data (If Needed)

If you need to test the workflow but don't have real patients yet:

### Create a Patient:
```sql
INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email)
VALUES ('Test', 'Patient', '1985-01-15', 'Male', '555-0100', 'test@example.com')
RETURNING id;
```

### Create Medication Order for Patient:
```sql
INSERT INTO medication_order (patient_id, daily_dose_mg, max_takehome, prescriber_id, status, start_date)
VALUES (
  'PATIENT_ID_FROM_ABOVE',
  80.0,
  0,
  'physician-001',
  'active',
  CURRENT_DATE
);
```

### Create Staff/Physician:
```sql
-- Make sure you have at least one doctor in staff table
INSERT INTO staff (id, first_name, last_name, email, role, is_active, employee_id)
VALUES (
  gen_random_uuid(),
  'Dr. John',
  'Smith',
  'doctor@example.com',
  'doctor',
  true,
  'DOC001'
)
ON CONFLICT DO NOTHING;
```

---

## Summary

**Para makita ang data sa Order Management:**
1. ✅ Setup database (table + RLS policies)
2. ✅ Have patients with active medication orders
3. ✅ Have physicians in staff table
4. ✅ Nurses create orders through Dosing Window
5. ✅ Orders automatically appear in Order Management

**NO SEED DATA NEEDED** - All data comes from real system workflow!
