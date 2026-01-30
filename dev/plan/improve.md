# Fahras Improvement Plan: Modular Monolith Architecture

**Date:** January 30, 2026
**Strategy:** Separate "Tracker" and "Archiver" Domains (Modular Monolith)
**Goal:** Improve system maintainability and allow direct project archiving without the complexity of a distributed microservice architecture.

---

## 1. Core Concept: Domain Separation

We will transition from a tangled structure to a **Modular Monolith**. This keeps the infrastructure simple (One Laravel App, One DB) but logically separates the code into two distinct domains.

| Feature | **Project Tracker** (The Factory) 🏗️ | **Project Archiver** (The Showroom) 🏛️ |
| :--- | :--- | :--- |
| **Goal** | Managing the lifecycle (Creation → Review → Approval). | Discovery, Search, and Preservation. |
| **Users** | Students, Faculty, Supervisors. | Public, Companies, Researchers, Admins. |
| **Nature** | **Write-Heavy**. Complex state machines, permissions. | **Read-Heavy**. High performance, advanced search. |
| **State** | Dynamic (`draft`, `pending`, `changes_requested`). | Static (`published`, `archived`). |
| **Access** | Strictly Authenticated & Role-Based. | Public / Guest Access allowed. |

---

## 2. Architecture Refactoring

We will restructure `api/app/Domains` to reflect this separation.

### Current Structure (Tangled)
```text
api/app/Domains/Projects/
    ├── Controllers/ProjectController.php (50+ methods - Too Large)
```

### Proposed Structure (Modular)
```text
api/app/Domains/
    ├── Tracker/               <-- The "Tracker" Logic (Workflow)
    │   ├── Controllers/
    │   │   ├── SubmissionController.php   (Student submission flow)
    │   │   ├── MilestoneController.php    (Progress tracking)
    │   │   └── SupervisionController.php  (Faculty oversight)
    │   └── Services/
    │       └── ApprovalWorkflowService.php
    │
    └── Archiver/              <-- The "Archiver" Logic (Storage & View)
        ├── Controllers/
        │   ├── PublicDiscoveryController.php  (The "Viewer" API - Read Optimized)
        │   └── LegacyImportController.php     (Direct Add for Admins)
        └── Services/
            └── SearchService.php
```

---

## 3. Feature: Direct Archiving ("No Headache")

To satisfy the requirement: *"Faculty or admin can add Project to Archiver directly with no headache of tracker!"*

We will implement a **Direct Import Pathway** that bypasses the student workflow.

### Implementation Details
1.  **New Endpoint**: `POST /api/archiver/import`
2.  **Logic**:
    *   **Bypass Workflow**: Force status to `APPROVED/COMPLETED` immediately.
    *   **Flexible Authors**: Allow free-text `external_authors` (JSON) for projects where students are not registered users.
    *   **Skip Overhead**: No milestones, no templates, no rigorous validation.
3.  **Database Change**:
    *   Add `is_legacy_import` (boolean) to `projects` table.

```php
// Concept Code: LegacyImportController
public function store(ImportProjectRequest $request)
{
    $project = Project::create([
        'title' => $request->title,
        'status' => ProjectStatus::COMPLETED,
        'approval_status' => ApprovalStatus::APPROVED,
        'is_legacy_import' => true, // Flag to distinguish from tracked projects
        'published_at' => now(),
        'external_authors' => $request->authors_list, // JSON for non-user authors
    ]);

    // Direct file attachment without review process
    if ($request->hasFile('document')) {
        $this->fileService->upload($project, $request->file('document'));
    }
}
```

---

## 4. The "Viewer" Optimization (Read-Only API)

Instead of a separate backend, we create a specialized **Read API** for the Viewer.

1.  **Dedicated Routes**: `routes/api.php` -> prefix `/public` or `/archive`.
2.  **Performance Strategy**:
    *   **Heavy Caching**: Cache public project details in Redis (TTL: 1 hour+).
    *   **Lean Queries**: Select only necessary columns (e.g., no internal audit logs or flags).
    *   **ElasticSearch Ready**: Keep the design ready to swap SQL search for Elastic/MeiliSearch in the future without changing the frontend.

---

## 5. Migration Roadmap

1.  **Phase 1: Database Prep**
    *   Add `is_legacy_import` column to `projects`.
    *   Add `external_authors` JSON column to `projects`.

2.  **Phase 2: Refactor Controllers**
    *   Split `ProjectController` into `Tracker/SubmissionController` and `Archiver/PublicDiscoveryController`.

3.  **Phase 3: Build Import Tool**
    *   Implement `LegacyImportController`.
    *   Build the Admin UI for "Direct Archive".

4.  **Phase 4: Event-Driven Sync**
    *   Create `ProjectApproved` event.
    *   Ensure "Tracked" projects automatically become "Archived" projects when approved, seamless to the viewer.

---
---

# Update 1: Refined User Roles & Automated Milestones
**Date:** January 30, 2026

## 6. Simplified User Roles (Cleaned)

We strictly define the system users to these 4 roles. **All other legacy roles (Reviewer, Faculty, etc.) will be removed or migrated.**

