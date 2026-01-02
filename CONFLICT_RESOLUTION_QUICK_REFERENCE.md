# Merge Conflict Resolution - Quick Reference Guide

## 🚨 Critical Actions Required

### Step 1: Backup Current State

```bash
# Create backup branch
git checkout -b backup-before-merge-resolution
git push origin backup-before-merge-resolution
git checkout main
```

### Step 2: Resolve Dependencies (CRITICAL - Do First)

#### package.json Resolution

**Accept main branch for:**

- All `devDependencies` section (preserves testing infrastructure)

**Update versions from Zail's branch:**

- `@ai-sdk/react`: `3.0.3` → `3.0.5`
- `@tanstack/react-query`: `^5.90.15` → `^5.90.16`
- `ai`: `6.0.3` → `6.0.5`
- `react-resizable-panels`: `^4.1.0` → `^4.1.1`
- `zod`: `^4.2.1` → `4.3.4`

**Keep in devDependencies:**

- `@tanstack/react-query-devtools`: `^5.91.2` (from main branch location)

#### pnpm-lock.yaml Resolution

```bash
# After resolving package.json:
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
```

#### tsconfig.json Resolution

Merge exclude arrays:

```json
"exclude": ["node_modules", "**/temp-patient-chart-backup.tsx"]
```

---

## 📋 Conflict Resolution Cheat Sheet

### Quick Accept Main Branch (8 files - Formatting only)

These files have formatting differences only. Accept main branch:

```bash
git checkout --ours app/api/discharge-summary/[id]/route.ts
git checkout --ours app/api/medications/[id]/discontinue/route.ts
git checkout --ours app/api/rehabilitation/hep/route.ts
git checkout --ours app/api/takehome/holds/[id]/override/route.ts
git checkout --ours app/api/workflows/tasks/[id]/complete/route.ts
git checkout --ours app/api/integrations/fax/route.ts
git checkout --ours app/api/integrations/sms/route.ts
git checkout --ours tsconfig.json
```

### Quick Accept Main Branch (Implementation - More Complete)

These files have more complete implementations in main:

```bash
git checkout --ours app/api/ai-assistant/drug-interactions/route.ts
git checkout --ours app/api/ai-assistant/route.ts
git checkout --ours app/patient-chart/page.tsx
git checkout --ours components/supervisory-review-workflow.tsx
```

### Manual Review Required (26 files)

These files need side-by-side comparison:

**API Routes (14 files):**

- `app/api/ai-clinical-assistant/route.ts`
- `app/api/appointments/[id]/route.ts`
- `app/api/appointments/route.ts`
- `app/api/clinical-alerts/[id]/acknowledge/route.ts`
- `app/api/clinical-alerts/route.ts`
- `app/api/dispensing/bottles/route.ts`
- `app/api/dispensing/orders/route.ts`
- `app/api/hie/registry/route.ts`
- `app/api/otp-billing/route.ts`
- `app/api/patient-portal/info/route.ts`
- `app/api/telehealth/route.ts`

**Pages (6 files):**

- `app/form-222/page.tsx`
- `app/intake-queue/page.tsx`
- `app/patient-portal/verify-dose/page.tsx`
- `app/pmp/page.tsx`
- `app/specialty/[id]/page.tsx`
- `app/subscription/page.tsx`

**Components (11 files):**

- `components/advanced-reporting-dashboard.tsx`
- `components/appointment-list.tsx`
- `components/billing-center-overview.tsx`
- `components/bottle-changeover-dialog.tsx`
- `components/care-team-management.tsx`
- `components/edit-patient-dialog.tsx`
- `components/otp-bundle-calculator.tsx`
- `components/patient-list.tsx` (check if PatientWithRelations type exists)
- `components/provider-credential-management.tsx`
- `components/serial-device-monitor.tsx`

---

## 🔄 Resolution Workflow

### Phase 1: Dependencies (30 minutes)

1. ✅ Resolve `package.json` manually
2. ✅ Resolve `tsconfig.json` (merge exclude arrays)
3. ✅ Delete and regenerate `pnpm-lock.yaml`
4. ✅ Test: `pnpm install && pnpm check:types`

### Phase 2: Quick Wins (15 minutes)

1. ✅ Accept main branch for formatting-only conflicts (8 files)
2. ✅ Accept main branch for more-complete implementations (4 files)
3. ✅ Test: `pnpm lint`

### Phase 3: Manual Review (4-6 hours)

1. ⚠️ Review each of 26 files side-by-side
2. ⚠️ Merge best features from both branches
3. ⚠️ Test after each file or small group
4. ⚠️ Run full test suite: `pnpm check:all`

---

## ✅ Testing Checklist

After resolving all conflicts:

```bash
# 1. Install dependencies
pnpm install

# 2. Type check
pnpm check:types

# 3. Lint
pnpm lint

# 4. Run tests
pnpm test:run

# 5. Build
pnpm build

# 6. Manual testing
pnpm dev
# Test key features in browser
```

---

## 🎯 Priority Order

1. **CRITICAL:** `package.json`, `pnpm-lock.yaml` (blocks everything)
2. **HIGH:** API routes with implementation differences (affects functionality)
3. **MEDIUM:** Components and pages (affects UI)
4. **LOW:** Formatting-only conflicts (cosmetic)

---

## 📝 Commit Strategy

```bash
# After Phase 1 (Dependencies)
git add package.json tsconfig.json pnpm-lock.yaml
git commit -m "resolve: merge conflicts - dependencies and config"

# After Phase 2 (Quick wins)
git add app/api/discharge-summary/[id]/route.ts app/api/medications/[id]/discontinue/route.ts ...
git commit -m "resolve: merge conflicts - formatting and complete implementations"

# After Phase 3 (Manual review - commit in logical groups)
git add app/api/ai-clinical-assistant/route.ts app/api/appointments/route.ts ...
git commit -m "resolve: merge conflicts - API routes"

git add components/*.tsx
git commit -m "resolve: merge conflicts - components"

git add app/*/page.tsx
git commit -m "resolve: merge conflicts - pages"
```

---

## ⚠️ Common Pitfalls to Avoid

1. ❌ **Don't remove testing dependencies** - They're essential
2. ❌ **Don't downgrade Next.js/React** - Main has the upgrade
3. ❌ **Don't accept simpler implementations** if main has more complete ones
4. ❌ **Don't skip testing** - Verify everything works
5. ❌ **Don't commit all at once** - Commit in phases for easier rollback

---

## 🆘 If Something Goes Wrong

```bash
# Abort merge and start over
git merge --abort

# Or reset to before merge
git reset --hard HEAD

# Restore from backup
git checkout backup-before-merge-resolution
```

---

## 📊 Conflict Summary

- **Total Conflicts:** 41 files
- **Critical:** 2 files (dependencies)
- **Moderate:** 30 files (implementation differences)
- **Low:** 6 files (formatting only)

**Estimated Total Time:** 5-7 hours

---

_Use this as a quick reference while resolving conflicts. For detailed analysis, see `MERGE_CONFLICT_ANALYSIS.md` and `CONFLICT_DETAILED_TABLE.md`._
