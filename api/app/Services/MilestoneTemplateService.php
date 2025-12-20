<?php

namespace App\Services;

use App\Models\MilestoneTemplate;
use App\Models\MilestoneTemplateItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MilestoneTemplateService
{
    /**
     * Create a milestone template with items
     *
     * @param array $data Template data including items
     * @return MilestoneTemplate
     */
    public function createTemplate(array $data): MilestoneTemplate
    {
        DB::beginTransaction();
        try {
            // Create template
            $template = MilestoneTemplate::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'program_id' => $data['program_id'] ?? null,
                'department_id' => $data['department_id'] ?? null,
                'is_default' => $data['is_default'] ?? false,
                'created_by_user_id' => $data['created_by_user_id'],
            ]);

            // Create items or apply default steps
            if (isset($data['items']) && !empty($data['items'])) {
                $this->createItems($template, $data['items']);
            } else {
                $this->applyDefaultSteps($template->id);
            }

            DB::commit();
            return $template->load('items');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create milestone template: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update a milestone template with items
     *
     * @param int $templateId
     * @param array $data Template data including items
     * @return MilestoneTemplate
     */
    public function updateTemplate(int $templateId, array $data): MilestoneTemplate
    {
        $template = MilestoneTemplate::findOrFail($templateId);

        DB::beginTransaction();
        try {
            // Update template fields
            $template->update(array_filter([
                'name' => $data['name'] ?? null,
                'description' => $data['description'] ?? null,
                'program_id' => $data['program_id'] ?? null,
                'department_id' => $data['department_id'] ?? null,
                'is_default' => $data['is_default'] ?? null,
            ], fn($value) => $value !== null));

            // Update items if provided
            if (isset($data['items'])) {
                $this->syncTemplateItems($template, $data['items']);
            }

            DB::commit();
            return $template->load('items');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to update milestone template {$templateId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Validate permissions array
     *
     * @param array $permissions Array with 'allowed_roles' and/or 'allowed_actions'
     * @return array Validation errors (empty if valid)
     */
    public function validatePermissions(array $permissions): array
    {
        $errors = [];

        if (isset($permissions['allowed_roles'])) {
            if (!is_array($permissions['allowed_roles'])) {
                $errors['allowed_roles'] = 'Allowed roles must be an array';
            } elseif (!MilestoneTemplateItem::validateRoles($permissions['allowed_roles'])) {
                $errors['allowed_roles'] = 'Invalid role(s) provided. Valid roles: ' . implode(', ', MilestoneTemplateItem::getValidRoles());
            }
        }

        if (isset($permissions['allowed_actions'])) {
            if (!is_array($permissions['allowed_actions'])) {
                $errors['allowed_actions'] = 'Allowed actions must be an array';
            } elseif (!MilestoneTemplateItem::validateActions($permissions['allowed_actions'])) {
                $errors['allowed_actions'] = 'Invalid action(s) provided. Valid actions: ' . implode(', ', MilestoneTemplateItem::getValidActions());
            }
        }

        return $errors;
    }

    /**
     * Apply default steps to a template
     *
     * @param int $templateId
     * @return void
     */
    public function applyDefaultSteps(int $templateId): void
    {
        $defaultSteps = config('milestone_templates.default_steps', []);

        foreach ($defaultSteps as $index => $step) {
            MilestoneTemplateItem::create([
                'template_id' => $templateId,
                'title' => $step['title'],
                'description' => $step['description'] ?? null,
                'order' => $index,
                'estimated_days' => $step['estimated_days'] ?? 0,
                'is_required' => $step['is_required'] ?? true,
                'allowed_roles' => $step['allowed_roles'] ?? [],
                'allowed_actions' => $step['allowed_actions'] ?? [],
            ]);
        }
    }

    /**
     * Create items for a template
     *
     * @param MilestoneTemplate $template
     * @param array $items
     * @return void
     */
    private function createItems(MilestoneTemplate $template, array $items): void
    {
        foreach ($items as $index => $item) {
            MilestoneTemplateItem::create([
                'template_id' => $template->id,
                'title' => $item['title'],
                'description' => $item['description'] ?? null,
                'order' => $item['order'] ?? $index,
                'estimated_days' => $item['estimated_days'] ?? 0,
                'is_required' => $item['is_required'] ?? true,
                'allowed_roles' => $item['allowed_roles'] ?? [],
                'allowed_actions' => $item['allowed_actions'] ?? [],
            ]);
        }
    }

    /**
     * Sync template items (create, update, delete)
     *
     * @param MilestoneTemplate $template
     * @param array $items
     * @return void
     */
    private function syncTemplateItems(MilestoneTemplate $template, array $items): void
    {
        $itemIdsToKeep = [];

        foreach ($items as $index => $itemData) {
            if (isset($itemData['id'])) {
                // Update existing item
                $item = MilestoneTemplateItem::where('id', $itemData['id'])
                    ->where('template_id', $template->id)
                    ->first();

                if ($item) {
                    $item->update([
                        'title' => $itemData['title'],
                        'description' => $itemData['description'] ?? null,
                        'estimated_days' => $itemData['estimated_days'] ?? 0,
                        'is_required' => $itemData['is_required'] ?? true,
                        'order' => $itemData['order'] ?? $index,
                        'allowed_roles' => $itemData['allowed_roles'] ?? [],
                        'allowed_actions' => $itemData['allowed_actions'] ?? [],
                    ]);
                    $itemIdsToKeep[] = $item->id;
                }
            } else {
                // Create new item
                $item = MilestoneTemplateItem::create([
                    'template_id' => $template->id,
                    'title' => $itemData['title'],
                    'description' => $itemData['description'] ?? null,
                    'estimated_days' => $itemData['estimated_days'] ?? 0,
                    'is_required' => $itemData['is_required'] ?? true,
                    'order' => $itemData['order'] ?? $index,
                    'allowed_roles' => $itemData['allowed_roles'] ?? [],
                    'allowed_actions' => $itemData['allowed_actions'] ?? [],
                ]);
                $itemIdsToKeep[] = $item->id;
            }
        }

        // Delete items that were removed
        MilestoneTemplateItem::where('template_id', $template->id)
            ->whereNotIn('id', $itemIdsToKeep)
            ->delete();
    }
}

