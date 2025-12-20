# Frontend Implementation Plan - Project Follow Manager

## Overview

This plan outlines the frontend implementation for the Project Follow Manager system, including component structure, layout design, and integration with existing codebase patterns.

## Layout Design Recommendations (from Gemini)

### Visual Hierarchy & Spacing
- **Container Padding**: 24px (3 spacing units in MUI)
- **Card Spacing**: 16px between cards
- **Section Spacing**: 32px between major sections
- **Typography Scale**: h4 (24px) for page titles, h5 (20px) for section headers, body1 (16px) for content
- **Border Radius**: 12px for cards, 8px for buttons/chips

### Color Coding System
- **Completed**: `#4caf50` (Green)
- **In Progress**: `#2196f3` (Blue)
- **Not Started**: `#9e9e9e` (Gray)
- **Overdue**: `#f44336` (Red)
- **Blocked**: `#ff9800` (Orange)
- **Background**: `#f5f5f5` (Light Gray)
- **Card Background**: `#ffffff` (White)

### Component Structure

```
ProjectFollowPage
├── Header Section (with back button, title, project info)
├── Tabs Navigation
│   ├── Timeline Tab
│   │   └── MilestoneTimeline Component
│   ├── Activity Feed Tab
│   │   └── ActivityFeed Component
│   ├── Health Score Tab
│   │   └── ProjectHealthScore Component
│   ├── Flags Tab
│   │   └── ProjectFlags Component
│   └── Followers Tab
│       └── ProjectFollowers Component
└── Action Buttons (Follow/Unfollow, Apply Template)
```

## Implementation Phases

### Phase 1: Type Definitions & API Service

#### Step 1.1: Update TypeScript Types
**File**: `web/src/types/index.ts`

Add new interfaces:
```typescript
export interface MilestoneTemplate {
  id: number;
  name: string;
  description?: string;
  program_id?: number;
  department_id?: number;
  is_default: boolean;
  created_by_user_id: number;
  items?: MilestoneTemplateItem[];
  program?: Program;
  department?: Department;
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface MilestoneTemplateItem {
  id: number;
  template_id: number;
  title: string;
  description?: string;
  order: number;
  estimated_days: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  template_item_id?: number;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  order: number;
  dependencies?: number[];
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectActivity {
  id: number;
  project_id: number;
  user_id: number;
  activity_type: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  user?: User;
  created_at: string;
}

export interface ProjectFlag {
  id: number;
  project_id: number;
  flagged_by_user_id: number;
  flag_type: 'scope_creep' | 'technical_blocker' | 'team_conflict' | 'resource_shortage' | 'timeline_risk' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  is_confidential: boolean;
  resolved_at?: string;
  resolved_by_user_id?: number;
  resolution_notes?: string;
  flaggedBy?: User;
  resolvedBy?: User;
  created_at: string;
  updated_at: string;
}

export interface ProjectFollower {
  id: number;
  project_id: number;
  user_id: number;
  notification_preferences?: Record<string, boolean>;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface TimelineData {
  milestones: ProjectMilestone[];
  links: Array<{
    source: number;
    target: number;
    type: string;
  }>;
}
```

#### Step 1.2: Update API Service
**File**: `web/src/services/api.ts`

Add methods:
- `getMilestoneTemplates(params?)`
- `createMilestoneTemplate(data)`
- `updateMilestoneTemplate(id, data)`
- `deleteMilestoneTemplate(id)`
- `applyTemplateToProject(templateId, projectId, startDate)`
- `getProjectMilestones(projectId)`
- `createMilestone(projectId, data)`
- `updateMilestone(milestoneId, data)`
- `deleteMilestone(milestoneId)`
- `startMilestone(milestoneId)`
- `completeMilestone(milestoneId, notes?)`
- `reopenMilestone(milestoneId)`
- `updateMilestoneDueDate(milestoneId, dueDate)`
- `getMilestoneTimeline(projectId)`
- `getProjectActivities(projectId, params?)`
- `getProjectTimeline(projectId)`
- `followProject(projectId, preferences?)`
- `unfollowProject(projectId)`
- `getProjectFollowers(projectId)`
- `createProjectFlag(projectId, data)`
- `resolveFlag(flagId, notes?)`
- `getProjectFlags(projectId, params?)`

### Phase 2: Core Components

