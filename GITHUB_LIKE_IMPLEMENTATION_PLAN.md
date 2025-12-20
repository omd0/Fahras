# GitHub-Like Interface Implementation Plan
## Senior Developer Strategic Roadmap

> **Vision**: Transform Fahras from a traditional project management system into a modern, GitHub-like platform that maintains academic workflow context while providing the intuitive navigation and powerful features users expect from modern development platforms.

---

## Executive Summary

This plan outlines the strategic implementation of a GitHub/Forgejo-like interface for the Fahras academic project management system. The goal is to create an intuitive, powerful interface that feels familiar to developers while serving the unique needs of academic research workflows.

### Key Principles
1. **Familiar UX Patterns**: Leverage GitHub's proven interface patterns that users already understand
2. **Academic Context Preservation**: Maintain academic-specific workflows (advisors, milestones, approvals)
3. **Progressive Enhancement**: Build incrementally, ensuring each phase delivers value
4. **Component Reusability**: Maximize reuse of existing Material-UI v7 components
5. **API-First Architecture**: Design for RESTful API constraints (no GraphQL dependency)

---

## Phase 1: Foundation & Navigation Architecture

### 1.1 Repository-Style Project Layout

**Strategic Decision**: Transform the current `ProjectDetailPage` into a repository-style interface with tabbed navigation.

#### Current State Analysis
- Single-page layout with all information visible
- Linear information architecture
- Limited file browsing capabilities
- No clear separation between content types

#### Target State
```
┌─────────────────────────────────────────────────────────────┐
│ [Back] Project Title                    [Star] [Fork] [Code]│
│ ─────────────────────────────────────────────────────────── │
│ [Code] [Issues] [Pull Requests] [Actions] [Projects] [Wiki] │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ [File Browser] │ [README.md Preview]                        │
│                │                                             │
│ 📁 src/        │ # Project Title                            │
│ 📁 docs/        │                                             │
│ 📁 data/        │ This is the main project description...    │
│ 📄 README.md    │                                             │
│ 📄 LICENSE      │ ## Features                                 │
│                │ - Feature 1                                 │
│                │ - Feature 2                                 │
│                │                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Implementation Strategy
- **Tab Navigation Component**: Create reusable `RepositoryTabs` component
  - Tabs: Code, Issues, Pull Requests (Review Requests), Actions, Projects, Wiki
  - Sticky header with project metadata
  - Breadcrumb navigation
  - Action buttons (Star, Fork, Code dropdown)

- **File Browser Component**: `RepositoryFileBrowser`
  - Tree view of project files
  - File type icons
  - File size and last modified info
  - Click to view file content
  - Breadcrumb navigation within files

- **File Viewer Component**: `FileContentViewer`
  - Syntax highlighting for code files
  - Markdown rendering for `.md` files
  - PDF preview for documents
  - Image preview
  - Raw file download option
  - Blame view (attribution) for text files

#### Technical Considerations
- **State Management**: Use Zustand store for file tree state
- **Virtual Scrolling**: Implement for large file trees (react-window)
- **Lazy Loading**: Load file contents on-demand
- **Caching Strategy**: Cache file tree structure, invalidate on updates

### 1.2 Global Navigation & Command Palette

**Strategic Decision**: Implement a GitHub-style global navigation with command palette for power users.

#### Command Palette (`Ctrl+K` / `Cmd+K`)
- **Search Functionality**:
  - Projects (fuzzy search)
  - Files within current project
  - Issues/Tasks
  - Users
  - Commands (New Project, New Issue, etc.)

- **Context Awareness**:
  - Inside project: Prioritize project-specific results
  - Global: Search across all accessible projects
  - Recent items: Show recently viewed files/projects

- **Implementation**:
  - Use `react-command-palette` or custom implementation
  - Debounced search with API integration
  - Keyboard navigation (arrow keys, enter)
  - Result highlighting

#### Global Header Redesign
- **Left Section**: Logo + Global navigation (Dashboard, Explore, Issues, Pull Requests)
- **Center Section**: Search bar (with command palette trigger)
- **Right Section**: Notifications, User menu, Settings

---

## Phase 2: Core Repository Features

### 2.1 Review Requests (Academic Pull Requests)

**Strategic Decision**: Implement a pull request-like workflow for academic review processes.

#### Concept Mapping
- **Pull Request** → **Review Request**
- **Branch** → **Experimental Draft** (simplified)
- **Merge** → **Approve & Integrate**
- **Review Comments** → **Inline Feedback**

#### Workflow Design
```
Student creates Review Request
  ↓
