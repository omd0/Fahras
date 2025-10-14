<!-- 9c96a60f-a8d5-4583-ac09-ab4fc9f1acd8 81f328c6-3247-4ea8-ae3b-2f4dd671d644 -->
# Project Documentation Export Tool

## Overview

Create a feature that allows users to generate and export professional project documentation in multiple formats (PDF, DOCX, PPTX) **with full RTL (Right-to-Left) support for Arabic content**. Following standard academic graduation project documentation structure.

## RTL Support Requirements ⚠️

- All generated documents must support Arabic RTL text rendering
- Proper font support for Arabic characters
- Correct text alignment (right-aligned for Arabic content)
- Bidirectional text handling for mixed Arabic/English content

## Standard Graduation Project Document Structure

Based on academic standards, the complete documentation includes:

### Phase 1: Basic Information (Current Implementation)

1. **Cover Page** - Project title, team, advisors, institution, date
2. **Abstract** - Project summary
3. **Keywords** - Search terms
4. **Project Metadata** - Academic year, semester, program, department
5. **Team Members** - With roles (LEAD, MEMBER)
6. **Advisors** - With roles (MAIN, CO_ADVISOR, REVIEWER)
7. **Status Information** - Project and approval status

### Phase 2: Extended Information (Future)

8. **Table of Contents** - Auto-generated from sections
9. **Introduction** - Background, problem statement, objectives, scope
10. **Literature Review** - Related work and research
11. **Methodology** - Methods, tools, and procedures
12. **System Architecture** - Design diagrams and structure
13. **Implementation** - Development details
14. **Testing & Evaluation** - Test cases and results
15. **Results & Discussion** - Findings and analysis
16. **Conclusion & Future Work** - Summary and recommendations
17. **References** - Citations and bibliography
18. **Appendices** - Code snippets, additional data

### Phase 3: Supplementary Materials (Future)

19. **List of Figures & Tables**
20. **List of Acronyms**
21. **Acknowledgments**
22. **Attached Files List** - Project files with links

## Architecture

### Backend Changes

**1. Add PHP Document Generation Libraries (RTL-Compatible)**

- Add to `api/composer.json`:
  - `mpdf/mpdf` ^8.0 - PDF generation (excellent RTL/Arabic support)
  - `phpoffice/phpword` ^1.0 - Word document generation (RTL capable)
  - `phpoffice/phppresentation` ^1.0 - PowerPoint generation
- **Why mPDF?** Superior Arabic/RTL support compared to TCPDF
- Include Arabic fonts (DejaVu Sans, Arial Unicode, or similar)

**2. Create DocumentExportController** (`api/app/Http/Controllers/DocumentExportController.php`)

- `export(Request $request, Project $project)` - Main export endpoint
  - Query params: `format` (pdf/docx/pptx), `sections` (array of sections to include)
- `generatePDF($project, $sections)` - Generate PDF with RTL support
  - Configure mPDF with `'mode' => 'utf-8'` and `'directionality' => 'auto'`
  - Use Arabic-compatible fonts
  - Dynamic section inclusion based on $sections parameter
- `generateDOCX($project, $sections)` - Generate Word document with RTL
  - Set paragraph style with `['bidi' => true, 'alignment' => 'both']`
  - Configure section for RTL reading
  - Create professional template with styles
- `generatePPTX($project, $sections)` - Generate PowerPoint presentation
  - 1-2 slides per major section
  - Test RTL support thoroughly
  - Professional theme with TVTC branding
- Private helper methods for each section:
  - `addCoverPage($doc, $project)`
  - `addAbstract($doc, $project)`
  - `addTeamMembers($doc, $project)`
  - `addAdvisors($doc, $project)`
  - etc.
- Implement role-based access control (faculty, reviewers, project members)

**3. Add API Routes** (`api/routes/api.php`)

```php
Route::get('/projects/{project}/export', [DocumentExportController::class, 'export']);
```

### Frontend Changes

**4. Create Modern ExportDialog Component** (`web/src/components/ProjectExportDialog.tsx`)

**Design Philosophy: Canva/Figma-inspired modern UI**

**Layout Structure:**

- Full-screen modal with smooth fade-in animation
- Split into two panels: Selection (left) and Preview (right)
- Clean white background with subtle shadows
- Minimal borders, focus on cards and spacing

**Step 1: Choose Template (Visual Cards)**

```
┌─────────────────────────────────────────┐
│  Choose Your Template                   │
├─────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ [Icon] │  │ [Icon] │  │ [Icon] │   │
│  │ Report │  │ Slides │  │ Simple │   │
│  │        │  │        │  │        │   │ 
│  └────────┘  └────────┘  └────────┘   │
└─────────────────────────────────────────┘
```

