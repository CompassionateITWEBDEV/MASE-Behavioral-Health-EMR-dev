# Medication Order Management - Data Flow Explanation

## 📍 WHERE THE DATA COMES FROM

### 1. **Data Source: Supabase Database**
   - **Table**: `medication_order_requests`
   - **Location**: `app/order-management/page.tsx` → `fetchOrders()` function (line 38)

### 2. **Data Flow Path**:
```
User opens page 
  → useEffect triggers (line 34)
  → fetchOrders() function called (line 38)
  → Supabase query: medication_order_requests table (line 61-63)
  → Fetches orders with patient relationship (line 63)
  → Fetches patient names separately (line 95-107)
  → Fetches staff names separately (line 113-125)
  → Merges all data (line 129-138)
  → Updates orders state (line 145)
  → React re-renders page
  → Orders displayed in UI (line 347)
```

### 3. **Specific Code Locations**:

#### **Data Fetching** (Line 38-147):
- **Function**: `fetchOrders()`
- **What it does**:
  1. Creates Supabase client
  2. Checks user session/authentication
  3. Queries `medication_order_requests` table
  4. Filters by status (pending/approved/denied)
  5. Fetches patient data from `patients` table
  6. Fetches staff data from `staff` table
  7. Merges everything into `orders` state

#### **Data Display** (Line 347-413):
- **Component**: `{orders.map((order) => ...)}`
- **What it shows**:
  - Order type (INCREASE/DECREASE)
  - Patient name
  - Current dose → Requested dose
  - Clinical justification
  - Submitted by (staff name)
  - Review Order button

#### **Empty State** (Line 415-423):
- **Component**: `{orders.length === 0 && ...}`
- **Shows**: "No orders found for this status"

---

## 🔍 WHY NO DATA IS DISPLAYING

### Possible Issues:

1. **Authentication Problem** (Most Likely)
   - Error: "Auth session missing!"
   - **Cause**: User not authenticated → RLS policies block access
   - **Solution**: Run `scripts/add_medication_order_requests_rls.sql` in Supabase

2. **RLS Policies Blocking**
   - `medication_order_requests` table might not have RLS policies
   - `patients` table RLS might be too restrictive
   - **Solution**: Run the RLS scripts

3. **Wrong Filter Status**
   - Default filter: `"pending"` (line 31)
   - Maps to: `"pending_physician_review"` (line 55)
   - If no orders have this status → empty result
   - **Check**: Try clicking "All Orders" tab

4. **Table Doesn't Exist or Has No Data**
   - Table: `medication_order_requests`
   - **Check**: Run in Supabase SQL Editor:
     ```sql
     SELECT COUNT(*) FROM medication_order_requests;
     SELECT * FROM medication_order_requests LIMIT 5;
     ```

5. **Query Error Being Silently Caught**
   - Errors are logged to console but might not show in UI
   - **Check**: Browser DevTools → Console tab

---

## 🛠️ HOW TO DEBUG

### Step 1: Check Browser Console
1. Open page: `localhost:3001/order-management`
2. Press F12 → Console tab
3. Look for logs starting with `[Order Management]`:
   - `User session active:` - Shows if authenticated
   - `Orders query result:` - Shows how many orders fetched
   - `Successfully fetched X orders` - Confirms data loaded
   - `Error fetching patient data:` - Shows patient fetch errors

### Step 2: Check Network Tab
1. F12 → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to Supabase
4. Check if they return 200 (success) or 401/403 (auth error)

### Step 3: Check Database
Run in Supabase SQL Editor:
```sql
-- Check if table exists and has data
SELECT COUNT(*) as total_orders FROM medication_order_requests;

-- Check orders by status
SELECT status, COUNT(*) 
FROM medication_order_requests 
GROUP BY status;

-- See sample orders
SELECT id, patient_id, status, order_type, created_at 
FROM medication_order_requests 
ORDER BY created_at DESC 
LIMIT 10;
```

### Step 4: Check RLS Policies
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'medication_order_requests';

-- Check existing policies
SELECT * FROM pg_policies 
WHERE tablename = 'medication_order_requests';
```

---

## ✅ QUICK FIXES TO TRY

1. **Run RLS Script**:
   - Supabase Dashboard → SQL Editor
   - Run: `scripts/add_medication_order_requests_rls.sql`

2. **Try "All Orders" Tab**:
   - Click "All Orders" tab instead of "Pending"
   - This removes the status filter

3. **Check Authentication**:
   - Make sure you're logged in
   - Check if session exists in console logs

4. **Verify Table Has Data**:
   - Run SQL query to check if orders exist
   - If empty, you need to create test data

---

## 📊 DATA STRUCTURE

### Order Object Structure:
```javascript
{
  id: "uuid",
  patient_id: "uuid",
  order_type: "increase" | "decrease",
  current_dose_mg: 0,
  requested_dose_mg: 100,
  clinical_justification: "text",
  status: "pending_physician_review" | "approved" | "denied",
  nurse_id: "string",
  physician_id: "string",
  created_at: "timestamp",
  // Added by code:
  patients: { first_name: "John", last_name: "Doe" },
  staff: { first_name: "Jane", last_name: "Nurse" }
}
```

---

## 🎯 SUMMARY

**Data Source**: `medication_order_requests` table in Supabase  
**Fetch Function**: `fetchOrders()` in `app/order-management/page.tsx`  
**Display Component**: Line 347 - maps through `orders` array  
**Empty State**: Line 415 - shows when `orders.length === 0`  

**Most Likely Issue**: Authentication/RLS blocking access to data