#### Step 2.1: Milestone Timeline Component
**File**: `web/src/components/project-follow/MilestoneTimeline.tsx`

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ Milestone Timeline                                          │
│ [Apply Template] [Add Custom Milestone]                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Milestone 1] ──→ [Milestone 2] ──→ [Milestone 3]         │
│   ✓ Completed      ⏳ In Progress    ⏸️ Not Started         │
│   Due: Jan 15      Due: Feb 20       Due: Mar 30            │
│   [████████] 100%  [████░░░░] 60%   [░░░░░░░░] 0%          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Horizontal scrollable timeline for many milestones
- Click milestone to open detail dialog
- Visual dependency arrows (SVG lines)
- Status icons with color coding
- Progress bars
- Due date with countdown/overdue indicator
- Responsive: Stack vertically on mobile

**Key Props**:
```typescript
interface MilestoneTimelineProps {
  projectId: number;
  milestones: ProjectMilestone[];
  links: TimelineLink[];
  onMilestoneClick: (milestone: ProjectMilestone) => void;
  onStart: (milestoneId: number) => void;
  onComplete: (milestoneId: number) => void;
  canEdit: boolean;
}
```

#### Step 2.2: Milestone Timeline Item Component
**File**: `web/src/components/project-follow/MilestoneTimelineItem.tsx`

**Layout**:
- Card-based design with status color border
- Status icon (CheckCircle, PlayCircle, PauseCircle, Block, Warning)
- Title and description
- Due date with relative time
- Progress bar
- Action buttons (Start, Complete, Edit, Delete)
- Dependency indicators

#### Step 2.3: Milestone Detail Dialog
**File**: `web/src/components/project-follow/MilestoneDetailDialog.tsx`

**Layout**:
- Full-screen dialog on mobile, centered dialog on desktop
- Form fields: Title, Description, Due Date, Dependencies
- Status selector
- Completion notes (if completed)
- Related files/comments section
- Activity history for this milestone

#### Step 2.4: Activity Feed Component
**File**: `web/src/components/project-follow/ActivityFeed.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Activity Feed                    [Filter: All ▼] [Date ▼]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Today                                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📝 John Doe changed status to "Under Review"         │  │
│  │    2 hours ago                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Yesterday                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 Jane Smith uploaded "proposal.pdf"                │  │
│  │    Yesterday at 3:45 PM                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Group by date (Today, Yesterday, This Week, Older)
- Filter by activity type
- Infinite scroll or pagination
- Click to navigate to related item
- Icons for each activity type

#### Step 2.5: Activity Item Component
**File**: `web/src/components/project-follow/ActivityItem.tsx`

**Layout**:
- Avatar + User name
- Activity icon (status change, file upload, comment, milestone)
- Activity description
- Timestamp (relative time)
- Link to related content

### Phase 3: Template Configuration

#### Step 3.1: Milestone Template Config Page
**File**: `web/src/pages/MilestoneTemplateConfigPage.tsx`

**Layout**:
- Similar to AccessControlPage structure
- List of templates with filters (Program, Department)
- Create/Edit template dialog
- Template preview

#### Step 3.2: Template Editor Component
**File**: `web/src/components/milestone-templates/TemplateEditor.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Template Editor                                             │
├─────────────────────────────────────────────────────────────┤
│ Name: [Research Project Template        ]                   │
│ Description: [Comprehensive research...]                    │
│ Program: [Select Program ▼]  Department: [Select Dept ▼]   │
│ ☑ Set as default template                                   │
│                                                              │
│ Milestone Items:                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 1. Literature Review        [14 days] [Required] [×] │   │
│ │ 2. Methodology Design       [14 days] [Required] [×] │   │
│ │ 3. Implementation           [30 days] [Required] [×] │   │
│ │ [+ Add Milestone]                                    │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ [Cancel] [Save Template]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Drag-and-drop reordering
- Add/Edit/Delete items
- Estimated days input
- Required/Optional toggle
- Preview timeline

### Phase 4: Health Score & Flags

