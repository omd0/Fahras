<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectAiMetadata;
use App\Models\Tag;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiAnalysisService
{
    private const AI_MODEL_VERSION = 'gemini-2.5-pro-001';
    private const MAX_RETRIES = 3;
    private const ANALYSIS_TIMEOUT = 60; // seconds

    /**
     * Analyze a project and generate AI metadata.
     */
    public function analyzeProject(Project $project, bool $force = false): ?ProjectAiMetadata
    {
        // Check if analysis is enabled
        if (!$project->ai_analysis_enabled && !$force) {
            return null;
        }

        // Check if analysis already exists and is recent
        $metadata = $project->aiMetadata;
        if ($metadata && !$metadata->needsRefresh() && !$force) {
            return $metadata;
        }

        try {
            // Update status to processing
            $project->update(['ai_analysis_status' => 'processing']);

            // Prepare content for analysis
            $content = $this->prepareContentForAnalysis($project);

            // Call AI service to analyze
            $analysis = $this->performAiAnalysis($content);

            // Extract tags from analysis
            $tags = $this->extractTags($analysis);

            // Create or update metadata
            $metadata = $this->saveAiMetadata($project, $analysis);

            // Attach AI-generated tags
            if (!empty($tags)) {
                $this->attachAiTags($project, $tags, $analysis['tag_confidence'] ?? []);
            }

            // Update status to completed
            $project->update(['ai_analysis_status' => 'completed']);

            return $metadata;

        } catch (\Exception $e) {
            Log::error('AI Analysis failed for project ' . $project->id, [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Mark as failed
            $project->update(['ai_analysis_status' => 'failed']);

            if ($metadata) {
                $metadata->markAsFailed($e->getMessage());
            } else {
                ProjectAiMetadata::create([
                    'project_id' => $project->id,
                    'analysis_error' => $e->getMessage(),
                    'analysis_attempts' => 1,
                ]);
            }

            return null;
        }
    }

    /**
     * Prepare project content for AI analysis.
     */
    private function prepareContentForAnalysis(Project $project): string
    {
        $content = "Title: {$project->title}\n\n";
        $content .= "Abstract: {$project->abstract}\n\n";

        if ($project->keywords && is_array($project->keywords)) {
            $content .= "Keywords: " . implode(', ', $project->keywords) . "\n\n";
        }

        $content .= "Academic Year: {$project->academic_year}\n";
        $content .= "Semester: {$project->semester}\n";

        if ($project->program) {
            $content .= "Program: {$project->program->name}\n";
        }

        return $content;
    }

    /**
     * Perform AI analysis using external AI service (Gemini, OpenAI, Claude, etc.).
     */
    private function performAiAnalysis(string $content): array
    {
        $prompt = $this->buildAnalysisPrompt($content);

        // Method 1: Try using environment-configured AI service
        $aiProvider = config('services.ai.provider', 'gemini');
        $apiKey = config('services.ai.api_key');

        if ($aiProvider === 'gemini' && $apiKey) {
            return $this->analyzeWithGemini($prompt, $content, $apiKey);
        } elseif ($aiProvider === 'openai' && $apiKey) {
            return $this->analyzeWithOpenAI($prompt, $content, $apiKey);
        } elseif ($aiProvider === 'claude' && $apiKey) {
            return $this->analyzeWithClaude($prompt, $content, $apiKey);
        }

        // Method 2: Fallback to keyword-based extraction (no external API)
        return $this->fallbackKeywordExtraction($content);
    }

    /**
     * Build the analysis prompt for AI.
     */
    private function buildAnalysisPrompt(string $content): string
    {
        return <<<PROMPT
You are an academic research analyzer. Analyze the following graduation project and provide:

1. **Summary**: A concise 2-3 sentence summary of the project
2. **Tags**: 5-10 relevant tags/keywords (technical terms, research areas, methodologies)
3. **Research Area**: Primary research area (e.g., Machine Learning, Web Development, Cybersecurity, etc.)
4. **Research Subcategories**: 2-5 specific subcategories
5. **Key Concepts**: 5-10 key technical concepts mentioned
6. **Complexity Level**: One of: beginner, intermediate, advanced, expert
7. **Language**: Detected primary language (en, ar, etc.)

Respond in JSON format:
{
  "summary": "...",
  "tags": ["tag1", "tag2", ...],
  "tag_confidence": {"tag1": 0.95, "tag2": 0.88, ...},
  "research_area": "...",
  "research_subcategories": ["sub1", "sub2", ...],
  "key_concepts": ["concept1", "concept2", ...],
  "complexity_level": "intermediate",
  "language": "en"
}

Project Content:
{$content}
PROMPT;
    }

    /**
     * Analyze using Google Gemini API.
     */
    private function analyzeWithGemini(string $prompt, string $content, string $apiKey): array
    {
        $response = Http::timeout(self::ANALYSIS_TIMEOUT)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                    'maxOutputTokens' => 2048,
                ],
            ]);

        if (!$response->successful()) {
            throw new \Exception('Gemini API request failed: ' . $response->body());
        }

        $result = $response->json();
        $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

        // Extract JSON from response
        return $this->parseAiResponse($text);
    }

    /**
     * Analyze using OpenAI API.
     */
    private function analyzeWithOpenAI(string $prompt, string $content, string $apiKey): array
    {
        $response = Http::timeout(self::ANALYSIS_TIMEOUT)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4-turbo-preview',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an academic research analyzer. Respond only with valid JSON.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.2,
                'response_format' => ['type' => 'json_object'],
            ]);

        if (!$response->successful()) {
            throw new \Exception('OpenAI API request failed: ' . $response->body());
        }

        $result = $response->json();
        $text = $result['choices'][0]['message']['content'] ?? '';

        return $this->parseAiResponse($text);
    }

    /**
     * Analyze using Anthropic Claude API.
     */
    private function analyzeWithClaude(string $prompt, string $content, string $apiKey): array
    {
        $response = Http::timeout(self::ANALYSIS_TIMEOUT)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'Content-Type' => 'application/json',
            ])
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-sonnet-20240229',
                'max_tokens' => 2048,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
            ]);

        if (!$response->successful()) {
            throw new \Exception('Claude API request failed: ' . $response->body());
        }

        $result = $response->json();
        $text = $result['content'][0]['text'] ?? '';

        return $this->parseAiResponse($text);
    }

    /**
     * Parse AI response to extract JSON.
     */
    private function parseAiResponse(string $text): array
    {
        // Try to extract JSON from markdown code blocks
        if (preg_match('/```json\s*(.*?)\s*```/s', $text, $matches)) {
            $text = $matches[1];
        } elseif (preg_match('/```\s*(.*?)\s*```/s', $text, $matches)) {
            $text = $matches[1];
        }

        // Try to decode JSON
        $decoded = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Failed to parse AI response as JSON: ' . json_last_error_msg());
        }

        return $decoded;
    }

    /**
     * Fallback keyword extraction (no external API).
     */
    private function fallbackKeywordExtraction(string $content): array
    {
        // Simple keyword extraction using existing keywords and title
        $words = str_word_count(strtolower($content), 1);
        $commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        $filteredWords = array_filter($words, fn($word) => !in_array($word, $commonWords) && strlen($word) > 3);

        $wordCounts = array_count_values($filteredWords);
        arsort($wordCounts);

        $tags = array_slice(array_keys($wordCounts), 0, 10);

        return [
            'summary' => substr($content, 0, 200) . '...',
            'tags' => $tags,
            'tag_confidence' => array_fill_keys($tags, 0.5),
            'research_area' => 'General Research',
            'research_subcategories' => [],
            'key_concepts' => array_slice($tags, 0, 5),
            'complexity_level' => 'intermediate',
            'language' => 'en',
        ];
    }

    /**
     * Extract tags from AI analysis.
     */
    private function extractTags(array $analysis): array
    {
        return $analysis['tags'] ?? [];
    }

    /**
     * Save AI metadata to database.
     */
    private function saveAiMetadata(Project $project, array $analysis): ProjectAiMetadata
    {
        $metadata = $project->aiMetadata ?? new ProjectAiMetadata(['project_id' => $project->id]);

        $metadata->fill([
            'ai_summary' => $analysis['summary'] ?? null,
            'key_concepts' => $analysis['key_concepts'] ?? [],
            'research_area' => $analysis['research_area'] ?? null,
            'research_subcategories' => $analysis['research_subcategories'] ?? [],
            'detected_language' => $analysis['language'] ?? 'en',
            'complexity_level' => $analysis['complexity_level'] ?? 'intermediate',
        ]);

        $metadata->markAsCompleted(self::AI_MODEL_VERSION);
        $metadata->save();

        return $metadata;
    }

    /**
     * Attach AI-generated tags to project.
     */
    private function attachAiTags(Project $project, array $tags, array $confidenceScores): void
    {
        foreach ($tags as $tagName) {
            $confidence = $confidenceScores[$tagName] ?? 0.7;

            // Only attach tags with confidence > 0.5
            if ($confidence >= 0.5) {
                $tag = Tag::findOrCreateByName($tagName, 'ai_generated');

                if (!$project->tags()->where('tag_id', $tag->id)->exists()) {
                    $project->tags()->attach($tag->id, [
                        'source' => 'ai_auto',
                        'confidence_score' => $confidence,
                    ]);
                    $tag->incrementUsage();
                }
            }
        }
    }

    /**
     * Process natural language query to extract filters.
     */
    public function parseNaturalLanguageQuery(string $query): array
    {
        $filters = [];
        $normalizedQuery = $query;

        // Extract year patterns
        if (preg_match('/\b(20\d{2})\b/', $query, $matches)) {
            $filters['academic_year'] = $matches[1] . '-' . ($matches[1] + 1);
            $normalizedQuery = str_replace($matches[0], '', $normalizedQuery);
        }

        // Extract semester
        if (preg_match('/\b(fall|spring|summer)\b/i', $query, $matches)) {
            $filters['semester'] = strtolower($matches[1]);
            $normalizedQuery = str_replace($matches[0], '', $normalizedQuery);
        }

        // Extract status keywords
        $statusKeywords = [
            'draft' => 'draft',
            'submitted' => 'submitted',
            'review' => 'under_review',
            'approved' => 'approved',
            'rejected' => 'rejected',
            'completed' => 'completed',
        ];

        foreach ($statusKeywords as $keyword => $status) {
            if (stripos($query, $keyword) !== false) {
                $filters['status'] = $status;
                $normalizedQuery = str_ireplace($keyword, '', $normalizedQuery);
                break;
            }
        }

        // Clean up normalized query
        $normalizedQuery = trim(preg_replace('/\s+/', ' ', $normalizedQuery));

        return [
            'normalized_query' => $normalizedQuery,
            'filters' => $filters,
        ];
    }
}
