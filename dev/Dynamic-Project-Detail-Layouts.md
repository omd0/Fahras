# Dynamic Project Detail Layouts by Type

## Executive Summary

This document defines **10 distinct project detail page layouts** optimized for different academic disciplines. Each layout is tailored to showcase the unique characteristics of its project type while maintaining a cohesive design system across the platform.

**Core Philosophy:** One project detail page component with **dynamic sections** that render based on `project.type` field.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layout Definitions](#layout-definitions)
   - [Software/Programming Projects](#1-softwareprogramming-projects)
   - [Network/Infrastructure Projects](#2-networkinfrastructure-projects)
   - [Research Papers/Theoretical Projects](#3-research-paperstheoretical-projects)
   - [Design Projects](#4-design-projects)
   - [Hardware/Engineering Projects](#5-hardwareengineering-projects)
   - [Media/Creative Projects](#6-mediacreative-projects)
   - [Business/Management Projects](#7-businessmanagement-projects)
   - [Medical/Health Sciences Projects](#8-medicalhealth-sciences-projects)
   - [Data Science/ML Projects](#9-data-scienceml-projects)
   - [Architecture Projects](#10-architecture-projects)
3. [Hybrid Project Handling](#hybrid-project-handling)
4. [Shared Components](#shared-components)
5. [Implementation Strategy](#implementation-strategy)

---

## Architecture Overview

### Database Schema Addition

```sql
-- Add to projects table
ALTER TABLE projects ADD COLUMN type VARCHAR(50);
ALTER TABLE projects ADD COLUMN secondary_types JSON; -- For hybrid projects

-- Project type enum
CREATE TYPE project_type AS ENUM (
  'software',
  'network',
  'research',
  'design',
  'hardware',
  'media',
  'business',
  'medical',
  'data_science',
  'architecture'
);
```

### Component Structure

```typescript
// web/src/pages/ProjectDetailPage.tsx

import { getLayoutForProjectType } from '@/layouts/projectLayouts';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  // Get appropriate layout based on project type
  const LayoutComponent = getLayoutForProjectType(project?.type);

  return (
    <Container maxWidth="xl">
      <Breadcrumbs project={project} />

      {/* Render type-specific layout */}
      <LayoutComponent project={project} />

      {/* Shared components at bottom */}
      <CommentThread projectId={project.id} />
      <RelatedProjects project={project} />
    </Container>
  );
}
```

### Layout Registry

```typescript
// web/src/layouts/projectLayouts/index.ts

import SoftwareLayout from './SoftwareLayout';
import NetworkLayout from './NetworkLayout';
import ResearchLayout from './ResearchLayout';
// ... other imports

const layoutMap = {
  software: SoftwareLayout,
  network: NetworkLayout,
  research: ResearchLayout,
  design: DesignLayout,
  hardware: HardwareLayout,
  media: MediaLayout,
  business: BusinessLayout,
  medical: MedicalLayout,
  data_science: DataScienceLayout,
  architecture: ArchitectureLayout,
  // Default fallback
  default: SoftwareLayout
};

export function getLayoutForProjectType(type?: string) {
  return layoutMap[type || 'default'] || layoutMap.default;
}
```

---

## Layout Definitions

## 1. Software/Programming Projects

### Platform Inspiration
**GitHub** - Code-first, repository-centric layout

### Primary Content Format
- GitHub repository embed or link
- Live demo (if deployed)
- Code screenshots/snippets

### Layout Structure

```typescript
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumbs: Home > Explore > CS > [Project Name]         │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  STICKY SIDEBAR          │
│  [Banner: GitHub Repo Link]      │  ─────────────────────── │
│  ⭐ Star on GitHub               │  👤 Team Members         │
│                                  │  🎓 Advisor              │
│  ═══════════════════════════     │                          │
│  # Project Title                 │  🔗 [Live Demo]          │
│  📊 Status: Approved             │  📦 [Download]           │
│  🏷️ Tags: React, TypeScript     │                          │
│                                  │  📊 Stats:               │
│  ─────────────────────────────   │    • Stars: 42           │
│  ## Abstract                     │    • Forks: 8            │
│  [Rich text description]         │    • Commits: 156        │
│                                  │    • Contributors: 3     │
│  ─────────────────────────────   │                          │
│  ## Tech Stack                   │  🏷️ Technologies:        │
│  [Icons: React, Node, Postgres] │    • React 18            │
│                                  │    • TypeScript          │
│  ─────────────────────────────   │    • Node.js             │
│  📸 SCREENSHOTS TAB (default)    │                          │
│  ┌────────┐ ┌────────┐          │  ─────────────────────── │
│  │ Screen │ │ Screen │          │  📦 Related Projects:    │
│  │   1    │ │   2    │          │  • Similar Proj 1        │
│  └────────┘ └────────┘          │  • Similar Proj 2        │
│                                  │                          │
│  ─────────────────────────────   └──────────────────────────┘
│  💻 CODE TAB                     │
│  [GitHub-style file tree + preview]
│                                  │
│  ─────────────────────────────   │
│  📐 ARCHITECTURE TAB             │
│  [System architecture diagrams]  │
│                                  │
│  ─────────────────────────────   │
│  📄 FILES TAB                    │
│  [Downloadable files: thesis PDF, docs]
└──────────────────────────────────┘
```

### Key Sections (in order)

1. **GitHub Integration Bar**
   - Direct link to repository
   - Star/Fork counts (if public repo)
   - Last commit timestamp

2. **Title & Status**
   - Project name (H1)
   - Status chips (Approved, Public/Private)
   - Tech stack icons (React, Python, etc.)

3. **Abstract/README**
   - Rendered from project description or GitHub README
   - Supports Markdown

4. **Live Demo Section**
   - Embedded iframe (if web app)
   - OR prominent "Launch Demo" button
   - OR video demo

5. **Tabs:**
   - **Screenshots:** Gallery of app screenshots
   - **Code:** File browser with syntax highlighting
   - **Architecture:** System diagrams, flowcharts
   - **Documentation:** User guides, API docs
   - **Files:** Thesis PDF, additional documents

### Specialized Components

```typescript
// GitHubRepoCard.tsx
<Card sx={{ mb: 3, border: 2, borderColor: 'primary.main' }}>
  <CardContent>
    <Stack direction="row" alignItems="center" spacing={2}>
      <GitHubIcon fontSize="large" />
      <Box flexGrow={1}>
        <Typography variant="h6">View on GitHub</Typography>
        <Typography variant="body2" color="text.secondary">
          {project.github_url}
        </Typography>
      </Box>
      <Stack direction="row" spacing={2}>
        <Chip icon={<StarIcon />} label={`${stars} stars`} />
        <Chip icon={<ForkIcon />} label={`${forks} forks`} />
      </Stack>
      <Button
        variant="contained"
        startIcon={<OpenInNewIcon />}
        href={project.github_url}
        target="_blank"
      >
        Open Repository
      </Button>
    </Stack>
  </CardContent>
</Card>

// LiveDemoSection.tsx
<Paper elevation={3} sx={{ p: 2, mb: 3 }}>
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
    <Typography variant="h6">Live Demo</Typography>
    <Button
      variant="outlined"
      startIcon={<LaunchIcon />}
      onClick={() => setFullscreen(true)}
    >
      Open Fullscreen
    </Button>
  </Stack>
  <Box
    component="iframe"
    src={project.demo_url}
    sx={{
      width: '100%',
      height: 600,
      border: 'none',
      borderRadius: 1
    }}
  />
</Paper>

// TechStackIcons.tsx
<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
  {project.technologies?.map(tech => (
    <Tooltip key={tech} title={tech}>
      <Avatar
        src={getTechIcon(tech)}
        alt={tech}
        sx={{ width: 32, height: 32 }}
      />
    </Tooltip>
  ))}
</Stack>
```

### Metadata Priority
- Programming languages (percentage breakdown)
- Frameworks & libraries
- GitHub stats (stars, forks, commits)
- Deployment status (live/offline)
- License type

---

## 2. Network/Infrastructure Projects

### Platform Inspiration
**Medium + Cisco DevNet** - Blog-like narrative with technical diagrams

### Primary Content Format
- Long-form narrative explaining network design
- Interactive network diagrams
- Configuration examples

### Layout Structure

```typescript
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumbs: Home > Explore > Network Engineering > [...]  │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  STICKY SIDEBAR          │
│  [Hero Image: Network Topology]  │  ─────────────────────── │
│                                  │  👤 Team & Advisor       │
│  ═══════════════════════════     │                          │
│  # Network Design for X          │  📊 Quick Facts:         │
│  📊 Status • Tags                │    • Nodes: 25           │
│                                  │    • Protocols: 8        │
│  ─────────────────────────────   │    • Throughput: 10Gbps  │
│  ## Project Overview             │                          │
│  [2-3 paragraph summary]         │  🛠️ Technologies:        │
│                                  │    • Cisco               │
│  ─────────────────────────────   │    • VLANs               │
│  ## Network Requirements         │    • BGP/OSPF            │
│  [Bullet points or table]        │                          │
│                                  │  📂 Files:               │
│  ─────────────────────────────   │    • Network Diagram     │
│  ## Topology Design              │    • Config Files        │
│  [Interactive SVG diagram]       │    • Report PDF          │
│  [Zoomable, clickable nodes]     │                          │
│                                  │  ─────────────────────── │
│  ─────────────────────────────   │  📦 Related Networks:    │
│  ## Implementation Details       │  • Campus Network        │
│  ### Phase 1: Core Layer         │  • Data Center Design    │
│  [Text + code blocks]            │                          │
│  ```cisco                        └──────────────────────────┘
│  interface GigabitEthernet0/0    │
│  ip address 192.168.1.1 ...     │
│  ```                             │
│                                  │
│  ### Phase 2: Distribution       │
│  [More narrative + configs]      │
│                                  │
│  ─────────────────────────────   │
│  ## Testing & Validation         │
│  [Performance charts, graphs]    │
│                                  │
│  ─────────────────────────────   │
│  ## Lessons Learned              │
│  [Reflective section]            │
└──────────────────────────────────┘
```

### Key Sections (in order)

1. **Hero Network Diagram**
   - Large, visual topology diagram
   - Interactive (hover to see node details)

2. **Project Overview**
   - Problem statement
   - Requirements
   - Proposed solution

3. **Topology Design**
   - Interactive network diagram
   - Click nodes to see configuration
   - Zoom and pan capabilities

4. **Implementation Narrative** (Blog-style)
   - Chronological sections with headings
   - Code blocks for configurations
   - Embedded images/diagrams

5. **Performance & Testing**
   - Charts showing throughput, latency
   - Before/after comparisons

6. **Files & Downloads**
   - Network diagrams (PDF, Visio)
   - Configuration files (.conf, .txt)
   - Full report (PDF)

### Specialized Components

```typescript
// InteractiveTopologyDiagram.tsx
// Uses react-flow or similar library
<Box sx={{ height: 600, border: 1, borderColor: 'divider', borderRadius: 1 }}>
  <ReactFlow
    nodes={networkNodes}
    edges={networkEdges}
    onNodeClick={handleNodeClick}
    fitView
  >
    <Controls />
    <MiniMap />
    <Background />
  </ReactFlow>
</Box>

// ConfigCodeBlock.tsx
<Paper elevation={1} sx={{ mb: 2 }}>
  <Stack direction="row" justifyContent="space-between" sx={{ p: 1, bgcolor: 'grey.100' }}>
    <Chip label="Cisco IOS Config" size="small" />
    <IconButton size="small" onClick={copyToClipboard}>
      <ContentCopyIcon fontSize="small" />
    </IconButton>
  </Stack>
  <SyntaxHighlighter
    language="cisco"
    style={docco}
    customStyle={{ margin: 0, borderRadius: 0 }}
  >
    {configCode}
  </SyntaxHighlighter>
</Paper>

// NetworkStats.tsx
<Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>Network Metrics</Typography>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6 }}>
        <StatItem label="Total Nodes" value={25} icon={<RouterIcon />} />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <StatItem label="Throughput" value="10 Gbps" icon={<SpeedIcon />} />
      </Grid>
    </Grid>
  </CardContent>
</Card>
```

### Metadata Priority
- Network type (Campus, WAN, Data Center)
- Protocols used (BGP, OSPF, VLAN, etc.)
- Equipment vendor (Cisco, Juniper, etc.)
- Network size (nodes, links)
- Performance metrics

---

## 3. Research Papers/Theoretical Projects

### Platform Inspiration
**ArXiv + Google Scholar** - Academic, citation-focused

### Primary Content Format
- Embedded PDF viewer
- Structured abstract
- Citation tools

### Layout Structure

```typescript
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumbs: Home > Explore > Mathematics > [Title]        │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  STICKY SIDEBAR          │
│  ═══════════════════════════     │  ─────────────────────── │
│  # Paper Title                   │  👤 Authors:             │
│  👤 Author 1, Author 2           │    • Student 1           │
│  🏫 University Name, 2024        │    • Student 2           │
│                                  │  🎓 Advisor: Dr. X       │
│  📊 Status: Approved             │                          │
│  🏷️ Keywords: [chips]           │  📅 Published: Jan 2024  │
│                                  │                          │
│  ─────────────────────────────   │  📖 Citation:            │
│  ## Abstract                     │  [Copy BibTeX]           │
│  [Structured: Background,        │  [Copy APA]              │
│   Methods, Results, Conclusion]  │  [Copy MLA]              │
│                                  │                          │
│  ─────────────────────────────   │  📊 Metrics:             │
│  📄 READ PAPER (default tab)     │    • Views: 342          │
│                                  │    • Downloads: 89       │
│  ┌─────────────────────────────┐│    • Citations: 3        │
│  │                             ││                          │
│  │   [Embedded PDF Viewer]     ││  🔗 External Links:      │
│  │   with controls:            ││    • DOI: 10.xxx         │
│  │   • Page navigation         ││    • ArXiv: arxiv/...    │
│  │   • Zoom                    ││                          │
│  │   • Download                ││  ─────────────────────── │
│  │   • Print                   ││  📦 Supplementary:       │
│  │                             ││    📁 Dataset.zip        │
│  └─────────────────────────────┘│    📁 Appendices.pdf     │
│                                  │    📁 Code.zip           │
│  ─────────────────────────────   │                          │
│  📊 FIGURES & TABLES TAB         │  ─────────────────────── │
│  [Gallery of all figures/tables │  📚 Related Papers:      │
│   extracted from PDF]            │  • Similar 1             │
│                                  │  • Similar 2             │
│  ─────────────────────────────   └──────────────────────────┘
│  📚 REFERENCES TAB               │
│  [Formatted list of citations]  │
│                                  │
│  ─────────────────────────────   │
│  📂 SUPPLEMENTARY MATERIALS TAB  │
│  [Datasets, proofs, appendices]  │
└──────────────────────────────────┘
```

### Key Sections (in order)

1. **Title & Authors**
   - Full paper title (H1)
   - Author list with affiliations
   - Publication date

2. **Structured Abstract**
   - Background
   - Methods/Methodology
   - Results
   - Conclusions

3. **Embedded PDF Viewer**
   - In-browser PDF reader (pdf.js)
   - Page navigation, zoom controls
   - Download and print buttons

4. **Tabs:**
   - **Read Paper:** Embedded PDF
   - **Figures & Tables:** Extracted visuals
   - **References:** Bibliography
   - **Supplementary:** Extra materials

### Specialized Components

```typescript
// PDFViewer.tsx
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

<Box sx={{ height: 800, border: 1, borderColor: 'divider' }}>
  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.x/build/pdf.worker.min.js">
    <Viewer
      fileUrl={project.paper_url}
      defaultScale={1.2}
      plugins={[toolbarPlugin, searchPlugin]}
    />
  </Worker>
</Box>

// CitationExporter.tsx
<Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>Cite this work</Typography>
    <Stack spacing={1}>
      <Button
        variant="outlined"
        startIcon={<ContentCopyIcon />}
        onClick={() => copyCitation('bibtex')}
      >
        Copy BibTeX
      </Button>
      <Button
        variant="outlined"
        startIcon={<ContentCopyIcon />}
        onClick={() => copyCitation('apa')}
      >
        Copy APA
      </Button>
      <Button
        variant="outlined"
        startIcon={<ContentCopyIcon />}
        onClick={() => copyCitation('mla')}
      >
        Copy MLA
      </Button>
    </Stack>
  </CardContent>
</Card>

// StructuredAbstract.tsx
<Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
  <Typography variant="h6" gutterBottom>Abstract</Typography>

  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="primary" gutterBottom>
      Background
    </Typography>
    <Typography variant="body2" paragraph>
      {abstract.background}
    </Typography>
  </Box>

  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="primary" gutterBottom>
      Methods
    </Typography>
    <Typography variant="body2" paragraph>
      {abstract.methods}
    </Typography>
  </Box>

  {/* Results, Conclusions... */}
</Paper>
```

### Metadata Priority
- Authors & affiliations
- Publication date
- DOI (if published externally)
- Keywords/subject areas
- Research methodology
- Citation count

---

## 4. Design Projects

### Platform Inspiration
**Behance + Dribbble** - Visually driven, portfolio-style

### Primary Content Format
- Vertical gallery of high-quality images
- Interactive prototype embed

### Layout Structure

```typescript
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumbs: Home > Explore > Design > [Project]           │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  STICKY SIDEBAR          │
│  [Hero Image - Full width]       │  ─────────────────────── │
│  [High-res mockup/final design]  │  👤 Designer Info        │
│                                  │  🎓 Advisor              │
│  ═══════════════════════════     │                          │
│  # Project Title                 │  🔗 [View Prototype]     │
│  📊 Status • Category            │                          │
│  🏷️ Tags: UI/UX, Branding       │  🎨 Tools Used:          │
│                                  │    • Figma               │
│  ─────────────────────────────   │    • Illustrator         │
│  ## Project Brief                │    • After Effects       │
│  [Short problem statement]       │                          │
│                                  │  🎨 Color Palette:       │
│  ─────────────────────────────   │  [Color swatches]        │
│  ## VISUAL SHOWCASE              │                          │
│  [Free-flowing artboard layout]  │  📊 Engagement:          │
│                                  │    • 👁️ 234 views        │
│  ┌─────────────────────────────┐│    • ❤️ 89 likes         │
│  │  [Full-width image]         ││                          │
│  └─────────────────────────────┘│  ─────────────────────── │
│                                  │  📦 Project Files:       │
│  [Caption or description text]   │    • Design System.fig   │
│                                  │    • Assets.zip          │
│  ┌──────────┐ ┌──────────┐     │                          │
│  │  Image   │ │  Image   │     │  ─────────────────────── │
│  │  Grid    │ │  Grid    │     │  🎨 More Designs:        │
│  └──────────┘ └──────────┘     │  [Thumbnails of other    │
│                                  │   designer's work]       │
│  ┌─────────────────────────────┐└──────────────────────────┘
│  │  [Another full-width]       │
│  └─────────────────────────────┘
│
│  [More text]
│
│  ─────────────────────────────
│  ## Interactive Prototype
│  ┌─────────────────────────────┐
│  │  [Embedded Figma/InVision]  │
│  │  [Users can click through]  │
│  └─────────────────────────────┘
│
│  ─────────────────────────────
│  ## Style Guide
│  [Typography samples]
│  [Color swatches]
│  [Component states]
└──────────────────────────────────┘
```

### Key Sections (in order)

1. **Hero Image**
   - Stunning hero shot
   - Full-bleed, high-quality

2. **Project Brief**
   - 2-3 sentence problem/solution

3. **Visual Showcase (Artboard)**
   - Free-flowing layout
   - Mix of full-width and grid images
   - Interspersed text descriptions
   - Tells the design story

4. **Interactive Prototype**
   - Embedded Figma/InVision/Framer
   - Clickable, interactive

5. **Style Guide**
   - Typography hierarchy
   - Color palette with hex codes
   - Component library

### Specialized Components

```typescript
// DesignArtboard.tsx
// Flexible content blocks
const contentBlocks = [
  { type: 'image', src: '...', layout: 'full' },
  { type: 'text', content: '...', variant: 'caption' },
  { type: 'imageGrid', images: [...], columns: 2 },
  { type: 'image', src: '...', layout: 'full' },
  // ...
];

<Box sx={{ maxWidth: 900, mx: 'auto' }}>
  {contentBlocks.map((block, i) => {
    switch (block.type) {
      case 'image':
        return block.layout === 'full' ? (
          <Box
            key={i}
            component="img"
            src={block.src}
            sx={{ width: '100%', height: 'auto', mb: 3 }}
          />
        ) : (
          <Box
            key={i}
            component="img"
            src={block.src}
            sx={{ maxWidth: '80%', mx: 'auto', display: 'block', mb: 3 }}
          />
        );
      case 'text':
        return (
          <Typography
            key={i}
            variant={block.variant}
            paragraph
            sx={{ px: 2, mb: 3 }}
          >
            {block.content}
          </Typography>
        );
      case 'imageGrid':
        return (
          <Grid container spacing={2} key={i} sx={{ mb: 3 }}>
            {block.images.map((img, j) => (
              <Grid size={{ xs: 12 / block.columns }} key={j}>
                <Box component="img" src={img} sx={{ width: '100%' }} />
              </Grid>
            ))}
          </Grid>
        );
    }
  })}
</Box>

// PrototypeEmbed.tsx
<Paper elevation={3} sx={{ p: 2, mb: 3 }}>
  <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
    <Typography variant="h6">Interactive Prototype</Typography>
    <Button
      variant="outlined"
      startIcon={<OpenInNewIcon />}
      href={project.prototype_url}
      target="_blank"
    >
      Open in Figma
    </Button>
  </Stack>
  <Box
    component="iframe"
    src={getFigmaEmbedUrl(project.prototype_url)}
    sx={{
      width: '100%',
      height: 800,
      border: 'none',
      borderRadius: 1
    }}
  />
</Paper>

// ColorPaletteSwatch.tsx
<Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>Color Palette</Typography>
    <Grid container spacing={1}>
      {project.colors?.map(color => (
        <Grid size={{ xs: 4, sm: 3 }} key={color.hex}>
          <Box
            sx={{
              bgcolor: color.hex,
              height: 60,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider'
            }}
          />
          <Typography variant="caption" align="center" display="block" sx={{ mt: 0.5 }}>
            {color.hex}
          </Typography>
        </Grid>
      ))}
    </Grid>
  </CardContent>
</Card>
```

### Metadata Priority
- Design tools (Figma, Sketch, Adobe XD)
- Design discipline (UI, UX, Branding, etc.)
- Color palette
- Typography used
- Project duration
- Client/Context (if applicable)

---

## 5. Hardware/Engineering Projects

### Platform Inspiration
**Instructables + Hackaday** - Process-oriented, build log

### Primary Content Format
- Build diary/log
- 3D model viewer
- Bill of Materials (BOM)

### Layout Structure

```typescript
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumbs: Home > Explore > Electrical Engineering > ... │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  STICKY SIDEBAR          │
│  [Hero: 3D render or photo]      │  ─────────────────────── │
│                                  │  👤 Team & Advisor       │
│  ═══════════════════════════     │                          │
│  # Hardware Project Title        │  ⚙️ Quick Specs:         │
│  📊 Status • Category            │    • Dimensions: X×Y×Z   │
│  🏷️ Tags: Arduino, IoT          │    • Weight: 2.5kg       │
│                                  │    • Power: 12V DC       │
│  ─────────────────────────────   │                          │
│  ## Overview                     │  🛠️ Tools & Materials:   │
│  [Summary of what it does]       │    • Arduino Uno         │
│                                  │    • 3D Printer          │
│  ─────────────────────────────   │    • Soldering Iron      │
│  ## Technical Specifications     │                          │
│  | Spec      | Value         |  │  📂 Files:               │
│  |-----------|---------------|  │    • CAD Files (.stl)    │
│  | Dimension | 10×15×8 cm    |  │    • Schematics (.pdf)   │
│  | Weight    | 250g          |  │    • Firmware (.ino)     │
│  | Power     | 5V USB        |  │    • BOM (.xlsx)         │
│                                  │                          │
│  ─────────────────────────────   │  ─────────────────────── │
│  ## Bill of Materials (BOM)      │  🎥 Demo Video:          │
│  | Part         | Qty | Link |  │  [Video player]          │
│  |--------------|-----|------|  │                          │
│  | Arduino Uno  | 1   | [🔗] |  │  ─────────────────────── │
│  | LED Matrix   | 1   | [🔗] |  │  📦 Similar Builds:      │
│  | Resistors    | 10  | [🔗] |  │  • IoT Project 1         │
│  ...                             │  • Robotics Project 2    │
│                                  └──────────────────────────┘
│  ─────────────────────────────
│  ## 3D Model Viewer
│  [Interactive 3D viewer]
│  [Rotate, zoom, pan]
│
│  ─────────────────────────────
│  ## Schematics
│  [Circuit diagrams - zoomable]
│
│  ─────────────────────────────
│  ## Build Process
│  ### Step 1: PCB Design
│  [Photos + description]
│
│  ### Step 2: 3D Printing
│  [Photos + description]
│
│  ### Step 3: Assembly
│  [Photos + description]
│
│  ─────────────────────────────
│  ## Testing & Results
│  [Charts, performance data]
│  [Video of device in action]
└──────────────────────────────────┘
```

### Key Sections (in order)

1. **Project Overview**
   - What it does
   - Why it was built

2. **Technical Specifications Table**
   - Dimensions, weight, power
   - Key specs

3. **Bill of Materials (BOM)**
   - Sortable/searchable table
   - Links to component datasheets
   - Downloadable as CSV/Excel

4. **3D Model Viewer**
   - Interactive 3D model (if available)
   - Rotate, zoom, pan
   - Exploded view option

5. **Schematics & Diagrams**
   - Circuit schematics
   - Block diagrams
   - Zoomable, high-res

6. **Build Process (Chronological)**
   - Step-by-step log
   - Photos at each stage
   - Lessons learned

7. **Testing & Results**
   - Performance data
   - Demo video

### Specialized Components

```typescript
// ThreeDModelViewer.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, STLLoader } from '@react-three/drei';

<Box sx={{ height: 500, border: 1, borderColor: 'divider', borderRadius: 1 }}>
  <Canvas>
    <ambientLight intensity={0.5} />
    <spotLight position={[10, 10, 10]} angle={0.15} />
    <Suspense fallback={<Loader />}>
      <STLModel url={project.model_url} />
    </Suspense>
    <OrbitControls />
  </Canvas>
</Box>

// BillOfMaterialsTable.tsx
<TableContainer component={Paper}>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Part Name</TableCell>
        <TableCell align="right">Quantity</TableCell>
        <TableCell align="right">Unit Cost</TableCell>
        <TableCell align="right">Total</TableCell>
        <TableCell>Datasheet</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {bom.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell align="right">{item.quantity}</TableCell>
          <TableCell align="right">${item.unit_cost}</TableCell>
          <TableCell align="right">${item.quantity * item.unit_cost}</TableCell>
          <TableCell>
            <IconButton href={item.datasheet_url} target="_blank" size="small">
              <PictureAsPdfIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="h6">Total Cost</Typography>
    <Typography variant="h6">${totalCost}</Typography>
  </Box>
  <Button
    fullWidth
    variant="outlined"
    startIcon={<DownloadIcon />}
    onClick={downloadBOM}
  >
    Download BOM as Excel
  </Button>
</TableContainer>

// BuildStepLog.tsx
{buildSteps.map((step, i) => (
  <Card key={i} sx={{ mb: 3 }}>
    <CardHeader
      avatar={
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {i + 1}
        </Avatar>
      }
      title={step.title}
      subheader={`Duration: ${step.duration}`}
    />
    <CardMedia
      component="img"
      height="300"
      image={step.image}
      alt={step.title}
    />
    <CardContent>
      <Typography variant="body2">
        {step.description}
      </Typography>
      {step.code && (
        <CodeBlock code={step.code} language="arduino" />
      )}
    </CardContent>
  </Card>
))}
```

### Metadata Priority
- Engineering discipline
- CAD software used
- Microcontrollers/platforms
- Materials & components
- Build time
- Total cost

---

_(Continuing with remaining 5 project types in next section due to length...)_

## 6-10. Remaining Project Types

### 6. Media/Creative Projects (Film, Animation, Game Design)
- **Hero:** Embedded video/game player
- **Sections:** Logline, Credits roll, Behind-the-scenes gallery, Press kit
- **Special:** WebGL game embed, Chapter-marked video player

### 7. Business/Management Projects (Case Studies, Strategic Plans)
- **Hero:** Executive summary card
- **Sections:** Key insights carousel, Structured report with accordions, Interactive dashboards (Tableau/Power BI)
- **Special:** SWOT/PESTLE framework visualization, Downloadable slide deck

### 8. Medical/Health Sciences Projects (Clinical Studies, Public Health)
- **Hero:** Structured abstract (Background, Methods, Results, Conclusion)
- **Sections:** Ethics statement, Full paper (IMRaD format), Anonymized data viewer, Protocols
- **Special:** Statistical output display, Medical imaging viewer (if applicable), Privacy disclaimers

### 9. Data Science/ML Projects
- **Hero:** Live model demo/API inference UI
- **Sections:** Performance metrics dashboard, Embedded Jupyter notebook, Dataset explorer, Architecture diagram
- **Special:** Interactive confusion matrix, ROC curve charts, Model weights download

### 10. Architecture Projects
- **Hero:** High-fidelity render
- **Sections:** Project narrative, Interactive 3D model, Render gallery, Floor plans & sections carousel
- **Special:** 3D model viewer (.gltf), High-res image zoom, Drawing comparator overlay tool

_(Full detailed layouts for types 6-10 available in separate document if needed)_

---

## Hybrid Project Handling

### Problem Statement
Some projects span multiple types. Example: A machine learning project (Data Science) that includes a research paper (Research) and a web interface (Software).

### Solution: Primary + Secondary System

```typescript
// Database schema
{
  type: 'data_science',           // Primary type (defines main layout)
  secondary_types: ['research', 'software'],  // Secondary aspects
  layout_overrides: {
    include_sections: ['pdf_viewer', 'github_integration'],
    section_order: ['model_demo', 'paper', 'code', 'files']
  }
}
```

### Implementation

```typescript
// web/src/layouts/HybridLayout.tsx

export function HybridLayout({ project }: { project: Project }) {
  // Get primary layout
  const PrimaryLayout = getLayoutForProjectType(project.type);

  // Get additional sections from secondary types
  const additionalSections = project.secondary_types?.map(type =>
    getSectionsForType(type)
  ) || [];

  return (
    <Box>
      {/* Render primary layout with injected sections */}
      <PrimaryLayout
        project={project}
        additionalSections={additionalSections}
        sectionOrder={project.layout_overrides?.section_order}
      />
    </Box>
  );
}

// Example: ML project with research paper
// Primary: Data Science layout (model demo, metrics)
// Secondary: Research (adds PDF viewer, citation tools)
// Result: Model demo → Performance charts → Research paper → Notebook → Files
```

### UI Indicator for Hybrid Projects

```typescript
<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
  <Chip
    label={getTypeName(project.type)}
    color="primary"
    icon={getTypeIcon(project.type)}
  />
  {project.secondary_types?.map(type => (
    <Chip
      key={type}
      label={getTypeName(type)}
      variant="outlined"
      icon={getTypeIcon(type)}
      size="small"
    />
  ))}
</Stack>
```

---

## Shared Components (All Layouts)

These components appear in **every** project detail layout, regardless of type:

### 1. Breadcrumbs (Top)
```typescript
<Breadcrumbs>
  Home > Explore > {program} > {project.title}
</Breadcrumbs>
```

### 2. Sticky Sidebar (Right, Desktop)
- Team members + Advisor
- Primary actions (Bookmark, Follow, Share)
- Quick stats (views, downloads, date)
- Files/downloads section
- Related projects carousel

### 3. Comment Thread (Bottom)
- GitHub-style threaded comments
- Markdown support
- Reactions (👍❤️)

### 4. Related Projects (Bottom)
- Algorithm-based suggestions
- 3-5 similar projects
- Based on: tags, program, advisor, keywords

---

## Implementation Strategy

### Phase 1: Foundation (Week 1)
1. Create base `ProjectDetailLayout` component
2. Implement shared components (Breadcrumbs, Sidebar, Comments)
3. Build layout registry system
4. Create 2 reference layouts (Software + Research)

### Phase 2: Core Layouts (Week 2-3)
1. Implement 6 remaining primary layouts
2. Build specialized components for each type
3. Test with real project data
4. Mobile responsive adjustments

### Phase 3: Hybrid System (Week 4)
1. Implement secondary types system
2. Build section injection mechanism
3. Create UI for hybrid project indicators
4. Test complex hybrid projects

### Phase 4: Polish & Optimization (Week 5)
1. Add transitions between sections
2. Optimize component bundle sizes (lazy loading)
3. Accessibility audit for all layouts
4. RTL testing
5. Performance profiling

---

## Success Metrics

### User Engagement
- **Time on Page:** Increase by 40% (users spend more time exploring type-specific features)
- **File Downloads:** 25% increase (better file presentation)
- **Demo Interactions:** 50% of software projects get demo clicks

### Content Quality
- **Complete Profiles:** 80% of projects have all type-specific fields filled
- **Rich Media:** 60% of projects include images/videos/demos

### Technical Performance
- **Page Load:** < 2.5s for all layout types
- **Interactive:** < 500ms for component interactions
- **Bundle Size:** < 300KB per layout chunk (lazy loaded)

---

## Future Enhancements

1. **AI Layout Suggestions:** Analyze project content and suggest optimal layout type
2. **Custom Layout Builder:** Allow students to create custom sections
3. **Version History:** Track changes to project presentation over time
4. **A/B Testing:** Test different section orders for engagement
5. **Export to Portfolio:** Generate PDF/HTML portfolio from project page

---

## Conclusion

This dynamic layout system transforms Fahras from a generic project archive into a **discipline-aware, presentation-optimized platform**. Each project type gets the showcase it deserves, while maintaining a cohesive design language across the entire system.

By tailoring the presentation to the content, we maximize both **discoverability** (users find relevant projects faster) and **impact** (projects are presented in their best light).
