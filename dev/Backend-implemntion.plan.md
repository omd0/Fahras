# Backend Implementation Plan for Step Permissions & Controls

## Overview
Implement backend support for step-level permissions and controls in milestone templates, including role-action combinations and step management.

---

## 1. Database Schema Updates

### 1.1 Update `milestone_template_items` Table
- Add columns:
  - `allowed_roles` (JSON/TEXT) — array of roles: `['admin', 'faculty', 'student']`
  - `allowed_actions` (JSON/TEXT) — array of actions: `['start', 'pause', 'extend', 'view', 'edit', 'complete']`
- Migration:
  - Create migration to add these columns
  - Set defaults (NULL or empty arrays)
  - Consider indexes if querying by roles/actions

### 1.2 Data Type Considerations
- Option A: JSON column (PostgreSQL/MySQL 5.7+)
- Option B: TEXT with JSON encoding/decoding
- Option C: Separate pivot tables (normalized, more complex)

---

## 2. Model Updates

### 2.1 `MilestoneTemplateItem` Model
- Add `$fillable` entries: `allowed_roles`, `allowed_actions`
- Add `$casts`:
  - `allowed_roles` → `array`
  - `allowed_actions` → `array`
- Validation:
  - `allowed_roles`: array, each value in `['admin', 'faculty', 'student']`
  - `allowed_actions`: array, each value in `['start', 'pause', 'extend', 'view', 'edit', 'complete']`
- Accessors/Mutators (if needed):
  - Ensure arrays are properly serialized/deserialized

### 2.2 `MilestoneTemplate` Model
- Ensure relationship with items is correct
- Consider cascading deletes

---

## 3. API Endpoints Updates

### 3.1 Create Milestone Template (`POST /api/milestone-templates`)
- Request body:
  - Include `items` array with `allowed_roles` and `allowed_actions`
- Validation:
  - Validate each item's permissions
  - Ensure roles/actions are valid
- Response:
  - Return created template with items and permissions

### 3.2 Update Milestone Template (`PUT /api/milestone-templates/{id}`)
- Request body:
  - Include updated `items` with permissions
- Validation:
  - Same as create
- Logic:
  - Update existing items or create new ones
  - Handle item deletion
  - Preserve permissions on updates

### 3.3 Get Milestone Template (`GET /api/milestone-templates/{id}`)
- Response:
  - Include `allowed_roles` and `allowed_actions` for each item
- Ensure JSON arrays are properly formatted

### 3.4 List Milestone Templates (`GET /api/milestone-templates`)
- Response:
  - Include permissions in items (if needed, or make optional via query param)

---

## 4. Default Steps Implementation

### 4.1 Default Steps Logic
- When creating a new template:
  - If no items provided, create default steps:
    1. Start — roles: `['admin', 'faculty', 'student']`, actions: `['start', 'view']`
    2. Submit — roles: `['admin', 'faculty', 'student']`, actions: `['view', 'edit']`
    3. Review — roles: `['admin', 'faculty']`, actions: `['view', 'edit', 'complete']`
- Implementation:
  - In controller or service class
  - Make configurable (config file or database)

### 4.2 Configuration
- Create config file: `config/milestone_templates.php`
  - Define default steps structure
  - Allow customization per program/department

---

## 5. Permission Validation & Authorization

### 5.1 Permission Check Middleware/Service
- Create `PermissionService` or middleware:
  - Method: `canPerformAction($userId, $stepId, $action)`
  - Check:
    1. User's role
    2. Step's `allowed_roles`
    3. Step's `allowed_actions`
    4. Return boolean

### 5.2 Integration Points
- Project milestone operations:
  - Starting a milestone
  - Pausing/Resuming
  - Extending duration
  - Viewing project
  - Editing project
  - Completing milestone
- Apply permission checks before allowing operations

---

## 6. Order Management (Drag & Drop)

### 6.1 Update Order Endpoint
- `PATCH /api/milestone-templates/{id}/items/reorder`
- Request body:
  ```json
  {
    "item_orders": [
      {"item_id": 1, "order": 0},
      {"item_id": 2, "order": 1},
      {"item_id": 3, "order": 2}
    ]
  }
  ```