Selects files/changes to review
  ↓
Assigns reviewers (advisors, peers)
  ↓
Reviewers provide inline comments
  ↓
Request changes / Approve
  ↓
Student addresses feedback
  ↓
Final approval → Changes integrated
```

#### Component Architecture
- **ReviewRequestList**: List of all review requests (open/closed/merged)
- **ReviewRequestDetail**: Full review request view with file diffs
- **ReviewRequestForm**: Create new review request
- **FileDiffViewer**: Side-by-side or unified diff view
- **InlineCommentThread**: Comment threads on specific lines
- **ReviewStatusBadge**: Visual status indicator

#### Backend Requirements
- New API endpoints for review requests
- File versioning system (if not already present)
- Diff calculation service
- Comment threading system

### 2.2 Task Tracker (Academic Issues)

**Strategic Decision**: Transform generic issues into academic task tracking.

#### Issue Types (Academic Context)
- **Hypothesis**: Research hypothesis to validate
- **Experiment**: Experimental work to conduct
- **Data Analysis**: Analysis tasks
- **Literature Gap**: Literature review items
- **Writing Task**: Writing assignments
- **Milestone**: Project milestone tracking
- **Bug**: Technical issues (for code projects)
- **Enhancement**: Feature improvements

#### Component Architecture
- **IssueList**: Filterable, sortable list of issues
- **IssueDetail**: Full issue view with comments, labels, assignees
- **IssueForm**: Create/edit issue
- **IssueFilters**: Advanced filtering (type, status, assignee, labels)
- **IssueLabels**: Customizable label system
- **IssueMilestones**: Link issues to project milestones

#### Features
- **Labels**: Color-coded tags (e.g., "urgent", "blocked", "research", "writing")
- **Assignees**: Assign to team members or advisors
- **Milestones**: Link to project milestones
- **Comments**: Discussion threads
- **Activity Timeline**: Track issue lifecycle
- **Search**: Full-text search across issues

### 2.3 File-Centric Activity Feed

**Strategic Decision**: Implement file-level activity tracking for granular audit trails.

#### Component Design
- **FileActivityPanel**: Side panel showing file-specific activity
- **ActivityItem**: Individual activity entry (version, comment, review)
- **ActivityFilter**: Filter by activity type, user, date range

#### Activity Types
- File upload/update
- Comments on file
- Review request changes
- Version history
- Access logs (for sensitive files)

---

## Phase 3: Advanced Features

### 3.1 Research Trail (Visual Commit History)

**Strategic Decision**: Create a non-linear visualization of project evolution.

#### Visualization Approach
- **Timeline Graph**: Interactive D3.js or vis.js graph
- **Nodes**: Major versions, milestones, review requests
- **Edges**: Dependencies, relationships
- **Branches**: Experimental drafts diverging from main

#### Component Architecture
- **ResearchTrailView**: Main visualization component
- **TrailNode**: Individual node in the graph
- **TrailControls**: Zoom, pan, filter controls
- **NodeDetailPanel**: Details when clicking a node

#### Data Requirements
- Project version history
- Milestone completions
- Review request timeline
- File change history

### 3.2 Attribution View (Git Blame for Papers)

**Strategic Decision**: Implement paragraph-level attribution for collaborative writing.

#### Implementation Strategy
- **Text Parser**: Parse markdown/text files into paragraphs
- **Version Tracking**: Track which user modified each paragraph
- **Attribution Overlay**: Hover/click to see author and timestamp
- **Color Coding**: Visual indication of authorship

#### Use Cases
- Multi-author paper writing
- Contribution tracking
- Academic integrity verification

### 3.3 Project Dashboard README

**Strategic Decision**: Transform static README into dynamic dashboard.

#### Widget System
- **Syntax**: `[[widget:milestones]]`, `[[widget:activity]]`, etc.
- **Available Widgets**:
  - Milestone progress
  - Recent activity
  - Team members
  - Open issues
  - Health score
  - Upcoming deadlines

#### Component Architecture
- **READMEViewer**: Markdown renderer with widget parsing
- **WidgetRegistry**: Registry of available widgets
- **WidgetComponents**: Individual widget implementations

---

## Phase 4: User Experience Enhancements

### 4.1 Researcher Profile & Contribution Graph

**Strategic Decision**: Create GitHub-style user profiles with academic context.

#### Profile Components
- **ProfileHeader**: Avatar, name, bio, location
- **ContributionGraph**: Activity heatmap (file updates, comments, reviews)
- **ProjectsSection**: User's projects (created, contributed, forked)
- **SkillsSection**: Research areas, technologies (tags)
- **ActivityTimeline**: Recent activity across projects

#### Contribution Metrics
- Files updated
- Comments made
- Review requests created/reviewed
- Issues opened/closed
- Projects created/contributed

### 4.2 Experimental Drafts (Simplified Branches)

**Strategic Decision**: Implement simplified branching for non-technical users.

#### Concept
- Create a "draft" copy of files
- Work independently without affecting main
- Submit as Review Request when ready
- Merge back to main after approval

#### Component Architecture
- **DraftManager**: List and manage experimental drafts
- **DraftCreator**: Create new draft from current files
- **DraftViewer**: View draft with comparison to main
- **DraftMerger**: Merge draft via Review Request

### 4.3 Publication Releases

**Strategic Decision**: Create immutable snapshots for submissions/publications.

#### Release Features
- **Snapshot Creation**: Capture exact state of project
- **Release Notes**: Document what's included
- **DOI Integration**: Link to external DOI if published
- **Download Bundle**: ZIP of all files at release point
- **Release Tags**: Version tags (v1.0, v2.0, etc.)

#### Component Architecture
- **ReleaseList**: List of all releases
- **ReleaseDetail**: Release information and download
- **ReleaseCreator**: Create new release form

---

## Phase 5: Integration & Polish

### 5.1 Advisor's Command Center

**Strategic Decision**: Create specialized dashboard for advisors.

#### Dashboard Components
- **Pending Reviews**: Review requests awaiting action
- **Project Overview**: All supervised projects
- **Student Activity**: Activity levels across projects
- **Upcoming Milestones**: Deadline tracking
- **Blockers**: Projects with flags or issues

### 5.2 Context-Aware Onboarding

**Strategic Decision**: Implement interactive tours for new project members.

#### Implementation
- **Tour System**: Use `react-joyride` or similar
- **Tour Configuration**: `TOUR.md` file in project
- **Contextual Triggers**: Show tour when joining project
- **Skip/Resume**: Allow users to skip or resume tours

### 5.3 Research Fork (Derivative Projects)

**Strategic Decision**: Enable forking projects for derivative work.

#### Fork Workflow
- **Fork Action**: Create copy of project
- **Fork Relationship**: Maintain link to original
- **Independent Development**: Forked project evolves independently
- **Contribution Back**: Option to contribute changes back

---

## Technical Architecture

### Component Structure
```
web/src/
├── components/
│   ├── repository/
│   │   ├── RepositoryLayout.tsx          # Main repository container
│   │   ├── RepositoryTabs.tsx             # Tab navigation
│   │   ├── RepositoryHeader.tsx           # Project header with actions
│   │   ├── FileBrowser.tsx                # File tree browser
│   │   ├── FileContentViewer.tsx         # File content display
│   │   ├── FileDiffViewer.tsx             # Diff view for reviews
│   │   └── BlameView.tsx                   # Attribution view
│   │
│   ├── review-requests/
│   │   ├── ReviewRequestList.tsx          # List of review requests
│   │   ├── ReviewRequestDetail.tsx        # Full review request view
│   │   ├── ReviewRequestForm.tsx          # Create/edit form
│   │   ├── InlineCommentThread.tsx        # Comment threads
│   │   └── ReviewStatusBadge.tsx          # Status indicators
│   │
│   ├── issues/
│   │   ├── IssueList.tsx                  # Issue list with filters
│   │   ├── IssueDetail.tsx                # Full issue view
│   │   ├── IssueForm.tsx                  # Create/edit form
│   │   ├── IssueFilters.tsx                # Advanced filtering
│   │   └── IssueLabels.tsx                # Label management
│   │
│   ├── activity/
│   │   ├── ActivityFeed.tsx               # Global activity feed
│   │   ├── FileActivityPanel.tsx          # File-specific activity
│   │   ├── ActivityItem.tsx               # Individual activity entry
│   │   └── ResearchTrailView.tsx          # Visual timeline
│   │
│   ├── profile/
│   │   ├── UserProfile.tsx                # User profile page
│   │   ├── ContributionGraph.tsx          # Activity heatmap
│   │   └── ProfileProjects.tsx            # User's projects
│   │
│   └── navigation/
│       ├── GlobalHeader.tsx               # Global navigation
│       ├── CommandPalette.tsx             # Command palette
│       └── Breadcrumbs.tsx                # Breadcrumb navigation
│
├── pages/
│   ├── RepositoryPage.tsx                 # Main repository view
│   ├── ReviewRequestPage.tsx               # Review request detail
│   ├── IssuePage.tsx                      # Issue detail
│   └── UserProfilePage.tsx                # User profile
│
├── services/
│   ├── repositoryService.ts               # Repository API calls
│   ├── reviewRequestService.ts            # Review request API
│   ├── issueService.ts                    # Issue API
│   └── fileService.ts                     # File operations
│
└── store/
    ├── repositoryStore.ts                 # Repository state
    ├── reviewRequestStore.ts               # Review request state
    └── issueStore.ts                      # Issue state
