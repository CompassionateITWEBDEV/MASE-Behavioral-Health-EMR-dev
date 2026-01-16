# Medication Order Management - Setup Guide
## Unsa ang kinahanglan buhaton para makita ang data

Para makita ang data sa Medication Order Management, kinahanglan nimo i-run ang mosunod nga scripts sa Supabase SQL Editor:

## Step 1: Ensure Table Exists
Run this first to create the table (if it doesn't exist):
```sql
-- File: scripts/create_medication_order_requests.sql
```

## Step 2: Fix RLS Policies
Run this to allow authenticated users to view the data:
```sql
-- File: scripts/add_medication_order_requests_rls.sql
```

## Step 3: Fix Patient Relationship (if needed)
Run this to ensure the foreign key relationship works:
```sql
-- File: scripts/fix_medication_order_requests_relationship.sql
```

## Step 4: Create Real Orders Through System
**NO SEED DATA** - Orders must be created through the actual system workflow.

See `docs/HOW_TO_CREATE_MEDICATION_ORDERS.md` for complete instructions.

---

## Quick Setup (All in One)

If you want to run everything at once, here's the order:

1. ✅ `scripts/create_medication_order_requests.sql` - Creates the table
2. ✅ `scripts/add_medication_order_requests_rls.sql` - Sets up RLS policies
3. ✅ `scripts/fix_medication_order_requests_relationship.sql` - Fixes patient relationship
4. ✅ Create orders through Dosing Window (`/dosing-window`) - Real system workflow

---

## What Each Script Does

### 1. create_medication_order_requests.sql
- Creates the `medication_order_requests` table
- Defines columns: patient_id, order_type, doses, status, etc.
- Creates indexes for faster queries

### 2. add_medication_order_requests_rls.sql
- Enables Row Level Security (RLS) on the table
- Creates policies to allow authenticated users to:
  - View orders (SELECT)
  - Insert orders (INSERT)
  - Update orders (UPDATE)
  - Delete orders (DELETE)

### 3. fix_medication_order_requests_relationship.sql
- Ensures the foreign key relationship to `patients` table works
- This allows the UI to fetch patient names automatically

### 4. seed_medication_order_requests_data.sql
- Inserts 6 sample medication orders:
  - 3 pending review orders
  - 2 approved orders
  - 1 denied order
- Creates a sample patient if none exists
- This is what makes data appear in the UI

---

## After Running Scripts

1. **Create orders through system workflow:**
   - Go to `/dosing-window`
   - Select a patient (must have active medication order)
   - Submit medication order request
   - See `docs/HOW_TO_CREATE_MEDICATION_ORDERS.md` for step-by-step

2. **View orders:**
   - Go to `/order-management`
   - Orders will appear in appropriate tabs (Pending/Approved/Denied)

---

## Troubleshooting

### No data showing?
1. Check browser console (F12) for errors
2. Verify you're logged in (authenticated)
3. Check if RLS policies were created:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'medication_order_requests';
   ```

### Error: "relation does not exist"
- Run `create_medication_order_requests.sql` first

### Error: "permission denied"
- Run `add_medication_order_requests_rls.sql`

### Empty table?
- Create orders through Dosing Window (`/dosing-window`)
- See `docs/HOW_TO_CREATE_MEDICATION_ORDERS.md` for instructions

---

## Creating Real Orders

**Orders MUST be created through system workflow, not seed data:**

1. **Dosing Window** (`/dosing-window`) - Primary method for nurses to submit order requests
2. **API** - `/api/medication-order-requests` POST endpoint (used by Dosing Window)
3. **See guide** - `docs/HOW_TO_CREATE_MEDICATION_ORDERS.md` for complete instructions

---

## Summary

**Para makita ang data, kinahanglan:**
1. ✅ Table exists (`create_medication_order_requests.sql`)
2. ✅ RLS policies set up (`add_medication_order_requests_rls.sql`)
3. ✅ Create orders through Dosing Window (`/dosing-window`)

**Most important:** Create orders through real system workflow - NO SEED DATA!
See `docs/HOW_TO_CREATE_MEDICATION_ORDERS.md` for complete guide.
