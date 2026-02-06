# Task 14: Create Project Wizard E2E Test

## Status: ⚠️ BLOCKED (Test Structure Complete)

### Deliverables
✅ `tests/e2e/student/create-project.spec.ts` created
✅ 3 test cases implemented per TEST_WORKFLOWS.md Section 8.8
✅ Proper Playwright selectors (getByLabel, getByRole)
✅ Test structure verified (runs with `.skip()`)

### Test Cases
1. **Main Flow**: Complete 3-step wizard (Basic Info → Team → Files/Submit)
2. **Validation**: Required field validation in Step 1
3. **Navigation**: Back/forward navigation through wizard steps

### Blocker: NextAuth Authentication
**Issue**: Login fails with "CredentialsSignin" error in test environment

**Evidence**:
- User exists in database (verified via seed.ts)
- Credentials are correct (password: 'password', hashed with bcrypt)
- User status is 'active'
- Manual login in browser works fine
- Playwright error snapshot shows "CredentialsSignin" alert

**Investigation**:
- Checked auth.ts configuration ✓
- Verified database seeding ✓
- Tested with multiple approaches (login helper, direct fill, API)
- All approaches fail at same point (NextAuth authorize)

### Resolution Path
1. Debug NextAuth error handling to get exact failure reason
2. Options:
   - Fix NextAuth test environment configuration
   - Use Playwright `storageState` to persist auth
   - Use API endpoint to set session cookie directly
   - Mock authentication state for tests

### Files Modified
- `tests/e2e/student/create-project.spec.ts` (new, 143 lines)
- `tests/fixtures/auth.ts` (updated selectors from type to id)
- `.sisyphus/notepads/test-automation/learnings.md` (documented findings)
- `.sisyphus/notepads/test-automation/issues.md` (documented blocker)

### When Auth is Fixed
Simply remove `.skip()` from all 3 tests and run:
```bash
npx playwright test tests/e2e/student/create-project.spec.ts
```

Expected: 3 passed