- Logic:
  - Validate all items belong to template
  - Update `order` for each item
  - Use transaction for atomicity

### 6.2 Automatic Ordering
- On item creation:
  - If no order specified, set to `max(order) + 1`
- On item deletion:
  - Reorder remaining items (optional)

---

## 7. Service Layer (Recommended)

### 7.1 `MilestoneTemplateService`
- Methods:
  - `createTemplate($data)` — handle defaults
  - `updateTemplate($id, $data)` — handle items/permissions
  - `validatePermissions($permissions)` — validate role-action combinations
  - `applyDefaultSteps($templateId)` — apply default steps

### 7.2 `PermissionService`
- Methods:
  - `checkPermission($userId, $stepId, $action)` — main check
  - `getUserRole($userId)` — get user's role
  - `getStepPermissions($stepId)` — get step's permissions

---

## 8. Validation Rules

### 8.1 Template Item Validation
- `title`: required, string, max length
- `description`: optional, string
- `estimated_days`: required, integer, min 0
- `is_required`: boolean
- `order`: required, integer, min 0
- `allowed_roles`: array, each in `['admin', 'faculty', 'student']`
- `allowed_actions`: array, each in `['start', 'pause', 'extend', 'view', 'edit', 'complete']`

### 8.2 Business Rules
- At least one step required
- Each step must have at least one allowed role
- Each step must have at least one allowed action
- Order must be unique within template

---

## 9. API Response Format

### 9.1 Standard Response Structure
```json
{
  "template": {
    "id": 1,
    "name": "Program Template",
    "items": [
      {
        "id": 1,
        "title": "Start",
        "allowed_roles": ["admin", "faculty", "student"],
        "allowed_actions": ["start", "view"],
        "order": 0,
        ...
      }
    ]
  }
}
```

---

## 10. Error Handling

### 10.1 Validation Errors
- Return 422 with detailed field errors
- Include messages for invalid roles/actions

### 10.2 Permission Errors
- Return 403 when user lacks permission
- Clear error message

### 10.3 Not Found Errors
- Return 404 for missing templates/items

---

## 11. Testing Considerations

### 11.1 Unit Tests
- Model validation
- Permission checking logic
- Default steps creation
- Order management

### 11.2 Integration Tests
- Create template with permissions
- Update template with permissions
- Permission checks for different roles
- Reordering items

### 11.3 Edge Cases
- Empty permissions arrays
- Invalid role/action values
- Duplicate orders
- Missing required fields

---

## 12. Migration Strategy

### 12.1 Existing Data
- Migration to add columns with defaults
- Backfill existing items (e.g., all roles, basic actions)
- Or mark as requiring update

### 12.2 Backward Compatibility
- Make new fields nullable/optional
- Handle missing permissions gracefully
- Provide defaults in API responses if needed

---

## 13. Documentation Updates

### 13.1 API Documentation
- Document new fields in requests/responses
- Permission system explanation
- Default steps behavior
- Reordering endpoint

### 13.2 Code Documentation
- Docblocks for new methods
- Permission logic explanation
- Default steps configuration

---

## 14. Performance Considerations

### 14.1 Database Queries
- Eager load items with templates
- Index on `template_id` and `order`
- Consider caching for permission checks

### 14.2 Optimization
- Batch permission checks
- Cache user roles
- Minimize N+1 queries

---

## 15. Security Considerations

### 15.1 Input Validation
- Sanitize role/action values
- Prevent SQL injection (use parameterized queries)
- Validate JSON structure

### 15.2 Authorization
- Verify user can modify templates
- Check permissions before operations
- Audit log for permission changes

---

## Implementation Priority

1. High Priority:
   - Database schema updates
   - Model updates with validation
   - Basic CRUD with permissions
   - Default steps logic

2. Medium Priority:
   - Permission checking service
   - Reordering endpoint
   - Integration with project milestones

3. Low Priority:
   - Caching
   - Advanced validation
   - Performance optimizations

---

This plan provides a roadmap for implementing the backend features. Adjust based on your framework and requirements.