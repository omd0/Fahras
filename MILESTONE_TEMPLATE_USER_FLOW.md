# Milestone Template User Flow

## Overview

This document describes the complete user flow for milestone template management and selection in the Project Follow Manager system.

## User Roles & Access

### Admin
- **Full Access**: Create, edit, delete milestone templates
- **Access Route**: `/admin/milestone-templates`

### Students
- **Template Selection**: Can select from available templates when creating projects
- **Template Application**: Templates are automatically applied when project is created

### Faculty/Advisors
- **View Access**: Can view templates and see which templates are applied to projects
- **Project Management**: Can manage milestones in projects they advise

## Complete User Flow

### 1. Admin Creates Milestone Templates

**Step 1: Access Template Configuration**
- Admin navigates to Dashboard
- Clicks on "Milestone Templates" in admin menu (or navigate to `/admin/milestone-templates`)

**Step 2: Create New Template**
- Click "Create Template" button
- Fill in template details:
  - **Name**: e.g., "Graduate Project - Master's Thesis"
  - **Description**: Brief description of the template
  - **Program**: Select specific program or leave as "All Programs"
  - **Department**: Select specific department or leave as "All Departments"
  - **Default Template**: Check if this should be the default for the program/department

**Step 3: Add Milestone Items**
- Click "Add Item" for each milestone
- For each milestone, specify:
  - **Title**: e.g., "Literature Review", "Methodology Design"
  - **Description**: Optional detailed description
  - **Estimated Days**: Days from previous milestone (e.g., 14 days)
  - **Required**: Check if milestone is mandatory
- Reorder milestones using up/down arrows
- Edit or delete milestones as needed

**Step 4: Save Template**
- Click "Save Template"
- Template is now available for students to select

**Example Template Structure:**
```
1. Literature Review (14 days, Required)
2. Methodology Design (14 days, Required)
3. Implementation (30 days, Required)
4. Testing & Validation (14 days, Required)
5. Documentation (14 days, Required)
6. Final Review (7 days, Required)
```

### 2. Student Creates Project with Template

**Step 1: Start Project Creation**
- Student navigates to "Create Project" page
- Fills in basic project information:
  - Program (required)
  - Title
  - Abstract
  - Academic Year
  - Semester

**Step 2: Select Milestone Template**
- After selecting a Program, the "Milestone Template" section appears
- Student sees available templates for the selected program
- Options:
  - **Select a Template**: Choose from dropdown (e.g., "Graduate Project - Master's Thesis")
  - **No Template**: Leave as "No Template" to create milestones manually later

**Step 3: Preview Template**
- When a template is selected, a preview shows:
  - Template name and description
  - List of all milestones with:
    - Order number
    - Title
    - Estimated days
    - Required/Optional status
  - Information message about template application

**Step 4: Complete Project Creation**
- Fill in remaining project details (members, advisors, keywords, etc.)
- Click "Create Project"
- System automatically:
  1. Creates the project
  2. Applies the selected template (if one was chosen)
  3. Calculates milestone due dates based on:
     - Project creation date (start date)
     - Estimated days from template
  4. Creates all milestones in sequence

**Step 5: Access Project Follow Manager**
- After project creation, student can:
  - Navigate to project detail page
  - Click "Follow & Track" button
  - See all milestones in the Timeline tab
  - Start working on milestones

### 3. Template Application Logic

**Automatic Date Calculation:**
```
Start Date: Project creation date
Milestone 1 Due Date: Start Date + 14 days
Milestone 2 Due Date: Milestone 1 Due Date + 14 days
Milestone 3 Due Date: Milestone 2 Due Date + 30 days
... and so on
```

**Dependencies:**
- Milestones are created in order
- Each milestone depends on the previous one (unless specified otherwise)
- Students can modify dependencies later if needed

### 4. Template Management (Admin)

**Edit Template:**
- Click "Edit" icon on template card
- Modify template details
- Add/remove/reorder milestone items
- Save changes
- **Note**: Changes to templates don't affect existing projects

**Delete Template:**
- Click "Delete" icon on template card
- Confirm deletion
- **Note**: Only delete if no projects are using it

**Filter Templates:**
- Filter by Program
- Filter by Department
- View all templates or specific ones

**Set Default Template:**
- Check "Set as default template" when creating/editing
- Default templates appear first in student selection
- Only one default per program/department combination

## Approval Workflow (Future Enhancement)

For graduate projects or special cases, you may want to add approval:

1. **Student Requests Template Application**
   - Student selects template
   - Submits request for approval
   - Project created in "pending_template_approval" status

2. **Advisor/Admin Reviews**
   - Advisor sees pending request
   - Reviews template appropriateness
   - Approves or suggests alternative

3. **Template Applied**
   - Upon approval, template is automatically applied
   - Milestones created with approved dates

## Best Practices

### For Admins:
1. **Create Comprehensive Templates**: Include all standard milestones for program types
2. **Set Realistic Estimates**: Base estimated days on historical data
3. **Mark Critical Milestones**: Use "Required" flag for mandatory milestones
4. **Regular Updates**: Review and update templates based on feedback
5. **Documentation**: Add clear descriptions to help students understand each milestone

### For Students:
1. **Review Template Before Selection**: Preview all milestones to ensure they fit your project
2. **Customize After Creation**: You can always add custom milestones or modify existing ones
3. **Track Progress**: Use the Timeline tab to monitor milestone completion
4. **Update Due Dates**: Adjust dates if your timeline changes

## Troubleshooting

**Q: Template not showing for my program?**
- A: Check if admin has created templates for your program
- A: Templates are program-specific, ensure you selected the correct program

**Q: Can I change template after project creation?**
- A: You can manually add/remove milestones, but the original template structure remains
- A: Consider creating a new project if you need a completely different template

**Q: Can I use multiple templates?**
- A: No, one template per project. But you can add custom milestones in addition to template milestones

**Q: What if I don't select a template?**
- A: You can create milestones manually later in the Project Follow Manager

## Technical Details

### API Endpoints Used:
- `GET /milestone-templates` - List templates (filtered by program/department)
- `POST /milestone-templates` - Create template (admin only)
- `PUT /milestone-templates/{id}` - Update template (admin only)
- `DELETE /milestone-templates/{id}` - Delete template (admin only)
- `POST /milestone-templates/{id}/apply-to-project` - Apply template to project

### Database Tables:
- `milestone_templates` - Template definitions
- `milestone_template_items` - Individual milestones in templates
- `project_milestones` - Actual milestones created for projects
- `projects` - Links to `milestone_template_id` (optional)

