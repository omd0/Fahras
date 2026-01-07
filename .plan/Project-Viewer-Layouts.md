# Project Viewer Layouts - Complete Specification

## Overview

This document contains **all 10 project type layouts** for the dynamic project detail viewer. Each layout is optimized for its specific discipline while maintaining design consistency across the platform.

**Core Principle:** One `ProjectDetailPage` component that renders different layouts based on `project.type` field.

---

## Table of Contents

1. [Architecture & Implementation](#architecture--implementation)
2. [Layout 1: Software/Programming](#layout-1-softwareprogramming)
3. [Layout 2: Network/Infrastructure](#layout-2-networkinfrastructure)
4. [Layout 3: Research Papers](#layout-3-research-papers)
5. [Layout 4: Design Projects](#layout-4-design-projects)
6. [Layout 5: Hardware/Engineering](#layout-5-hardwareengineering)
7. [Layout 6: Media/Creative](#layout-6-mediacreative)
8. [Layout 7: Business/Management](#layout-7-businessmanagement)
9. [Layout 8: Medical/Health Sciences](#layout-8-medicalhealth-sciences)
10. [Layout 9: Data Science/ML](#layout-9-data-scienceml)
11. [Layout 10: Architecture](#layout-10-architecture)
12. [Hybrid Projects](#hybrid-projects)
13. [Shared Components](#shared-components)

---

## Architecture & Implementation

### Database Schema

```sql
-- Add to projects table
ALTER TABLE projects ADD COLUMN type VARCHAR(50);
ALTER TABLE projects ADD COLUMN secondary_types JSON;
ALTER TABLE projects ADD COLUMN layout_config JSON;

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
      <LayoutComponent project={project} />
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
// ... imports for all 10 types

const layoutMap: Record<string, React.ComponentType<ProjectLayoutProps>> = {
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
  default: SoftwareLayout // Fallback
};

export function getLayoutForProjectType(type?: string) {
  return layoutMap[type || 'default'] || layoutMap.default;
}
```

---

## Layout 1: Software/Programming

**Platform Inspiration:** GitHub
**Best For:** Web apps, mobile apps, APIs, libraries
**Est. Usage:** 40-50% of projects

### Visual Structure

```
┌──────────────────────────────────┬───────────────────┐
│  [GitHub Integration Banner]     │  STICKY SIDEBAR   │
│  ⭐ Star on GitHub                │  👥 Team          │
│                                   │  🎓 Advisor       │
│  # Project Title                  │  🔗 [Live Demo]   │
│  📊 Status • Public               │  📊 Stats         │
│  🏷️ React, TypeScript, Node.js  │  🛠️ Technologies  │
│                                   │  📦 Related       │
│  ## Abstract                      │                   │
│  [Project description]            │                   │
│                                   │                   │
│  ## Tech Stack                    │                   │
│  [Technology icons grid]          │                   │
│                                   │                   │
│  TABS: Screenshots | Code |       │                   │
│        Architecture | Docs        │                   │
│                                   │                   │
│  ## Live Demo                     │                   │
│  [Embedded iframe]                │                   │
└───────────────────────────────────┴───────────────────┘
```

### Key Features

1. **GitHub Integration Banner**
   - Direct repository link
   - Star/Fork counts
   - Clone button
   - Last commit info

2. **Tech Stack Display**
   - Icon grid of technologies
   - Version numbers
   - Category grouping (languages, frameworks, databases)

3. **Tabs:**
   - **Screenshots:** Gallery with lightbox
   - **Code:** File browser with syntax highlighting
   - **Architecture:** System diagrams
   - **Documentation:** User guides, API docs

4. **Live Demo Embed**
   - Iframe for web apps
   - Fullscreen mode
   - Reload button
   - "Open in new tab" link

### Specialized Components

```typescript
// GitHubRepoBanner.tsx
<Card sx={{ mb: 3, border: 2, borderColor: 'primary.main' }}>
  <CardContent>
    <Stack direction="row" alignItems="center" spacing={2}>
      <GitHubIcon fontSize="large" />
      <Box flexGrow={1}>
        <Typography variant="h6">View on GitHub</Typography>
        <Typography variant="body2">{githubUrl}</Typography>
      </Box>
      <Chip icon={<StarIcon />} label={`${stars} stars`} />
      <Button variant="contained" href={githubUrl}>
        Open Repository
      </Button>
    </Stack>
  </CardContent>
</Card>

// TechStackDisplay.tsx
<Grid container spacing={2}>
  {technologies.map(tech => (
    <Grid size={{ xs: 4, sm: 3, md: 2 }} key={tech.name}>
      <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
        <Avatar src={getTechLogo(tech.name)} sx={{ width: 48, height: 48, mx: 'auto' }} />
        <Typography variant="caption">{tech.name}</Typography>
      </Card>
    </Grid>
  ))}
</Grid>
```

### Database Fields

```typescript
{
  type: 'software',
  github_url: string,
  demo_url: string,
  technologies: [
    { name: 'React', version: '18.2', category: 'framework' }
  ],
  screenshots: [
    { url: string, caption: string, order: number }
  ],
  architecture_diagrams: [
    { url: string, title: string, type: 'system' | 'flowchart' }
  ]
}
```

---

## Layout 2: Network/Infrastructure

**Platform Inspiration:** Medium + Cisco DevNet
**Best For:** Network design, infrastructure projects
**Est. Usage:** 10-15% of projects

### Visual Structure

```
┌──────────────────────────────────┬───────────────────┐
│  [Hero: Network Topology Diagram]│  STICKY SIDEBAR   │
│                                   │  👥 Team          │
│  # Network Design for X           │  📊 Quick Facts   │
│  📊 Status • Tags                 │    • Nodes: 25    │
│                                   │    • Protocols: 8 │
│  ## Project Overview              │  🛠️ Technologies  │
│  [Problem & Solution]             │    • Cisco        │
│                                   │    • VLANs        │
│  ## Network Requirements          │  📂 Files         │
│  [Requirements list]              │                   │
│                                   │                   │
│  ## Topology Design               │                   │
│  [Interactive network diagram]    │                   │
│                                   │                   │
│  ## Implementation Details        │                   │
│  ### Phase 1: Core Layer          │                   │
│  [Narrative + config blocks]      │                   │
│  ```cisco                         │                   │
│  interface GigabitEthernet0/0     │                   │
│  ```                              │                   │
│                                   │                   │
│  ## Testing & Validation          │                   │
│  [Performance charts]             │                   │
└───────────────────────────────────┴───────────────────┘
```

### Key Features

1. **Interactive Topology Diagram**
   - Click nodes to see configuration
   - Zoom and pan
   - Node highlighting

2. **Implementation Narrative (Blog-style)**
   - Chronological sections
   - Code blocks for configurations
   - Embedded images/diagrams

3. **Configuration Code Blocks**
   - Syntax highlighting (Cisco, Juniper, etc.)
   - Copy button
   - File download

4. **Performance Charts**
   - Throughput graphs
   - Latency measurements
   - Before/after comparisons

### Specialized Components

```typescript
// InteractiveTopologyDiagram.tsx
import ReactFlow from 'reactflow';

<Box sx={{ height: 600, border: 1, borderColor: 'divider' }}>
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
<Paper elevation={1}>
  <Box sx={{ p: 1, bgcolor: 'grey.100', display: 'flex', justifyContent: 'space-between' }}>
    <Chip label="Cisco IOS Config" size="small" />
    <IconButton size="small" onClick={copyCode}>
      <ContentCopyIcon />
    </IconButton>
  </Box>
  <SyntaxHighlighter language="cisco" style={docco}>
    {configCode}
  </SyntaxHighlighter>
</Paper>
```

### Database Fields

```typescript
{
  type: 'network',
  topology_diagram_url: string,
  network_stats: {
    nodes: number,
    protocols: string[],
    throughput: string
  },
  config_files: [
    { name: string, content: string, device_type: string }
  ]
}
```

---

## Layout 3: Research Papers

**Platform Inspiration:** ArXiv + Google Scholar
**Best For:** Thesis, research papers, theoretical work
**Est. Usage:** 20-30% of projects

### Visual Structure

```
┌──────────────────────────────────┬───────────────────┐
│  # Paper Title                    │  STICKY SIDEBAR   │
│  👤 Authors                       │  👤 Authors       │
│  🏫 University, 2024              │  🎓 Advisor       │
│  📊 Approved                      │  📅 Published     │
│  🏷️ Keywords                     │                   │
│                                   │  📖 Citation:     │
│  ## Abstract                      │  [BibTeX] [APA]   │
│  [Structured: Background,         │                   │
│   Methods, Results, Conclusion]   │  📊 Metrics:      │
│                                   │    • Views: 342   │
│  TABS: Read Paper | Figures |     │    • Downloads    │
│        References | Supplementary │                   │
│                                   │  🔗 External:     │
│  ┌─ READ PAPER ─────────────────┐│    • DOI         │
│  │                               ││    • ArXiv       │
│  │  [Embedded PDF Viewer]        ││                   │
│  │  • Page navigation            ││  📦 Supplementary│
│  │  • Zoom                       ││    • Dataset.zip │
│  │  • Download                   ││    • Code.zip    │
│  └───────────────────────────────┘│                   │
└───────────────────────────────────┴───────────────────┘
```

### Key Features

1. **Structured Abstract**
   - Background
   - Methods/Methodology
   - Results
   - Conclusions

2. **Embedded PDF Viewer**
   - In-browser reading (pdf.js)
   - Page navigation
   - Zoom controls
   - Download button

3. **Citation Exporter**
   - BibTeX format
   - APA format
   - MLA format
   - One-click copy

4. **Tabs:**
   - **Read Paper:** Full PDF
   - **Figures & Tables:** Extracted visuals
   - **References:** Bibliography
   - **Supplementary:** Datasets, code, appendices

### Specialized Components

```typescript
// PDFViewer.tsx
import { Worker, Viewer } from '@react-pdf-viewer/core';

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
      <Button variant="outlined" onClick={() => copyCitation('apa')}>
        Copy APA
      </Button>
      <Button variant="outlined" onClick={() => copyCitation('mla')}>
        Copy MLA
      </Button>
    </Stack>
  </CardContent>
</Card>

// StructuredAbstract.tsx
<Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
  <Typography variant="h6" gutterBottom>Abstract</Typography>
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="primary">Background</Typography>
    <Typography variant="body2">{abstract.background}</Typography>
  </Box>
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="primary">Methods</Typography>
    <Typography variant="body2">{abstract.methods}</Typography>
  </Box>
  {/* Results, Conclusions... */}
</Paper>
```

### Database Fields

```typescript
{
  type: 'research',
  paper_url: string,
  doi: string,
  arxiv_id: string,
  abstract: {
    background: string,
    methods: string,
    results: string,
    conclusions: string
  },
  figures: [
    { url: string, caption: string, figure_number: string }
  ],
  references: [
    { citation: string, url: string }
  ],
  supplementary_files: [
    { name: string, url: string, type: 'dataset' | 'code' | 'appendix' }
  ]
}
```

---

## Layout 4: Design Projects

**Platform Inspiration:** Behance + Dribbble
**Best For:** UI/UX, graphic design, branding
**Est. Usage:** 15-20% of projects

### Visual Structure

```
┌──────────────────────────────────┬───────────────────┐
│  [Hero Image - Full Width]        │  STICKY SIDEBAR   │
│  [High-res final design]          │  👤 Designer      │
│                                   │  🎓 Advisor       │
│  # Project Title                  │  🔗 [View Proto]  │
│  📊 Status • Category             │                   │
│  🏷️ UI/UX, Branding              │  🎨 Tools:        │
│                                   │    • Figma        │
│  ## Project Brief                 │    • Illustrator  │
│  [Short problem statement]        │                   │
│                                   │  🎨 Color Palette │
│  ## VISUAL SHOWCASE               │  [Color swatches] │
│  [Free-flowing artboard]          │                   │
│                                   │  📊 Engagement:   │
│  ┌───────────────────────────────┐│    • 👁️ 234      │
│  │ [Full-width image]            ││    • ❤️ 89       │
│  └───────────────────────────────┘│                   │
│                                   │  📦 Files:        │
│  [Caption text]                   │    • Figma file   │
│                                   │    • Assets.zip   │
│  ┌──────┐ ┌──────┐               │                   │
│  │ Grid │ │ Grid │               │  🎨 More Work:    │
│  └──────┘ └──────┘               │  [Thumbnails]     │
│                                   │                   │
│  ## Interactive Prototype         │                   │
│  [Embedded Figma/InVision]        │                   │
│                                   │                   │
│  ## Style Guide                   │                   │
│  [Typography, colors, components] │                   │
└───────────────────────────────────┴───────────────────┘
```

### Key Features

1. **Hero Image**
   - Full-bleed, high-quality
   - Stunning final mockup

2. **Visual Showcase (Artboard)**
   - Free-flowing layout
   - Mix of full-width and grid images
   - Interspersed text descriptions
   - Tells the design story

3. **Interactive Prototype**
   - Embedded Figma/InVision/Framer
   - Clickable, interactive
   - Fullscreen mode

4. **Style Guide**
   - Typography hierarchy
   - Color palette with hex codes
   - Component library showcase

### Specialized Components

```typescript
// DesignArtboard.tsx
const contentBlocks = [
  { type: 'image', src: '...', layout: 'full' },
  { type: 'text', content: '...', variant: 'caption' },
  { type: 'imageGrid', images: [...], columns: 2 },
];

<Box sx={{ maxWidth: 900, mx: 'auto' }}>
  {contentBlocks.map((block, i) => {
    if (block.type === 'image') {
      return (
        <Box
          component="img"
          src={block.src}
          sx={{
            width: block.layout === 'full' ? '100%' : '80%',
            mx: 'auto',
            display: 'block',
            mb: 3
          }}
        />
      );
    }
    if (block.type === 'imageGrid') {
      return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {block.images.map((img, j) => (
            <Grid size={{ xs: 12 / block.columns }} key={j}>
              <Box component="img" src={img} sx={{ width: '100%' }} />
            </Grid>
          ))}
        </Grid>
      );
    }
    // ... more block types
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
    sx={{ width: '100%', height: 800, border: 'none' }}
  />
</Paper>

// ColorPaletteSwatch.tsx
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
      <Typography variant="caption" align="center" display="block">
        {color.hex}
      </Typography>
    </Grid>
  ))}
</Grid>
```

### Database Fields

```typescript
{
  type: 'design',
  hero_image_url: string,
  prototype_url: string,
  design_tools: string[], // ['Figma', 'Illustrator']
  colors: [
    { hex: string, name: string, usage: string }
  ],
  artboard_blocks: [
    { type: 'image' | 'text' | 'imageGrid', data: any, order: number }
  ],
  typography: {
    headings: string,
    body: string,
    fonts_used: string[]
  }
}
```

---

## Layout 5: Hardware/Engineering

**Platform Inspiration:** Instructables + Hackaday
**Best For:** Electronics, mechanical, robotics
**Est. Usage:** 10-15% of projects

### Visual Structure

```
┌──────────────────────────────────┬───────────────────┐
│  [Hero: 3D Render or Photo]      │  STICKY SIDEBAR   │
│                                   │  👥 Team          │
│  # Hardware Project Title         │  ⚙️ Quick Specs:  │
│  📊 Status • Category             │    • Size: X×Y×Z  │
│  🏷️ Arduino, IoT                 │    • Weight: 2kg  │
│                                   │  🛠️ Tools:        │
│  ## Overview                      │    • Arduino      │
│  [What it does]                   │    • 3D Printer   │
│                                   │  📂 Files:        │
│  ## Technical Specifications      │    • CAD (.stl)   │
│  | Spec  | Value |                │    • Schematics   │
│  |-------|-------|                │    • Firmware     │
│                                   │                   │
│  ## Bill of Materials (BOM)       │  🎥 Demo Video    │
│  | Part      | Qty | Link |       │                   │
│  |-----------|-----|------|       │                   │
│  | Arduino   | 1   | [🔗] |       │                   │
│                                   │                   │
│  ## 3D Model Viewer               │                   │
│  [Interactive 3D model]           │                   │
│                                   │                   │
│  ## Schematics                    │                   │
│  [Circuit diagrams - zoomable]    │                   │
│                                   │                   │
│  ## Build Process                 │                   │
│  ### Step 1: PCB Design           │                   │
│  [Photos + description]           │                   │
│                                   │                   │
│  ## Testing & Results             │                   │
│  [Charts, performance data]       │                   │
└───────────────────────────────────┴───────────────────┘
```

### Key Features

1. **Technical Specifications Table**
   - Dimensions, weight, power
   - Sortable table

2. **Bill of Materials (BOM)**
   - Component list with prices
   - Links to datasheets
   - Downloadable as CSV/Excel
   - Total cost calculation

3. **3D Model Viewer**
   - Interactive rotation, zoom, pan
   - Exploded view option
   - STL file support

4. **Build Process Log**
   - Step-by-step chronology
   - Photos at each stage
   - Code snippets (firmware)
   - Lessons learned

### Specialized Components

```typescript
// ThreeDModelViewer.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

<Box sx={{ height: 500, border: 1, borderColor: 'divider' }}>
  <Canvas>
    <ambientLight intensity={0.5} />
    <spotLight position={[10, 10, 10]} />
    <Suspense fallback={<Loader />}>
      <STLModel url={project.model_url} />
    </Suspense>
    <OrbitControls />
  </Canvas>
</Box>

// BillOfMaterialsTable.tsx
<TableContainer component={Paper}>
  <Table>
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
            <IconButton href={item.datasheet_url} size="small">
              <PictureAsPdfIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">Total Cost: ${totalCost}</Typography>
  </Box>
  <Button fullWidth variant="outlined" startIcon={<DownloadIcon />}>
    Download BOM as Excel
  </Button>
</TableContainer>
```

### Database Fields

```typescript
{
  type: 'hardware',
  model_3d_url: string, // .stl, .obj file
  specifications: {
    dimensions: string,
    weight: string,
    power: string
  },
  bill_of_materials: [
    {
      part_name: string,
      quantity: number,
      unit_cost: number,
      supplier: string,
      datasheet_url: string
    }
  ],
  schematics: [
    { url: string, type: 'circuit' | 'pcb' | 'mechanical' }
  ],
  build_steps: [
    { title: string, description: string, image_url: string, code: string?, order: number }
  ]
}
```

---

## Layout 6: Media/Creative

**Platform Inspiration:** Vimeo + Itch.io
**Best For:** Film, animation, game design
**Est. Usage:** 5-10% of projects

### Key Features

1. **Main Media Player** - Large video or game embed
2. **Credits Roll** - Formatted team credits by role
3. **Behind the Scenes** - Production gallery
4. **Press Kit** - Downloadable assets

```typescript
// VideoPlayer with chapters
<ReactPlayer
  url={project.video_url}
  controls
  width="100%"
  height="600px"
  config={{
    file: {
      attributes: {
        controlsList: 'nodownload'
      },
      tracks: project.chapters?.map(ch => ({
        kind: 'chapters',
        src: ch.vttFile,
        label: 'Chapters'
      }))
    }
  }}
/>

// WebGL Game Embed
<Box
  component="iframe"
  src={project.game_url}
  sx={{ width: '100%', height: 800, border: 'none' }}
  allow="fullscreen"
/>
```

---

## Layout 7: Business/Management

**Platform Inspiration:** McKinsey Insights + HBR
**Best For:** Case studies, strategic plans
**Est. Usage:** 5-10% of projects

### Key Features

1. **Executive Summary** - Concise overview
2. **Key Insights** - Carousel of main findings
3. **Structured Report** - Sections with accordions
4. **Interactive Dashboards** - Embedded Tableau/Power BI

```typescript
// SWOT Analysis Visualization
<Grid container spacing={2}>
  <Grid size={{ xs: 6 }}>
    <Card sx={{ bgcolor: 'success.light' }}>
      <CardHeader title="Strengths" />
      <CardContent>
        <List dense>
          {swot.strengths.map(s => <ListItem>{s}</ListItem>)}
        </List>
      </CardContent>
    </Card>
  </Grid>
  <Grid size={{ xs: 6 }}>
    <Card sx={{ bgcolor: 'warning.light' }}>
      <CardHeader title="Weaknesses" />
      <CardContent>
        <List dense>
          {swot.weaknesses.map(w => <ListItem>{w}</ListItem>)}
        </List>
      </CardContent>
    </Card>
  </Grid>
  {/* Opportunities and Threats... */}
</Grid>
```

---

## Layout 8: Medical/Health Sciences

**Platform Inspiration:** PubMed + The Lancet
**Best For:** Clinical studies, public health research
**Est. Usage:** 5% of projects

### Key Features

1. **Structured Abstract** (IMRaD format)
2. **Ethics Statement** - IRB approval info
3. **Anonymized Data Viewer**
4. **Protocols & Procedures**

```typescript
// Structured Medical Abstract
<Paper sx={{ p: 3, mb: 3 }}>
  <Typography variant="h6" gutterBottom>Abstract</Typography>
  {['Background', 'Methods', 'Results', 'Conclusions'].map(section => (
    <Box key={section} sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        {section}
      </Typography>
      <Typography variant="body2">{abstract[section.toLowerCase()]}</Typography>
    </Box>
  ))}
</Paper>

// Ethics Compliance Badge
<Alert severity="info" icon={<VerifiedIcon />}>
  This study was approved by the Institutional Review Board (IRB #12345).
  All participants provided informed consent.
</Alert>
```

---

## Layout 9: Data Science/ML

**Platform Inspiration:** Kaggle + Hugging Face
**Best For:** ML models, data analysis, AI projects
**Est. Usage:** 15-20% of projects

### Key Features

1. **Live Model Demo** - Interactive inference UI
2. **Performance Metrics** - Accuracy, F1, ROC curve
3. **Embedded Jupyter Notebook**
4. **Dataset Explorer**

```typescript
// Model Inference Demo
<Card>
  <CardHeader title="Try the Model" />
  <CardContent>
    <TextField
      fullWidth
      multiline
      rows={4}
      label="Input"
      value={input}
      onChange={e => setInput(e.target.value)}
    />
    <Button
      variant="contained"
      onClick={runInference}
      sx={{ mt: 2 }}
      fullWidth
    >
      Run Prediction
    </Button>
    {result && (
      <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="h6">Result:</Typography>
        <Typography variant="body1">{result.prediction}</Typography>
        <Typography variant="caption">
          Confidence: {(result.confidence * 100).toFixed(2)}%
        </Typography>
      </Paper>
    )}
  </CardContent>
</Card>

// Performance Metrics Dashboard
<Grid container spacing={2}>
  <Grid size={{ xs: 6, md: 3 }}>
    <MetricCard label="Accuracy" value="94.5%" icon={<CheckCircleIcon />} />
  </Grid>
  <Grid size={{ xs: 6, md: 3 }}>
    <MetricCard label="F1 Score" value="0.921" icon={<TrendingUpIcon />} />
  </Grid>
  {/* More metrics... */}
</Grid>
```

---

## Layout 10: Architecture

**Platform Inspiration:** ArchDaily + Dezeen
**Best For:** Building design, urban planning
**Est. Usage:** 5% of projects

### Key Features

1. **Hero Render** - Stunning visualization
2. **Interactive 3D Model** - Building walkthrough
3. **Render Gallery** - High-res images
4. **Floor Plans & Sections** - Technical drawings

```typescript
// 3D Building Model Viewer
<Canvas camera={{ position: [10, 10, 10] }}>
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} />
  <Suspense fallback={<Loader />}>
    <GLTFModel url={project.model_url} />
  </Suspense>
  <OrbitControls />
  <Environment preset="city" />
</Canvas>

// Floor Plan Viewer with Zoom
<TransformWrapper>
  <TransformComponent>
    <img
      src={floorPlan.url}
      alt={floorPlan.title}
      style={{ width: '100%' }}
    />
  </TransformComponent>
</TransformWrapper>
```

---

## Hybrid Projects

### Implementation

```typescript
// Example: ML project with research paper + web app
{
  type: 'data_science', // Primary
  secondary_types: ['research', 'software'],
  layout_config: {
    include_sections: [
      'model_demo',      // From data_science
      'pdf_viewer',      // From research
      'github_banner',   // From software
      'jupyter_notebook', // From data_science
      'citations'        // From research
    ],
    section_order: ['model_demo', 'paper', 'notebook', 'code', 'citations']
  }
}
```

### UI Indicator

```typescript
<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
  <Chip
    label="Data Science"
    color="primary"
    icon={<DataIcon />}
  />
  <Chip
    label="Research"
    variant="outlined"
    icon={<ArticleIcon />}
    size="small"
  />
  <Chip
    label="Software"
    variant="outlined"
    icon={<CodeIcon />}
    size="small"
  />
</Stack>
```

---

## Shared Components

These appear in **all** layouts:

### 1. Breadcrumbs (Top)
```typescript
<Breadcrumbs>
  Home > Explore > {program} > {project.title}
</Breadcrumbs>
```

### 2. Sticky Sidebar (Right)
- Team members + Advisor
- Primary actions (Bookmark, Follow)
- Stats (views, downloads, date)
- Related projects

### 3. Comment Thread (Bottom)
- GitHub-style threaded comments
- Markdown support
- Reactions

### 4. Related Projects (Bottom)
- Algorithm-based suggestions
- 3-5 similar projects

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create base `ProjectDetailLayout` wrapper
- [ ] Implement layout registry system
- [ ] Build shared components (Breadcrumbs, Sidebar, Comments)
- [ ] Add `type` field to database

### Phase 2: Core Layouts (Week 2-3)
- [ ] Software layout (most common)
- [ ] Research layout (most common)
- [ ] Design layout (visually complex)
- [ ] Test with real project data

### Phase 3: Remaining Layouts (Week 4)
- [ ] Hardware, Network, Data Science
- [ ] Media, Business, Medical, Architecture
- [ ] Mobile responsive for all

### Phase 4: Hybrid System (Week 5)
- [ ] Secondary types implementation
- [ ] Section injection mechanism
- [ ] Testing with hybrid projects

---

## Success Metrics

### User Engagement
- **Time on Page:** 40% increase
- **File Downloads:** 25% increase
- **Demo Interactions:** 50% of applicable projects

### Content Quality
- **Complete Profiles:** 80% have all type-specific fields
- **Rich Media:** 60% include demos/videos/models

### Technical Performance
- **Load Time:** < 2.5s for all types
- **Interactive:** < 500ms
- **Bundle Size:** < 300KB per layout (lazy loaded)

---

This specification provides everything needed to implement all 10 project type layouts. Start with Software and Research (most common), then expand to others based on usage patterns.