1.  **Student**: Can create projects, submit milestones, view their own progress.
2.  **Practical Teacher** (Supervisor):
    *   Focus: **Project Tracker**.
    *   Responsibilities: Daily supervision, approving milestones, technical guidance.
3.  **Theoretical Teacher** (Evaluator):
    *   Focus: **Project Archiver / Final Review**.
    *   Responsibilities: Final grading, academic evaluation, quality assurance before archiving.
4.  **Admin**: System configuration, user management, and "Direct Archive" overrides.

> **Migration Note:** Existing `faculty` users will be mapped to `Practical Teacher` or `Theoretical Teacher` based on their department function. `Reviewer` role will be merged into `Theoretical Teacher`.

## 7. The New "3-Step" Project Journey

We replace the complex approval workflows with a linear, role-based journey.

### Step 1: The "Tracker" Phase (Execution)
*   **Actors:** Student & Practical Teacher.
*   **Action:** Student creates project → System *automatically* assigns standard milestones.
*   **Flow:** Student submits milestone work → Practical Teacher clicks "Check/Approve" (Daily Supervision).
*   **Goal:** Complete the work. No grading here, just "Done/Not Done".

### Step 2: The "Defense" Phase (Evaluation)
*   **Actors:** Theoretical Teacher.
*   **Trigger:** When Practical Teacher marks project "Complete", it moves to Theoretical Teacher's queue.
*   **Action:** Theoretical Teacher reviews final report/presentation and assigns the **Final Grade** (A, B, C...).
*   **Goal:** Academic Quality Control.

### Step 3: The "Archiver" Phase (Publication)
*   **Actors:** System (Automated).
*   **Trigger:** Once Theoretical Teacher marks it as "Passed".
*   **Action:** System *automatically* publishes to Archiver, generates SEO pages, and creates the Student's "Digital Credential".

## 8. Preconfigured Simple Milestones (Automated Tracker)

To ensure the "Tracker" is not a headache, we introduce **Automated Milestone Templates**.

*   **No Manual Setup:** Milestones are pre-configured by Admins per Program/Department.
*   **Auto-Apply:** When a Student creates a project, the system *automatically* applies the correct "Simple Milestone Track" (e.g., Proposal → implementation → Report → Defense).
*   **Zero Configuration:** Practical Teachers do not need to create milestones manually. They simply click "Approve" or "Reject" on pre-generated items.

---
---

# Update 2: Enterprise Polish & Discovery
**Date:** January 30, 2026

## 9. SEO & Social Discovery (The "Showroom" Fix)
**Goal:** Ensure projects look professional when shared on LinkedIn/WhatsApp.
*   **Problem:** React SPA returns "Loading..." preview for all links.
*   **Solution:** **Lightweight Metadata Proxy**.
    *   Create a simple Laravel Blade view for `/project/{slug}` that renders *only* the `<head>` tags (Open Graph Image, Title, Abstract).
    *   This ensures indexability without rewriting the entire frontend in Next.js.

## 10. Advanced Arabic Search
**Goal:** Fix "typo" and "morphology" issues in Arabic search.
*   **Solution:** Integrate **Meilisearch** (or Typesense).
*   **Benefit:** "Typo Tolerance" ensures that searching for "tasmem" matches "tasmeem", and "تصميم" matches "مصمم". Critical for industrial discovery.

## 11. Storage Security Constraints
**Goal:** Prevent storage abuse and malware.
*   **Action:**
    *   **Magic Byte Validation:** Verify real file types, not just extensions.
    *   **Constraints:** Set strict limits (e.g., 50MB docs, 500MB zip).
    *   **Sanitization:** Block executable files (`.exe`, `.sh`, `.php`) inside uploaded ZIPs.

## 12. Student "Digital Credentials"
**Goal:** Give students tangible value for their CVs.
*   **Feature:** **Verified Project Permlink**.
    *   When a "Theoretical Teacher" grades a project as "A" or "Pass", generate a permanent, verifiable URL/QR Code.
    *   Students can attach this to their LinkedIn profile as a "Verified Certification" from the university.

---
---

# Update 3: Academic Integrity & Quality
**Date:** January 30, 2026

## 13. Plagiarism Shield (Turnitin Integration)
**Goal:** Ensure academic honesty and reduce "recycled" projects.
*   **Implementation:**
    *   **Internal Shield:** Compare new submissions against the existing **Archiver** database (Cosine Similarity on vectors).
    *   **External Shield:** Add support for Turnitin API (optional config).
*   **Workflow:** Theoretical Teacher sees a "Similarity Score %" on the dashboard before grading.

## 14. Dynamic Project Scaffolding
**Goal:** Enforce project structure *before* code is written.
*   **Problem:** Students upload messy ZIP files with node_modules, temp files, or unstructured chaos.
*   **Solution:** **Downloadable Starter Kits**.
    *   When a project is created, the system generates a tailored `.zip` based on the Department (e.g., CS get a specific folder structure, Engineering get another).
    *   Includes `README.md` template, `src/`, `docs/`, and `presentation/` folders.
