---
name: Patient Management Refactor
overview: ""
todos: []
---

# Patient Management System Refactoring Plan

## Current State Analysis

### Architecture Overview

The `/patients` page (`app/patients/page.tsx`) currently:

- Fetches data directly from Supabase in the component
- Uses `any[]` types for patient data
- Has duplicate Patient interface definitions across 38+ files
- Lacks proper error boundaries and loading states
- No pagination for large patient lists
- Patient detail page (`app/patients/[id]/page.tsx`) uses mock data
- Inconsistent data fetching (mix of API routes and direct Supabase calls)

### Key Components

- **Main Page**: `app/patients/page.tsx` - Entry point with stats and tabs
- **Patient List**: `components/patient-list.tsx` - Displays filtered patient cards
- **Patient Stats**: `components/patient-stats.tsx` - Shows summary statistics
- **Add Dialog**: `components/add-patient-dialog.tsx` - Create new patients
- **Edit Dialog**: `components/edit-patient-dialog.tsx` - Update patient info
- **Delete Dialog**: `components/delete-patient-dialog.tsx` - Remove patients
- **Detail Page**: `app/patients/[id]/page.tsx` - Individual patient chart (uses mock data)

### API Routes

- `app/api/patients/route.ts` - GET (list) and POST (create) with comprehensive logging
- `app/api/intake/patients/route.ts` - Intake-specific patient operations

## Refactoring Phases

### Phase 1: Type System & Data Models

**Goal**: Establish consistent, centralized type definitions**Tasks**:

1. Create `types/patient.ts` with comprehensive Patient interface

- Include all fields from database schema
- Define related types (Appointment, Assessment, Medication)
- Create utility types (PatientWithRelations, PatientFilters, etc.)

2. Create `types/api.ts` for API response types

- PaginatedResponse, ApiError, etc.

3. Update all components to use centralized types

- Replace 38+ duplicate Patient interfaces
- Update `app/patients/page.tsx`, `components/patient-list.tsx`, dialogs

4. Add Zod schemas for runtime validation

- `schemas/patient.ts` for form validation and API validation

**Files to Create**:

- `types/patient.ts`
- `types/api.ts`
- `schemas/patient.ts`

**Files to Update**:

- `app/patients/page.tsx`
- `components/patient-list.tsx`
- `components/add-patient-dialog.tsx`
- `components/edit-patient-dialog.tsx`
- `components/delete-patient-dialog.tsx`
- `components/patient-stats.tsx`

### Phase 2: Data Fetching & API Layer

**Goal**: Standardize data fetching patterns and create reusable hooks**Tasks**:

1. Create custom React hooks for patient operations

- `hooks/use-patients.ts` - List, search, filter patients
- `hooks/use-patient.ts` - Single patient with relations
- `hooks/use-patient-stats.ts` - Statistics aggregation
- `hooks/use-patient-mutations.ts` - Create, update, delete operations

2. Enhance API routes with proper error handling

- Add pagination support to GET `/api/patients`
- Add PUT endpoint for updates: `app/api/patients/[id]/route.ts`
- Add DELETE endpoint: `app/api/patients/[id]/route.ts`
- Add GET single patient: `app/api/patients/[id]/route.ts`

3. Implement React Query for caching and state management

- Setup QueryClient provider
- Configure query keys and cache invalidation
- Add optimistic updates for mutations

**Files to Create**:

- `hooks/use-patients.ts`
- `hooks/use-patient.ts`
- `hooks/use-patient-stats.ts`
- `hooks/use-patient-mutations.ts`
- `app/api/patients/[id]/route.ts` (GET, PUT, DELETE)
- `lib/react-query/provider.tsx`

**Files to Update**:

- `app/api/patients/route.ts` (add pagination)
- `app/patients/page.tsx` (use hooks)
- All patient components (use hooks)

### Phase 3: State Management & Performance

**Goal**: Optimize performance and implement proper state management**Tasks**:

1. Implement pagination

- Server-side pagination in API routes
- Infinite scroll or page-based navigation in UI
- Virtual scrolling for large lists

2. Add caching strategy

- React Query cache configuration
- Stale-while-revalidate pattern
- Background refetching

3. Optimize data fetching

- Reduce over-fetching (select only needed fields)
- Batch related queries
- Implement request deduplication

4. Add loading states and skeletons

- Skeleton components for patient cards
- Progressive loading for stats
- Optimistic UI updates

**Files to Create**:

- `components/ui/skeleton-patient-card.tsx`
- `components/ui/pagination.tsx`
- `lib/utils/query-keys.ts`

**Files to Update**:

- `app/api/patients/route.ts` (pagination)
- `components/patient-list.tsx` (pagination UI)
- `app/patients/page.tsx` (loading states)

### Phase 4: Error Handling & User Experience

**Goal**: Robust error handling and improved UX**Tasks**:

1. Implement error boundaries

- `components/error-boundary.tsx` for patient pages
- Fallback UI components

2. Add comprehensive error handling

- API error types and messages
- User-friendly error messages
- Retry mechanisms

3. Improve form validation

- Real-time validation feedback
- Field-level error messages
- Prevent invalid submissions

4. Add success/error notifications

- Toast notifications for all operations
- Loading indicators during mutations
- Confirmation dialogs for destructive actions

**Files to Create**:

- `components/error-boundary.tsx`
- `components/patient-error-fallback.tsx`
- `lib/utils/error-handler.ts`

**Files to Update**:

- All patient dialogs (validation)
- `app/patients/page.tsx` (error boundary)
- API routes (error responses)

### Phase 5: Patient Detail Page Implementation

**Goal**: Replace mock data with real database integration**Tasks**:

1. Create API route for patient detail

- GET `/api/patients/[id]` with all relations
- Include appointments, assessments, medications, vitals, etc.

2. Implement patient detail page components

- Demographics tab with real data
- Insurance tab with verification status
- Medication tab with current prescriptions
- ASAM criteria tab with assessment history
- Alerts & Tags tab with real alerts
- Clinical Notes tab with progress notes
- Consents tab with consent tracking
- Documents tab with file management
- History tab with timeline

3. Add edit capabilities

- Inline editing for demographics
- Quick actions (call, schedule, new note)
- Document upload functionality

**Files to Create**:

- `components/patient-detail/demographics-tab.tsx`
- `components/patient-detail/insurance-tab.tsx`
- `components/patient-detail/medication-tab.tsx`
- `components/patient-detail/asam-tab.tsx`
- `components/patient-detail/alerts-tab.tsx`
- `components/patient-detail/notes-tab.tsx`
- `components/patient-detail/consents-tab.tsx`
- `components/patient-detail/documents-tab.tsx`
- `components/patient-detail/history-tab.tsx`

**Files to Update**:

- `app/patients/[id]/page.tsx` (replace mock data)
- `app/api/patients/[id]/route.ts` (add relations)

### Phase 6: Code Organization & Reusability

**Goal**: Improve maintainability and code reuse**Tasks**:

1. Extract reusable components

- `components/patient/patient-card.tsx` - Reusable patient card
- `components/patient/patient-avatar.tsx` - Patient avatar with initials
- `components/patient/patient-badge.tsx` - Risk/status badges
- `components/patient/patient-actions.tsx` - Action buttons

2. Create utility functions

- `lib/utils/patient-helpers.ts` - Age calculation, name formatting, etc.
- `lib/utils/patient-filters.ts` - Filter logic
- `lib/utils/patient-sort.ts` - Sorting utilities

3. Organize component structure

- Move patient-specific components to `components/patient/`
- Group related components together
- Create index files for clean imports

4. Add comprehensive JSDoc comments

- Document all functions and components
- Add usage examples
- Document prop types

**Files to Create**:

- `components/patient/patient-card.tsx`
- `components/patient/patient-avatar.tsx`
- `components/patient/patient-badge.tsx`
- `components/patient/patient-actions.tsx`
- `components/patient/index.ts`
- `lib/utils/patient-helpers.ts`
- `lib/utils/patient-filters.ts`
- `lib/utils/patient-sort.ts`

**Files to Update**:

- `components/patient-list.tsx` (use extracted components)
- All patient components (add JSDoc)

### Phase 7: Testing & Documentation

**Goal**: Ensure reliability and maintainability**Tasks**:

1. Add unit tests

- Test utility functions
- Test custom hooks
- Test component rendering

2. Add integration tests

- Test API routes
- Test user flows (create, edit, delete)

3. Update documentation

- README for patient management
- API documentation
- Component usage guide

4. Performance testing

- Load testing with large datasets
- Optimize slow queries
- Add performance monitoring

**Files to Create**:

- `__tests__/utils/patient-helpers.test.ts`
- `__tests__/hooks/use-patients.test.ts`
- `__tests__/components/patient-list.test.tsx`
- `docs/patient-management.md`

## Implementation Order