- Large visual cards (150x150px) with preview thumbnails
- Hover effect: Lift card, show blue border
- Selected: Bold blue border, checkmark badge
- Each card shows miniature preview of layout

**Step 2: Format Selection (Icon Cards)**

```
┌─────────────────────────────────────────┐
│  Export Format                          │
├─────────────────────────────────────────┤
│  ○ PDF    ○ DOCX    ○ PPTX             │
│  [Icon]   [Icon]    [Icon]             │
│  Best for Best for  Best for           │
│  reading  editing   presenting         │
└─────────────────────────────────────────┘
```

- Radio button cards with large format icons
- Material Design icons for each format
- Description text under each option
- Subtle background color on selection

**Step 3: Content Sections (Toggle Cards)**

```
┌─────────────────────────────────────────┐
│  What to Include                        │
├─────────────────────────────────────────┤
│  ✓ Cover Page & Title                   │
│  ✓ Abstract & Keywords                  │
│  ✓ Team Members                         │
│  ✓ Project Advisors                     │
│  ⊘ Extended Sections (Coming Soon)      │
└─────────────────────────────────────────┘
```

- Checkbox list with toggle switches
- Green checkmarks for included items
- Disabled items grayed out with "Coming Soon" badge
- Smooth toggle animation

**Step 4: Options (Minimal Settings)**

```
┌─────────────────────────────────────────┐
│  Language Direction                     │
│  [Auto-detect ▾] [RTL ☑]                │
└─────────────────────────────────────────┘
```

- Dropdown selector with icon
- Clean, minimal design
- Auto-detect as default

**Right Panel: Live Preview**

```
┌─────────────────────────────────────────┐
│           Preview                       │
├─────────────────────────────────────────┤
│   ┌─────────────────────────────────┐  │
│   │ [Document Preview Thumbnail]     │  │
│   │                                  │  │
│   │  Project Title Here              │  │
│   │  ════════════════                │  │
│   │  Abstract preview...             │  │
│   └─────────────────────────────────┘  │
│                                         │
│   📄 5 pages • PDF • A4 size           │
└─────────────────────────────────────────┘
```

- Visual preview of document structure
- Updates in real-time as options change
- Page count and format info
- Miniature layout representation

**Bottom Action Bar**

```
┌─────────────────────────────────────────┐
│  [Upload Custom File]  [Generate Export]│
└─────────────────────────────────────────┘
```

- Two clear action buttons
- Primary: "Generate Export" (gradient button)
- Secondary: "Upload Custom File" (outlined button)
- Loading state shows progress bar

**Visual Design Elements:**

- **Colors**: 
  - Primary: TVTC theme gradient
  - Hover: Subtle blue/purple tint
  - Selected: Bold accent color with glow
- **Typography**:
  - Headers: 18-24px, Bold, TVTC font
  - Body: 14-16px, Regular
  - Captions: 12px, Light gray
- **Animations**:
  - Smooth card hover (transform: translateY(-4px))
  - Fade-in for modal (0.3s ease)
  - Progress bar for generation
  - Success checkmark animation
- **Spacing**:
  - Generous padding (24-32px)
  - Card gap: 16px
  - Section spacing: 40px
- **Icons**:
  - Material-UI icons throughout
  - Large (48px) for format selection
  - Medium (24px) for options
  - Custom illustrations for template cards

**5. Update API Service** (`web/src/services/api.ts`)

```typescript
async exportProject(
  projectId: number, 
  format: 'pdf' | 'docx' | 'pptx',
  options?: {
    sections?: string[];
    rtl?: 'auto' | 'force' | 'ltr';
    template?: 'report' | 'presentation';
  }
): Promise<Blob>
```

- Handle blob response for file download
- Trigger browser download with proper filename (including project title)
- Add error handling for export failures
- Show download progress

**6. Add Export UI Integration**

- Add Export button to project detail page (in header toolbar)
  - Icon: `DownloadIcon` or `DescriptionIcon`
  - Tooltip: "Export Project Documentation"
- Add Export menu item to ProjectCard component
  - In the card's action menu
- Show visual feedback during export generation
  - Loading spinner
  - "Generating document..." message

## Document Content (Phase 1 - Basic Info)

### PDF/DOCX Structure:

1. **Cover Page**

   - TVTC Logo and branding
   - Project title (large, bold, RTL if Arabic)
   - Academic year and semester
   - Program and department
   - Generated date

2. **Project Information**

   - Status badges (project status, approval status)
   - DOI (if available)
   - Repository URL (if available)

3. **Abstract**

   - Full abstract text with proper RTL alignment
   - Word count indicator