#### Step 4.1: Project Health Score Component
**File**: `web/src/components/project-follow/ProjectHealthScore.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Project Health Score                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│         ┌─────────────┐                                     │
│         │     85      │                                     │
│         │   Good ✓    │                                     │
│         └─────────────┘                                     │
│                                                              │
│  Activity:        ████████████░░  25/25                     │
│  Milestones:      ██████████████  30/30                     │
│  Timeliness:      ████████████░░  20/20                     │
│  Engagement:      ████████░░░░░░  10/15                     │
│  Files:           ████████░░░░░░  8/10                      │
│                                                              │
│  Recommendations:                                           │
│  • Increase engagement with comments                        │
│  • Upload more project files                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Step 4.2: Project Flags Component
**File**: `web/src/components/project-follow/ProjectFlags.tsx`

**Layout**:
- List of flags with severity badges
- Filter by severity/type/resolved
- Create flag button
- Resolve flag dialog (admin/advisor only)

### Phase 5: Main Page Integration

#### Step 5.1: Project Follow Page
**File**: `web/src/pages/ProjectFollowPage.tsx`

**Structure** (similar to AccessControlPage):
- DashboardContainer wrapper
- Header with back button and project title
- Tabs: Timeline, Activity, Health, Flags, Followers
- Follow/Unfollow button in header
- Apply Template button (if no template applied)

#### Step 5.2: Integration with Project Detail Page
**File**: `web/src/pages/ProjectDetailPage.tsx`

**Changes**:
- Add "Follow & Track" tab
- Show milestone timeline preview in sidebar
- Quick health score widget
- Upcoming milestones widget

### Phase 6: Dashboard Integration

#### Step 6.1: Dashboard Updates
**Files**: Dashboard components

**Add**:
- "Followed Projects" section
- Upcoming milestones widget
- Health scores in project cards
- Recent activity from followed projects

## Component File Structure

```
web/src/
├── pages/
│   ├── ProjectFollowPage.tsx (NEW)
│   ├── MilestoneTemplateConfigPage.tsx (NEW)
│   └── ProjectDetailPage.tsx (UPDATE)
│
├── components/
│   ├── project-follow/
│   │   ├── MilestoneTimeline.tsx (NEW)
│   │   ├── MilestoneTimelineItem.tsx (NEW)
│   │   ├── MilestoneDetailDialog.tsx (NEW)
│   │   ├── ActivityFeed.tsx (NEW)
│   │   ├── ActivityItem.tsx (NEW)
│   │   ├── ProgressTimeline.tsx (NEW)
│   │   ├── ProjectHealthScore.tsx (NEW)
│   │   ├── ProjectFlags.tsx (NEW)
│   │   ├── ProjectFlagDialog.tsx (NEW)
│   │   └── ProjectFollowers.tsx (NEW)
│   │
│   └── milestone-templates/
│       ├── TemplateEditor.tsx (NEW)
│       ├── TemplateItemEditor.tsx (NEW)
│       ├── TemplateList.tsx (NEW)
│       └── TemplatePreview.tsx (NEW)
│
├── types/
│   └── index.ts (UPDATE - add new interfaces)
│
└── services/
    └── api.ts (UPDATE - add new API methods)
```

## Implementation Order

1. **Phase 1**: Types & API Service (foundation)
2. **Phase 2**: Core Timeline Components (main feature)
3. **Phase 3**: Template Configuration (admin tool)
4. **Phase 4**: Health Score & Flags (analytics)
5. **Phase 5**: Main Page Integration (user experience)
6. **Phase 6**: Dashboard Integration (overview)

## Key Design Patterns

### Status Color Mapping
```typescript
const statusColors = {
  completed: '#4caf50',
  in_progress: '#2196f3',
  not_started: '#9e9e9e',
  blocked: '#ff9800',
  overdue: '#f44336',
};
```

### Status Icons
```typescript
const statusIcons = {
  completed: <CheckCircle />,
  in_progress: <PlayCircle />,
  not_started: <PauseCircle />,
  blocked: <Block />,
  overdue: <Warning />,
};
```

### Responsive Breakpoints
- **Mobile**: < 600px - Stack timeline vertically
- **Tablet**: 600px - 960px - 2 columns
- **Desktop**: > 960px - Full horizontal timeline

## Testing Considerations

1. **Component Tests**: Test milestone timeline rendering, status changes
2. **Integration Tests**: Test template application, milestone creation
3. **E2E Tests**: Test complete workflow from template to completion

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly status announcements
- High contrast mode support
- Focus indicators

## Performance Optimizations

- Lazy load activity feed (pagination/infinite scroll)
- Memoize milestone timeline calculations
- Virtual scrolling for long milestone lists
- Debounce search/filter inputs
- Cache template data