```

### API Endpoint Design

#### Repository Endpoints
```
GET    /api/projects/{id}/files              # Get file tree
GET    /api/projects/{id}/files/{path}      # Get file content
GET    /api/projects/{id}/files/{path}/blame # Get attribution
GET    /api/projects/{id}/readme            # Get README
PUT    /api/projects/{id}/readme            # Update README
```

#### Review Request Endpoints
```
GET    /api/projects/{id}/review-requests           # List review requests
POST   /api/projects/{id}/review-requests          # Create review request
GET    /api/review-requests/{id}                   # Get review request
PUT    /api/review-requests/{id}                    # Update review request
POST   /api/review-requests/{id}/comments           # Add comment
POST   /api/review-requests/{id}/approve            # Approve
POST   /api/review-requests/{id}/request-changes    # Request changes
POST   /api/review-requests/{id}/merge              # Merge changes
```

#### Issue Endpoints
```
GET    /api/projects/{id}/issues                    # List issues
POST   /api/projects/{id}/issues                    # Create issue
GET    /api/issues/{id}                              # Get issue
PUT    /api/issues/{id}                              # Update issue
POST   /api/issues/{id}/comments                     # Add comment
POST   /api/issues/{id}/close                        # Close issue
POST   /api/issues/{id}/reopen                       # Reopen issue
```

### State Management Strategy

#### Zustand Stores
- **Repository Store**: File tree, current file, navigation state
- **Review Request Store**: Review requests, comments, diff state
- **Issue Store**: Issues, filters, selected issue
- **Activity Store**: Activity feed, file activity
- **User Store**: User profiles, contribution data

### Performance Considerations

1. **File Tree Virtualization**: Use `react-window` for large file trees
2. **Lazy Loading**: Load file contents on-demand
3. **Caching**: Cache file trees and frequently accessed files
4. **Debouncing**: Debounce search and filter inputs
5. **Pagination**: Paginate large lists (issues, review requests)
6. **Code Splitting**: Lazy load heavy components (diff viewer, graph visualizations)

### Accessibility

1. **Keyboard Navigation**: Full keyboard support for all interactions
2. **ARIA Labels**: Proper labeling for screen readers
3. **Focus Management**: Logical focus order
4. **Color Contrast**: WCAG AA compliance
5. **Screen Reader Announcements**: Status changes announced

---

## Implementation Phases & Priorities

### Phase 1: Foundation (Weeks 1-3)
**Priority: Critical**
- Repository-style layout
- File browser
- File viewer
- Basic navigation

**Deliverables**:
- Users can browse project files
- View file contents
- Navigate between files

### Phase 2: Core Features (Weeks 4-6)
**Priority: High**
- Review Requests
- Task Tracker (Issues)
- Activity Feed

**Deliverables**:
- Review workflow functional
- Issue tracking operational
- Activity tracking visible

### Phase 3: Advanced Features (Weeks 7-9)
**Priority: Medium**
- Research Trail visualization
- Attribution View
- Dynamic README widgets

**Deliverables**:
- Visual project history
- Collaborative writing support
- Enhanced project overview

### Phase 4: UX Enhancements (Weeks 10-12)
**Priority: Medium**
- User profiles
- Experimental Drafts
- Publication Releases

**Deliverables**:
- Professional user profiles
- Simplified branching
- Release management

### Phase 5: Integration (Weeks 13-14)
**Priority: Low**
- Advisor dashboard
- Onboarding tours
- Project forking

**Deliverables**:
- Specialized advisor tools
- Improved onboarding
- Derivative project support

---

## Risk Assessment & Mitigation

### Technical Risks

1. **File Tree Performance**
   - **Risk**: Large projects with many files may cause performance issues
   - **Mitigation**: Implement virtual scrolling, lazy loading, pagination

2. **Diff Calculation**
   - **Risk**: Calculating diffs for large files may be slow
   - **Mitigation**: Server-side diff calculation, caching, incremental updates

3. **State Management Complexity**
   - **Risk**: Complex state interactions may cause bugs
   - **Mitigation**: Clear store boundaries, comprehensive testing, TypeScript strict mode

### UX Risks

1. **Learning Curve**
   - **Risk**: Users unfamiliar with GitHub may find interface confusing
   - **Mitigation**: Onboarding tours, tooltips, help documentation, gradual rollout

2. **Academic Workflow Disruption**
   - **Risk**: New interface may disrupt existing workflows
   - **Mitigation**: Maintain backward compatibility, provide migration path, user training

### Business Risks

1. **Development Time**
   - **Risk**: Feature scope may exceed timeline
   - **Mitigation**: Phased approach, MVP first, iterative improvements

2. **User Adoption**
   - **Risk**: Users may resist change
   - **Mitigation**: Early user feedback, beta testing, gradual rollout

---

## Success Metrics

### User Engagement
- Time spent in repository view
- Number of review requests created
- Issues opened and closed
- File views and downloads

### Workflow Efficiency
- Time to complete review cycle
- Issue resolution time
- File collaboration frequency

### User Satisfaction
- User feedback scores
- Feature adoption rates
- Support ticket reduction

---

## Next Steps

1. **Review & Approval**: Get stakeholder approval for plan
2. **Backend Planning**: Coordinate with backend team for API design
3. **Design Mockups**: Create detailed UI mockups for key components
4. **Prototype**: Build minimal prototype of repository view
5. **User Testing**: Test prototype with target users
6. **Iterate**: Refine based on feedback
7. **Implementation**: Begin Phase 1 development

---

## Conclusion

This plan provides a comprehensive roadmap for transforming Fahras into a GitHub-like platform while maintaining its academic context. The phased approach ensures incremental value delivery, and the focus on reusable components and clear architecture will enable efficient development.

The key to success is balancing familiar GitHub patterns with academic-specific needs, ensuring the interface feels modern and powerful while serving the unique requirements of research project management.

