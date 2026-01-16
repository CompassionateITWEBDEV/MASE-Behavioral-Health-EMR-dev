# Patient Transfer Process Flow

## Overview
This document describes the complete situational flow for transferring patients within or outside the facility.

## Transfer Types

### 1. External Facility Transfer
**Scenario**: Patient is being transferred to a different organization/facility

### 2. Internal Transfer  
**Scenario**: Patient is being transferred within the same organization (different department/counselor/location)

---

## Complete Transfer Flow

### STEP 1: Initiate Transfer
**User Action**: Staff navigates to Patient Transfer page

**System Action**:
- Loads list of active patients
- Displays patient selection dropdown
- Shows patient information card when selected

**Validation**:
- ✅ Patient must be selected
- ✅ Patient must be active

---

### STEP 2: Select Transfer Destination
**User Action**: Choose transfer type (External/Internal)

**System Action**:
- If **External**: Shows additional fields (Facility Name, Contact Person, Phone, Email)
- If **Internal**: No additional fields required

**Validation**:
- ✅ Transfer type must be selected
- ✅ If External: Facility name is required
- ✅ Reason for transfer is required

---

### STEP 3: Select Documents
**User Action**: Choose which documents to include in transfer packet

**Available Documents**:
- Demographics & Insurance
- Medical History
- Medication List ⚠️ (Should include active prescriptions)
- Allergy List
- Immunization Records
- Lab Results (30 days)
- Vital Signs
- Progress Notes
- Treatment Plans
- Assessments
- Consents & Authorizations
- 42 CFR Part 2 Consent
- Discharge Summary

**System Action**:
- Displays checklist of all available documents
- Allows Select All / Deselect All
- Shows count of selected documents

---

### STEP 4: Pre-Transfer Checks
**System Action** (Before generating packet):

1. **Check Active Prescriptions**
   - Query `prescriptions` table for patient
   - Find all prescriptions with status: `pending` or `sent`
   - Display warning if pending prescriptions exist

2. **Check Active Medications**
   - Query `patient_medications` table
   - Include in Medication List document

3. **Check Active Encounters**
   - Query `encounters` table
   - Warn if patient has scheduled future appointments

4. **Check Pending Tasks**
   - Query `tasks` or `workflows` table
   - Warn if patient has incomplete tasks

---

### STEP 5: Generate Transfer Packet
**User Action**: Click "Generate & Download PDF" or "Generate & Send via Fax"

**System Action**:

#### 5.1 Create Transfer Record
```sql
INSERT INTO patient_transfers (
  patient_id,
  transfer_type, -- 'external' or 'internal'
  transfer_from_facility,
  transfer_to_facility,
  contact_person,
  contact_phone,
  contact_email,
  transfer_reason,
  documents_included,
  transfer_status, -- 'initiated', 'in_progress', 'completed', 'cancelled'
  initiated_by,
  initiated_at
)
```

#### 5.2 Generate PDF Packet
- Cover sheet with patient demographics
- Transfer authorization form
- Selected medical documents (from Step 3)
- 42 CFR Part 2 compliance documentation
- Audit trail information

#### 5.3 Handle Prescriptions
**If External Transfer**:
- Cancel all `pending` prescriptions
- Update status to `cancelled`
- Set `cancelled_reason` = "Patient transferred to external facility"
- Set `cancelled_at` = current timestamp
- Set `cancelled_by` = current user

**If Internal Transfer**:
- Keep prescriptions active (no cancellation)
- Add note: "Patient transferred internally"

#### 5.4 Update Patient Status
```sql
UPDATE patients SET
  status = 'transferred',
  is_active = false, -- or keep true for internal
  transferred_at = NOW(),
  transferred_to = transfer_to_facility
WHERE id = patient_id
```

#### 5.5 Create Audit Trail
- Log transfer action in `audit_log` or `staff_activity_log`
- Record: who, when, what, why

---

### STEP 6: Send Transfer Packet
**Option A: Download PDF**
- Generate PDF file
- Download to user's computer
- User manually sends to receiving facility

**Option B: Send via Fax**
- Generate PDF
- Upload to fax service
- Send to receiving facility fax number
- Update transfer record with fax confirmation

**Option C: Send via Secure Email**
- Generate PDF
- Encrypt PDF (42 CFR Part 2 compliance)
- Send to receiving facility email
- Track delivery status

---

### STEP 7: Post-Transfer Actions
**System Action** (After transfer is completed):

1. **Update E-Prescribing Dashboard**
   - Show transfer status badge on prescriptions
   - Filter out transferred patients (optional)
   - Display transfer date and destination

2. **Close Active Encounters**
   - Mark future appointments as cancelled
   - Reason: "Patient transferred"

3. **Archive Patient Records**
   - Move to archived status
   - Keep records accessible for compliance

4. **Notify Staff**
   - Send notification to assigned counselor
   - Send notification to prescribing physician
   - Update caseload assignments

