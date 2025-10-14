<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class DocumentExportController extends Controller
{
    /**
     * Export project documentation in specified format
     * 
     * @param Request $request
     * @param Project $project
     * @return Response
     */
    public function export(Request $request, Project $project)
    {
        $user = $request->user();
        
        // Access Control - Check if user can export this project
        if (!$this->canExportProject($user, $project)) {
            return response()->json([
                'message' => 'You do not have permission to export this project'
            ], 403);
        }

        $format = $request->query('format', 'pdf'); // pdf, docx, pptx
        $template = $request->query('template', 'report'); // report, presentation
        $rtl = $request->query('rtl', 'auto'); // auto, force, ltr
        
        // Load project relationships
        $project->load([
            'program.department',
            'creator',
            'members',
            'advisors',
            'approver'
        ]);

        try {
            switch ($format) {
                case 'pdf':
                    return $this->generatePDF($project, $template, $rtl);
                case 'docx':
                    return $this->generateDOCX($project, $template, $rtl);
                case 'pptx':
                    return $this->generatePPTX($project, $template, $rtl);
                default:
                    return response()->json(['message' => 'Invalid format specified'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Document export failed', [
                'project_id' => $project->id,
                'format' => $format,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to generate document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate PDF document using mPDF
     */
    private function generatePDF(Project $project, string $template, string $rtl)
    {
        // Detect if content is primarily Arabic
        $isRTL = $this->detectRTL($project, $rtl);
        
        // Academic formatting standards from Graduation Project Guide
        // For RTL (Arabic): 2.5cm right, 2.0cm top/bottom/left
        // For LTR (English): 2.5cm left, 2.0cm top/bottom/right
        $mpdf = new \Mpdf\Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'default_font' => $isRTL ? 'dejavusans' : 'dejavusans',
            'directionality' => $isRTL ? 'rtl' : 'ltr',
            'autoScriptToLang' => true,
            'autoLangToFont' => true,
            'margin_left' => $isRTL ? 20 : 25,   // 2.0cm for RTL, 2.5cm for LTR
            'margin_right' => $isRTL ? 25 : 20,  // 2.5cm for RTL, 2.0cm for LTR
            'margin_top' => 20,                  // 2.0cm
            'margin_bottom' => 20,               // 2.0cm
            'margin_header' => 9,
            'margin_footer' => 9,
        ]);

        // Build HTML content
        $html = $this->buildPDFHTML($project, $template, $isRTL);
        
        $mpdf->WriteHTML($html);
        
        // Generate filename with project title (sanitized)
        $filename = $this->sanitizeFilename($project->title) . '.pdf';
        
        return response($mpdf->Output($filename, 'S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"; filename*=UTF-8\'\'' . rawurlencode($filename),
        ]);
    }

    /**
     * Generate DOCX document using PHPWord
     */
    private function generateDOCX(Project $project, string $template, string $rtl)
    {
        $phpWord = new \PhpOffice\PhpWord\PhpWord();
        
        // Detect if content is primarily Arabic
        $isRTL = $this->detectRTL($project, $rtl);
        
        // Set document properties
        $properties = $phpWord->getDocInfo();
        $properties->setCreator('TVTC Fahras System');
        $properties->setTitle($project->title);
        $properties->setDescription($project->abstract);
        $properties->setSubject('Graduation Project Documentation');
        
        // Add section with RTL support if needed
        $section = $phpWord->addSection([
            'orientation' => 'portrait',
            'marginLeft' => 1134, // 2cm in twips
            'marginRight' => 1134,
            'marginTop' => 1134,
            'marginBottom' => 1134,
        ]);
        
        if ($isRTL) {
            $section->setRTL(true);
        }
        
        // Build document content
        $this->buildDOCXContent($phpWord, $section, $project, $isRTL);
        
        // Save to temp file
        $filename = $this->sanitizeFilename($project->title) . '.docx';
        $tempFile = tempnam(sys_get_temp_dir(), 'docx_');
        
        $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($tempFile);
        
        $content = file_get_contents($tempFile);
        unlink($tempFile);
        
        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"; filename*=UTF-8\'\'' . rawurlencode($filename),
        ]);
    }

    /**
     * Generate PPTX presentation using PHPPresentation
     */
    private function generatePPTX(Project $project, string $template, string $rtl)
    {
        $presentation = new \PhpOffice\PhpPresentation\PhpPresentation();
        
        // Set presentation properties
        $presentation->getDocumentProperties()
            ->setCreator('TVTC Fahras System')
            ->setTitle($project->title)
            ->setDescription($project->abstract)
            ->setSubject('Graduation Project Presentation');
        
        // Set 16:9 layout
        $presentation->getLayout()->setDocumentLayout(
            \PhpOffice\PhpPresentation\DocumentLayout::LAYOUT_SCREEN_16X9
        );
        
        // Remove default slide
        $presentation->removeSlideByIndex(0);
        
        // Detect RTL
        $isRTL = $this->detectRTL($project, $rtl);
        
        // Build presentation content
        $this->buildPPTXContent($presentation, $project, $isRTL);
        
        // Save to temp file
        $filename = $this->sanitizeFilename($project->title) . '.pptx';
        $tempFile = tempnam(sys_get_temp_dir(), 'pptx_');
        
        $objWriter = \PhpOffice\PhpPresentation\IOFactory::createWriter($presentation, 'PowerPoint2007');
        $objWriter->save($tempFile);
        
        $content = file_get_contents($tempFile);
        unlink($tempFile);
        
        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"; filename*=UTF-8\'\'' . rawurlencode($filename),
        ]);
    }

    /**
     * Build HTML content for PDF
     */
    private function buildPDFHTML(Project $project, string $template, bool $isRTL): string
    {
        $dir = $isRTL ? 'rtl' : 'ltr';
        $align = $isRTL ? 'right' : 'left';
        
        $html = <<<HTML
<!DOCTYPE html>
<html dir="{$dir}">
<head>
    <meta charset="UTF-8">
    <style>
        /* Academic formatting standards from Graduation Project Guide */
        body {
            font-family: 'DejaVu Sans', sans-serif;
            direction: {$dir};
            text-align: {$align};
            font-size: 14pt;  /* Standard: 14pt */
            line-height: 1.5;
        }
        .cover-page {
            text-align: center;
            padding-top: 100px;
        }
        .logo {
            font-size: 18pt;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 30px;
        }
        .title {
            font-size: 18pt;  /* Main titles: 18pt Bold */
            font-weight: bold;
            color: #000;
            margin: 40px 0 20px 0;
            text-transform: uppercase;
        }
        .subtitle {
            font-size: 16pt;  /* Subtitles: 16pt Bold */
            font-weight: bold;
            color: #333;
            margin: 25px 0 15px 0;
        }
        .metadata {
            font-size: 14pt;
            color: #333;
            margin: 15px 0;
            line-height: 1.8;
        }
        .section-title {
            font-size: 18pt;  /* Main titles: 18pt Bold */
            font-weight: bold;
            color: #000;
            margin: 35px 0 20px 0;
            text-transform: uppercase;
            border-bottom: none;
        }
        .subsection-title {
            font-size: 16pt;  /* Subtitles: 16pt Bold */
            font-weight: bold;
            color: #333;
            margin: 25px 0 15px 0;
        }
        .content {
            font-size: 14pt;  /* Body text: 14pt */
            line-height: 1.6;
            text-align: justify;
            margin: 10px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14pt;
        }
        table th {
            background-color: #f0f0f0;
            color: #000;
            padding: 12px;
            text-align: {$align};
            font-weight: bold;
            border: 1px solid #333;
        }
        table td {
            border: 1px solid #333;
            padding: 10px;
            text-align: {$align};
        }
        .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12pt;
            margin: 5px;
            font-weight: bold;
        }
        .badge-success { background-color: #10b981; color: white; }
        .badge-warning { background-color: #f59e0b; color: white; }
        .badge-info { background-color: #3b82f6; color: white; }
        .footer {
            text-align: center;
            font-size: 11pt;
            color: #666;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
        }
        .page-number {
            text-align: center;
            font-size: 12pt;
        }
    </style>
</head>
<body>
HTML;

        // Cover Page
        $html .= $this->buildCoverPage($project);
        
        // Project Information
        $html .= '<div style="page-break-before: always;"></div>';
        $html .= $this->buildProjectInfo($project, $align);
        
        // Abstract
        $html .= $this->buildAbstractSection($project);
        
        // Keywords
        if (!empty($project->keywords)) {
            $html .= $this->buildKeywordsSection($project);
        }
        
        // Team Members
        $html .= $this->buildTeamMembersSection($project, $align);
        
        // Advisors
        $html .= $this->buildAdvisorsSection($project, $align);
        
        // Footer
        $html .= $this->buildFooter($project);
        
        $html .= '</body></html>';
        
        return $html;
    }

    private function buildCoverPage(Project $project): string
    {
        $year = htmlspecialchars($project->academic_year ?? '');
        $semester = htmlspecialchars(ucfirst($project->semester ?? ''));
        $program = htmlspecialchars($project->program->name ?? '');
        $department = htmlspecialchars($project->program->department->name ?? '');
        $title = htmlspecialchars($project->title);
        $creator = htmlspecialchars($project->creator->full_name ?? '');
        
        return <<<HTML
<div class="cover-page">
    <div class="logo" style="font-size: 18pt; font-weight: bold;">المؤسسة العامة للتدريب التقني والمهني</div>
    <div class="logo" style="font-size: 16pt;">Technical and Vocational Training Corporation</div>
    <div class="logo" style="font-size: 18pt; margin-top: 40px; margin-bottom: 60px;">GRADUATION PROJECT</div>
    
    <div class="title" style="margin: 60px 0 40px 0; line-height: 1.4;">{$title}</div>
    
    <div class="metadata" style="margin-top: 80px;">
        <p style="font-size: 16pt; font-weight: bold; margin: 15px 0;">Submitted by:</p>
        <p style="font-size: 14pt; margin: 10px 0;">{$creator}</p>
    </div>
    
    <div class="metadata" style="margin-top: 40px;">
        <p style="font-size: 14pt; margin: 10px 0;"><strong>{$program}</strong></p>
        <p style="font-size: 14pt; margin: 10px 0;">{$department}</p>
    </div>
    
    <div class="metadata" style="margin-top: 50px;">
        <p style="font-size: 14pt; margin: 10px 0;"><strong>Academic Year:</strong> {$year}</p>
        <p style="font-size: 14pt; margin: 10px 0;"><strong>Semester:</strong> {$semester}</p>
    </div>
</div>
HTML;
    }

    private function buildProjectInfo(Project $project, string $align): string
    {
        $statusColors = [
            'draft' => 'warning',
            'submitted' => 'info',
            'under_review' => 'info',
            'approved' => 'success',
            'completed' => 'success',
        ];
        
        $statusColor = $statusColors[$project->status] ?? 'info';
        $status = htmlspecialchars(ucfirst(str_replace('_', ' ', $project->status)));
        $approvalStatus = htmlspecialchars(ucfirst($project->admin_approval_status ?? ''));
        
        $html = '<div class="section-title">Project Information</div>';
        $html .= '<div class="content">';
        $html .= '<p><strong>Status:</strong> <span class="badge badge-' . $statusColor . '">' . $status . '</span></p>';
        $html .= '<p><strong>Approval Status:</strong> <span class="badge badge-info">' . $approvalStatus . '</span></p>';
        
        if ($project->doi) {
            $html .= '<p><strong>DOI:</strong> ' . htmlspecialchars($project->doi) . '</p>';
        }
        
        if ($project->repo_url) {
            $html .= '<p><strong>Repository:</strong> ' . htmlspecialchars($project->repo_url) . '</p>';
        }
        
        $html .= '</div>';
        
        return $html;
    }

    private function buildAbstractSection(Project $project): string
    {
        $abstract = htmlspecialchars($project->abstract);
        $wordCount = str_word_count(strip_tags($project->abstract));
        
        return <<<HTML
<div class="section-title">Abstract</div>
<div class="content">
    <p>{$abstract}</p>
    <p style="font-size: 10px; color: #999; margin-top: 10px;">Word count: {$wordCount}</p>
</div>
HTML;
    }

    private function buildKeywordsSection(Project $project): string
    {
        $keywords = is_array($project->keywords) 
            ? implode(', ', array_map('htmlspecialchars', $project->keywords))
            : htmlspecialchars($project->keywords);
        
        return <<<HTML
<div class="section-title">Keywords</div>
<div class="content">
    <p>{$keywords}</p>
</div>
HTML;
    }

    private function buildTeamMembersSection(Project $project, string $align): string
    {
        $html = '<div class="section-title">Team Members</div>';
        $html .= '<table>';
        $html .= '<thead><tr><th>Name</th><th>Role</th><th>Email</th></tr></thead>';
        $html .= '<tbody>';
        
        // Process regular members (from database relationship)
        foreach ($project->members as $member) {
            $name = htmlspecialchars($member->full_name);
            $role = htmlspecialchars($member->pivot->role_in_project ?? 'MEMBER');
            $email = htmlspecialchars($member->email ?? 'N/A');
            
            $html .= "<tr><td>{$name}</td><td>{$role}</td><td>{$email}</td></tr>";
        }
        
        // Process custom members (from JSON field)
        if ($project->custom_members) {
            foreach ($project->custom_members as $customMember) {
                $name = htmlspecialchars($customMember['name']);
                $role = htmlspecialchars($customMember['role'] ?? 'MEMBER');
                $email = 'N/A'; // Custom members don't have email
                
                $html .= "<tr><td>{$name}</td><td>{$role}</td><td>{$email}</td></tr>";
            }
        }
        
        $html .= '</tbody></table>';
        
        return $html;
    }

    private function buildAdvisorsSection(Project $project, string $align): string
    {
        $hasRegularAdvisors = !$project->advisors->isEmpty();
        $hasCustomAdvisors = !empty($project->custom_advisors);
        
        if (!$hasRegularAdvisors && !$hasCustomAdvisors) {
            return '';
        }
        
        $html = '<div class="section-title">Project Advisors</div>';
        $html .= '<table>';
        $html .= '<thead><tr><th>Name</th><th>Role</th><th>Email</th></tr></thead>';
        $html .= '<tbody>';
        
        // Process regular advisors (from database relationship)
        foreach ($project->advisors as $advisor) {
            $name = htmlspecialchars($advisor->full_name);
            $role = htmlspecialchars($advisor->pivot->advisor_role ?? 'ADVISOR');
            $email = htmlspecialchars($advisor->email ?? 'N/A');
            
            $html .= "<tr><td>{$name}</td><td>{$role}</td><td>{$email}</td></tr>";
        }
        
        // Process custom advisors (from JSON field)
        if ($project->custom_advisors) {
            foreach ($project->custom_advisors as $customAdvisor) {
                $name = htmlspecialchars($customAdvisor['name']);
                $role = htmlspecialchars($customAdvisor['role'] ?? 'ADVISOR');
                $email = 'N/A'; // Custom advisors don't have email
                
                $html .= "<tr><td>{$name}</td><td>{$role}</td><td>{$email}</td></tr>";
            }
        }
        
        $html .= '</tbody></table>';
        
        return $html;
    }

    private function buildFooter(Project $project): string
    {
        $title = htmlspecialchars($project->title);
        $date = date('F j, Y');
        
        return <<<HTML
<div class="footer">
    <p>{$title}</p>
    <p>Generated by TVTC Fahras System - {$date}</p>
</div>
HTML;
    }

    /**
     * Build content for DOCX document
     */
    private function buildDOCXContent($phpWord, $section, Project $project, bool $isRTL)
    {
        // Define styles
        $phpWord->addFontStyle('titleStyle', ['size' => 28, 'bold' => true, 'color' => '1e3a8a']);
        $phpWord->addFontStyle('headingStyle', ['size' => 20, 'bold' => true, 'color' => '1e3a8a']);
        $phpWord->addFontStyle('normalStyle', ['size' => 12]);
        $phpWord->addParagraphStyle('centerAlign', ['alignment' => 'center']);
        $phpWord->addParagraphStyle('rightAlign', ['alignment' => 'right', 'bidi' => $isRTL]);
        
        // Cover Page
        $section->addText('TVTC - FAHRAS', 'titleStyle', 'centerAlign');
        $section->addText('Graduation Project Documentation', 'headingStyle', 'centerAlign');
        $section->addTextBreak(2);
        $section->addText($project->title, 'titleStyle', 'centerAlign');
        $section->addTextBreak(1);
        $section->addText($project->program->name ?? '', 'normalStyle', 'centerAlign');
        $section->addText($project->program->department->name ?? '', 'normalStyle', 'centerAlign');
        $section->addText($project->academic_year . ' - ' . ucfirst($project->semester), 'normalStyle', 'centerAlign');
        
        // Page break
        $section->addPageBreak();
        
        // Abstract
        $section->addText('Abstract', 'headingStyle', $isRTL ? 'rightAlign' : null);
        $section->addTextBreak(1);
        $section->addText($project->abstract, 'normalStyle', $isRTL ? 'rightAlign' : null);
        $section->addTextBreak(2);
        
        // Keywords
        if (!empty($project->keywords)) {
            $section->addText('Keywords', 'headingStyle', $isRTL ? 'rightAlign' : null);
            $keywords = is_array($project->keywords) ? implode(', ', $project->keywords) : $project->keywords;
            $section->addText($keywords, 'normalStyle', $isRTL ? 'rightAlign' : null);
            $section->addTextBreak(2);
        }
        
        // Team Members
        $section->addText('Team Members', 'headingStyle', $isRTL ? 'rightAlign' : null);
        $section->addTextBreak(1);
        
        $table = $section->addTable(['borderSize' => 6, 'borderColor' => '999999']);
        $table->addRow();
        $table->addCell(3000)->addText('Name', ['bold' => true]);
        $table->addCell(2000)->addText('Role', ['bold' => true]);
        $table->addCell(3000)->addText('Email', ['bold' => true]);
        
        // Process regular members (from database relationship)
        foreach ($project->members as $member) {
            $table->addRow();
            $table->addCell(3000)->addText($member->full_name);
            $table->addCell(2000)->addText($member->pivot->role_in_project ?? 'MEMBER');
            $table->addCell(3000)->addText($member->email ?? 'N/A');
        }
        
        // Process custom members (from JSON field)
        if ($project->custom_members) {
            foreach ($project->custom_members as $customMember) {
                $table->addRow();
                $table->addCell(3000)->addText($customMember['name']);
                $table->addCell(2000)->addText($customMember['role'] ?? 'MEMBER');
                $table->addCell(3000)->addText('N/A'); // Custom members don't have email
            }
        }
        
        // Advisors
        $hasRegularAdvisors = $project->advisors->isNotEmpty();
        $hasCustomAdvisors = !empty($project->custom_advisors);
        
        if ($hasRegularAdvisors || $hasCustomAdvisors) {
            $section->addTextBreak(2);
            $section->addText('Project Advisors', 'headingStyle', $isRTL ? 'rightAlign' : null);
            $section->addTextBreak(1);
            
            $table = $section->addTable(['borderSize' => 6, 'borderColor' => '999999']);
            $table->addRow();
            $table->addCell(3000)->addText('Name', ['bold' => true]);
            $table->addCell(2000)->addText('Role', ['bold' => true]);
            $table->addCell(3000)->addText('Email', ['bold' => true]);
            
            // Process regular advisors (from database relationship)
            foreach ($project->advisors as $advisor) {
                $table->addRow();
                $table->addCell(3000)->addText($advisor->full_name);
                $table->addCell(2000)->addText($advisor->pivot->advisor_role ?? 'ADVISOR');
                $table->addCell(3000)->addText($advisor->email ?? 'N/A');
            }
            
            // Process custom advisors (from JSON field)
            if ($project->custom_advisors) {
                foreach ($project->custom_advisors as $customAdvisor) {
                    $table->addRow();
                    $table->addCell(3000)->addText($customAdvisor['name']);
                    $table->addCell(2000)->addText($customAdvisor['role'] ?? 'ADVISOR');
                    $table->addCell(3000)->addText('N/A'); // Custom advisors don't have email
                }
            }
        }
    }

    /**
     * Build content for PPTX presentation
     */
    private function buildPPTXContent($presentation, Project $project, bool $isRTL)
    {
        // Slide 1: Title Slide
        $slide = $presentation->createSlide();
        $slide->setName('Title');
        
        $title = $slide->createRichTextShape();
        $title->setHeight(100)->setWidth(900)->setOffsetX(50)->setOffsetY(200);
        $title->getActiveParagraph()->getAlignment()->setHorizontal($isRTL ? 'r' : 'c');
        $title->createTextRun('TVTC Fahras')
            ->getFont()->setBold(true)->setSize(32)->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF1e3a8a'));
        
        $subtitle = $slide->createRichTextShape();
        $subtitle->setHeight(60)->setWidth(900)->setOffsetX(50)->setOffsetY(320);
        $subtitle->getActiveParagraph()->getAlignment()->setHorizontal($isRTL ? 'r' : 'c');
        $subtitle->createTextRun($project->title)
            ->getFont()->setSize(24)->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF333333'));
        
        // Slide 2: Overview
        $slide = $presentation->createSlide();
        $slide->setName('Overview');
        
        $titleShape = $slide->createRichTextShape();
        $titleShape->setHeight(50)->setWidth(900)->setOffsetX(50)->setOffsetY(50);
        $titleShape->getActiveParagraph()->getAlignment()->setHorizontal($isRTL ? 'r' : 'l');
        $titleShape->createTextRun('Project Overview')
            ->getFont()->setBold(true)->setSize(28)->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF1e3a8a'));
        
        $content = $slide->createRichTextShape();
        $content->setHeight(400)->setWidth(900)->setOffsetX(50)->setOffsetY(120);
        $content->getActiveParagraph()->getAlignment()->setHorizontal($isRTL ? 'r' : 'l');
        
        $content->createTextRun('Program: ' . ($project->program->name ?? '') . "\n")
            ->getFont()->setSize(16);
        $content->createParagraph()->createTextRun('Department: ' . ($project->program->department->name ?? '') . "\n")
            ->getFont()->setSize(16);
        $content->createParagraph()->createTextRun('Academic Year: ' . $project->academic_year . "\n")
            ->getFont()->setSize(16);
        $content->createParagraph()->createTextRun('Semester: ' . ucfirst($project->semester) . "\n")
            ->getFont()->setSize(16);
        $content->createParagraph()->createTextRun('Status: ' . ucfirst(str_replace('_', ' ', $project->status)))
            ->getFont()->setSize(16);
        
        // Slide 3: Abstract
        $slide = $presentation->createSlide();
        $slide->setName('Abstract');
        
        $titleShape = $slide->createRichTextShape();
        $titleShape->setHeight(50)->setWidth(900)->setOffsetX(50)->setOffsetY(50);
        $titleShape->getActiveParagraph()->getAlignment()->setHorizontal($isRTL ? 'r' : 'l');
        $titleShape->createTextRun('Abstract')
            ->getFont()->setBold(true)->setSize(28)->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF1e3a8a'));
        
        $abstractText = $slide->createRichTextShape();
        $abstractText->setHeight(400)->setWidth(900)->setOffsetX(50)->setOffsetY(120);
        $abstractText->getActiveParagraph()->getAlignment()->setHorizontal($isRTL ? 'r' : 'l');
        $abstractText->createTextRun(substr($project->abstract, 0, 500) . (strlen($project->abstract) > 500 ? '...' : ''))
            ->getFont()->setSize(14);
        
        // Slide 4: Team
        $slide = $presentation->createSlide();
        $slide->setName('Team');
        
        $titleShape = $slide->createRichTextShape();
        $titleShape->setHeight(50)->setWidth(900)->setOffsetX(50)->setOffsetY(50);
        $titleShape->getActiveParagraph()->getAlignment()->setHorizontal($isRTL ? 'r' : 'l');
        $titleShape->createTextRun('Team Members & Advisors')
            ->getFont()->setBold(true)->setSize(28)->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF1e3a8a'));
        
        $teamContent = $slide->createRichTextShape();
        $teamContent->setHeight(400)->setWidth(900)->setOffsetX(50)->setOffsetY(120);
        $teamContent->getActiveParagraph()->getAlignment()->setHorizontal($isRTL ? 'r' : 'l');
        
        $teamContent->createTextRun('Team Members:')->getFont()->setBold(true)->setSize(18);
        
        // Process regular members (from database relationship)
        foreach ($project->members as $member) {
            $role = $member->pivot->role_in_project ?? 'MEMBER';
            $teamContent->createParagraph()->createTextRun("• {$member->full_name} ({$role})")
                ->getFont()->setSize(14);
        }
        
        // Process custom members (from JSON field)
        if ($project->custom_members) {
            foreach ($project->custom_members as $customMember) {
                $role = $customMember['role'] ?? 'MEMBER';
                $teamContent->createParagraph()->createTextRun("• {$customMember['name']} ({$role})")
                    ->getFont()->setSize(14);
            }
        }
        
        $hasRegularAdvisors = $project->advisors->isNotEmpty();
        $hasCustomAdvisors = !empty($project->custom_advisors);
        
        if ($hasRegularAdvisors || $hasCustomAdvisors) {
            $teamContent->createParagraph()->createTextRun("\nAdvisors:")
                ->getFont()->setBold(true)->setSize(18);
            
            // Process regular advisors (from database relationship)
            foreach ($project->advisors as $advisor) {
                $role = $advisor->pivot->advisor_role ?? 'ADVISOR';
                $teamContent->createParagraph()->createTextRun("• {$advisor->full_name} ({$role})")
                    ->getFont()->setSize(14);
            }
            
            // Process custom advisors (from JSON field)
            if ($project->custom_advisors) {
                foreach ($project->custom_advisors as $customAdvisor) {
                    $role = $customAdvisor['role'] ?? 'ADVISOR';
                    $teamContent->createParagraph()->createTextRun("• {$customAdvisor['name']} ({$role})")
                        ->getFont()->setSize(14);
                }
            }
        }
    }

    /**
     * Check if user can export project
     */
    private function canExportProject($user, Project $project): bool
    {
        if (!$user) {
            return false;
        }
        
        // Admin can export any project
        if ($user->roles->contains('name', 'admin')) {
            return true;
        }
        
        // Project creator can export
        if ($project->created_by_user_id === $user->id) {
            return true;
        }
        
        // Project members can export
        if ($project->members->contains('id', $user->id)) {
            return true;
        }
        
        // Project advisors can export
        if ($project->advisors->contains('id', $user->id)) {
            return true;
        }
        
        // Faculty can export projects in their programs (simplified check)
        if ($user->roles->contains('name', 'faculty')) {
            return true;
        }
        
        // Reviewers can export projects they're assigned to
        if ($user->roles->contains('name', 'reviewer')) {
            return true;
        }
        
        return false;
    }

    /**
     * Detect if content should be RTL
     */
    private function detectRTL(Project $project, string $rtlOption): bool
    {
        if ($rtlOption === 'force') {
            return true;
        }
        
        if ($rtlOption === 'ltr') {
            return false;
        }
        
        // Auto-detect: Check if title or abstract contains Arabic characters
        $text = $project->title . ' ' . $project->abstract;
        
        // Simple Arabic character detection
        return preg_match('/[\x{0600}-\x{06FF}]/u', $text) > 0;
    }

    /**
     * Sanitize filename for download
     */
    private function sanitizeFilename(string $filename): string
    {
        // Remove special characters but keep Arabic/Unicode
        $filename = preg_replace('/[\/\\\:*?"<>|]/', '_', $filename);
        // Limit length
        if (mb_strlen($filename) > 100) {
            $filename = mb_substr($filename, 0, 100);
        }
        return $filename ?: 'project_documentation';
    }
}