4. **Keywords**

   - Comma-separated list with RTL support

5. **Team Members Table**

   - Name, Role (LEAD/MEMBER)
   - Contact info if available

6. **Advisors Table**

   - Name, Role (MAIN/CO_ADVISOR/REVIEWER)
   - Institution/Department

7. **Footer on each page**

   - Page numbers
   - Project title (truncated)
   - "Generated by TVTC Fahras System"
   - Export date and user

### PPTX Structure (5-7 slides):

1. **Title Slide** - Project title, team, date
2. **Overview Slide** - Quick facts, status, program
3. **Abstract Slide** - Project abstract with keywords
4. **Team Slide** - Members and advisors with photos/avatars
5. **Contact/Repository Slide** - Links and additional info

## Implementation Details

### PDF Format (using mPDF)

```php
$mpdf = new \Mpdf\Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'default_font' => 'dejavusans',
    'directionality' => 'auto', // Auto-detect RTL
    'autoScriptToLang' => true,
    'autoLangToFont' => true,
    'margin_left' => 15,
    'margin_right' => 15,
    'margin_top' => 16,
    'margin_bottom' => 16,
    'margin_header' => 9,
    'margin_footer' => 9,
]);
```

- Professional report layout with TVTC branding
- Automatic RTL detection
- Page numbers in footer
- Header with project title

### DOCX Format (using PHPWord)

```php
$phpWord = new \PhpOffice\PhpWord\PhpWord();
$section = $phpWord->addSection([
    'orientation' => 'portrait',
    'marginLeft' => 1134,
    'marginRight' => 1134,
    'marginTop' => 1134,
    'marginBottom' => 1134,
]);
$section->setRTL(true); // If Arabic detected
```

- Editable Word document
- RTL paragraph styles where needed
- Professional formatting with styles
- Table of contents placeholder

### PPTX Format (using PHPPresentation)

```php
$presentation = new PhpOffice\PhpPresentation\PhpPresentation();
$presentation->getLayout()->setDocumentLayout(
    PhpOffice\PhpPresentation\DocumentLayout::LAYOUT_SCREEN_16X9
);
```

- Presentation slides with TVTC theme
- Professional design
- RTL configuration per text element
- **Warning**: Limited RTL - extensive testing needed

## Optional Documentation Approach

**The export tool is a convenience feature, NOT mandatory:**

1. **Option A: Auto-Generate** - Use the export tool to create standardized documentation
2. **Option B: Upload Custom** - Users can upload their own pre-formatted PDF/PPT/DOCX files
3. **Option C: Both** - Generate standard version AND upload custom formatted versions

### File Type Categorization

Add file type categorization to the existing File model:

- `file_category` enum: 'documentation', 'source_code', 'presentation', 'dataset', 'other'
- Users can mark uploaded files as "Project Documentation" or "Presentation"
- Both auto-generated and manually uploaded docs appear in the same files list
- Auto-generated files have a badge/indicator showing they're "Auto-Generated"

### UI Updates for Optional Usage

- **Export Dialog** includes message: "Or upload your own documentation file"
- **Files Section** has categories with filters
- **Quick Actions** show both "Generate Documentation" and "Upload Documentation"
- No enforcement - users choose what works best for them

## Access Control

- Project creators/members can export/upload for their projects
- Faculty can export projects in their programs
- Reviewers can export projects they're assigned to  
- Admins can export any project
- Respect `is_public` and `approval_status` for non-members

## Testing Requirements

- Test with fully Arabic project titles and abstracts
- Test with mixed Arabic/English content
- Test with English-only content
- Verify fonts render correctly in all formats
- Test on different browsers for download functionality
- Verify file naming works with Arabic characters
- Test with projects that have:
  - No keywords
  - No advisors
  - Multiple team members
  - Long abstracts (>500 words)

## Future Extensibility (Phases 2 & 3)

The system is designed to easily add:

- **Introduction section** with rich text support
- **Methodology section** with embedded images
- **Results section** with charts and graphs
- **References** with citation formatting
- **Appendices** with file attachments
- **Comments and ratings** display
- **Statistical visualizations**
- **Project timeline/Gantt chart**
- **Evaluation scores** and feedback
- **Bulk export** from dashboards

Each section will be added as a separate method in the controller, making the system modular and extensible.

### To-dos

- [ ] Add TCPDF, PHPWord, and PHPPresentation packages to composer.json
- [ ] Create DocumentExportController with export methods for each format
- [ ] Add export API route to api/routes/api.php
- [ ] Create ProjectExportDialog component with format selection UI
- [ ] Add exportProject method to frontend API service
- [ ] Add Export button to project detail page and ProjectCard component
- [ ] Test all three export formats with sample project data