---

## Situational Scenarios

### Scenario 1: External Transfer with Pending Prescriptions
**Flow**:
1. User selects patient
2. System detects 3 pending prescriptions
3. System shows warning: "Patient has 3 pending prescriptions. These will be cancelled upon transfer."
4. User confirms transfer
5. System cancels all pending prescriptions
6. System generates transfer packet with medication list
7. System updates patient status to "transferred"

### Scenario 2: Internal Transfer (Same Organization)
**Flow**:
1. User selects patient
2. User selects "Internal Transfer"
3. No external facility details needed
4. System keeps prescriptions active
5. System updates assigned counselor/department
6. System generates internal transfer packet
7. Patient status remains "active" but with new assignment

### Scenario 3: Transfer with Active Treatment Plan
**Flow**:
1. User selects patient
2. System detects active treatment plan
3. System includes treatment plan in documents
4. System generates transfer packet
5. System closes treatment plan with transfer note
6. System updates patient status

### Scenario 4: Emergency Transfer
**Flow**:
1. User selects patient
2. User marks as "Emergency Transfer"
3. System prioritizes transfer packet generation
4. System sends immediate notification
5. System includes all documents (no selection needed)
6. System expedites fax/email delivery

---

## Integration Points

### E-Prescribing Dashboard
- **Display**: Transfer status badge on prescription table
- **Filter**: Option to hide transferred patients
- **Action**: Show transfer date and destination
- **Warning**: Alert if trying to send prescription to transferred patient

### Patient Dashboard
- **Display**: Transfer status indicator
- **History**: Show transfer history timeline
- **Documents**: Link to transfer packet PDF

### Medication Management
- **List**: Include transferred medications in transfer packet
- **Status**: Update medication status if patient transferred externally

---

## Database Schema

### patient_transfers Table
```sql
CREATE TABLE patient_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  transfer_type VARCHAR(20) NOT NULL CHECK (transfer_type IN ('external', 'internal')),
  transfer_from_facility VARCHAR(255),
  transfer_to_facility VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  transfer_reason TEXT NOT NULL,
  documents_included TEXT[],
  transfer_status VARCHAR(20) DEFAULT 'initiated' CHECK (transfer_status IN ('initiated', 'in_progress', 'completed', 'cancelled')),
  pdf_url TEXT,
  fax_sent BOOLEAN DEFAULT false,
  fax_confirmation_number VARCHAR(100),
  email_sent BOOLEAN DEFAULT false,
  initiated_by UUID NOT NULL REFERENCES staff(id),
  completed_by UUID REFERENCES staff(id),
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### patients Table Updates
```sql
ALTER TABLE patients ADD COLUMN IF NOT EXISTS 
  status VARCHAR(50) DEFAULT 'active',
  is_transferred BOOLEAN DEFAULT false,
  transferred_at TIMESTAMP WITH TIME ZONE,
  transferred_to VARCHAR(255);
```

---

## Compliance Requirements

### 42 CFR Part 2
- ✅ Transfer authorization form required
- ✅ Patient consent verification
- ✅ Secure document transmission
- ✅ Audit trail maintenance

### HIPAA
- ✅ Minimum necessary information
- ✅ Secure transmission (encrypted email/fax)
- ✅ Access logging
- ✅ Patient right to access records

---

## Error Handling

### Validation Errors
- Missing required fields → Show error message
- Invalid email/phone → Show format error
- No documents selected → Prevent generation

### System Errors
- PDF generation failure → Retry with error logging
- Database save failure → Rollback and notify user
- Fax/Email send failure → Queue for retry

### Business Logic Errors
- Patient already transferred → Show warning
- No active prescriptions → Skip cancellation step
- Missing documents → Warn but allow generation

---

## User Interface Flow

```
[Patient Transfer Page]
    ↓
[Select Patient] → [Patient Info Card]
    ↓
[Select Transfer Type] → [External Fields] OR [Internal (no fields)]
    ↓
[Enter Transfer Reason] → [Required Field]
    ↓
[Select Documents] → [Checklist with Select All/Deselect All]
    ↓
[Pre-Transfer Checks] → [Warnings if applicable]
    ↓
[Generate Transfer Packet] → [PDF Generation]
    ↓
[Send Transfer] → [Download PDF] OR [Send via Fax] OR [Send via Email]
    ↓
[Post-Transfer Actions] → [Update Status] → [Cancel Prescriptions] → [Notify Staff]
    ↓
[Transfer Complete] → [Confirmation Message]
```

---

## Next Steps for Implementation

1. ✅ Create database schema for `patient_transfers` table
2. ✅ Implement transfer packet PDF generation
3. ✅ Add prescription cancellation logic
4. ✅ Update patient status on transfer
5. ✅ Add transfer status to e-prescribing dashboard
6. ✅ Create transfer history view
7. ✅ Add fax/email integration
8. ✅ Implement audit trail logging

