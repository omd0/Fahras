# File and Folder Renaming Plan

## Naming Conventions

### Backend (Laravel)
- **Folders**: `kebab-case` for multi-word, `lowercase` for single word
- **Files**: `PascalCase.php` for classes, `kebab-case.php` for utilities
- **Tests**: `tests/` directory (not `test/`)

### Frontend (React)
- **Folders**: `kebab-case` for multi-word directories
- **Files**: `PascalCase.tsx` for components

### Root Level
- **Documentation**: `UPPER_SNAKE_CASE.md` for important docs, `kebab-case.md` for feature docs
- **Scripts**: `kebab-case.sh` / `kebab-case.bat`

## Renaming Operations

### Phase 1: Backend Structure

1. **Rename test directory**
   - `api/test/` → `api/tests/utilities/` (move test scripts here temporarily)

2. **Convert scripts to Artisan commands** (create new structure)
   - `api/add_faculty_users.php` → `api/app/Console/Commands/AddFacultyUsers.php`
   - `api/create_user.php` → `api/app/Console/Commands/CreateUser.php`
   - `api/check-email-config.php` → `api/app/Console/Commands/CheckEmailConfig.php`
   - `api/cleanup_incomplete_users.php` → `api/app/Console/Commands/CleanupIncompleteUsers.php`
   - `api/fix_user_passwords.php` → `api/app/Console/Commands/FixUserPasswords.php`

3. **Organize test scripts**
   - Move test utilities from `api/test/` to `api/tests/utilities/`

### Phase 2: Frontend Structure

Frontend naming is mostly consistent. Minor improvements:
- Ensure all multi-word folders use kebab-case (already done)
- Verify component file names use PascalCase (already done)

### Phase 3: Root Level Organization

1. **Organize scripts**
   - Move to `scripts/` directory with subdirectories:
     - `scripts/deployment/` - deploy scripts
     - `scripts/development/` - dev scripts
     - `scripts/setup/` - setup scripts

2. **Organize documentation** (will be done in structure redesign)

## Execution Order

1. Backend test directory rename
2. Backend script organization
3. Root level script organization
4. Update all references
