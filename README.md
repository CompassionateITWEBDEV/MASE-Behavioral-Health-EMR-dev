# MASE Behavioral Health EMR (Development)

A comprehensive Electronic Medical Records system for behavioral health facilities, built with Next.js 16, React 19, and Supabase.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mase-922ac8f2/v0-behavioral-health-emr)

## Overview

This is the development repository for the MASE Behavioral Health EMR system. It includes:

- **Next.js 16.1.1** with React 19.2.3
- **Supabase** for backend services and database
- **TypeScript** for type safety
- **Vitest** for comprehensive testing
- **ESLint** for code quality
- **TanStack Query** for data fetching

## Recent Updates

### v0 Repository Merge (Latest)

Successfully merged all features and updates from the v0 repository (Next.js 14/React 18) into this development repository, including:

- **New API Routes:**
  - `/api/patient-payments` - Patient payment processing and tracking
  - `/api/nursing-assessment` - Nursing assessment management

- **New Database Migrations:**
  - `create-patient-payments.sql` - Patient payments table and account balance tracking
  - `create-nursing-assessment-tables.sql` - Nursing assessments, lab tests, UDS tests, and blood work orders

All merged code has been updated for Next.js 16 and React 19 compatibility, with proper TypeScript types and ESLint compliance.

## Tech Stack

- **Framework:** Next.js 16.1.1
- **UI Library:** React 19.2.3
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with RBAC
- **Testing:** Vitest 4.0.16
- **Code Quality:** ESLint 9.39.2, TypeScript 5.9.3
- **Data Fetching:** TanStack Query 5.90.16
- **UI Components:** Radix UI
- **Styling:** Tailwind CSS 4.1.18

## Development

### Prerequisites

- Node.js 20+
- pnpm
- Supabase account and project

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables (create `.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Run database migrations:
   ```bash
   # Apply migrations from scripts/ directory to your Supabase database
   ```

4. Start development server:
   ```bash
   pnpm dev
   ```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm check:types` - Run TypeScript type checking
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:coverage` - Run tests with coverage
- `pnpm check:all` - Run all checks (types, lint, test, build)

## Features

- **Patient Management** - Comprehensive patient records and charts
- **Appointment Scheduling** - Calendar-based appointment system
- **Clinical Documentation** - Notes, assessments, and care plans
- **Billing & Insurance** - Insurance verification and claims processing
- **OTP (Opioid Treatment Program)** - Specialized OTP billing and workflows
- **Telehealth** - Virtual visit management
- **Regulatory Compliance** - DEA compliance, reporting, and audits
- **Clinical Alerts** - Patient safety alerts and holds
- **Medication Management** - Prescriptions, dispensing, and reconciliation
- **Lab Integration** - Lab orders and results management
- **Patient Portal** - Patient-facing portal for access to records

## Testing

The project includes comprehensive test coverage using Vitest:

```bash
# Run all tests
pnpm test:run

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test
```

## Code Quality

All code must pass:

- TypeScript type checking (`pnpm check:types`)
- ESLint linting (`pnpm lint`)
- Unit tests (`pnpm test:run`)
- Production build (`pnpm build`)

Run all checks with:
```bash
pnpm check:all
```

## Deployment

The project is configured for deployment on Vercel. Ensure all environment variables are set in your Vercel project settings.

## License

Private - MASE Behavioral Health EMR
