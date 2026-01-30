<?php

namespace App\Http\Controllers;

use App\Models\MilestoneTemplate;
use App\Models\MilestoneTemplateItem;
use App\Domains\Projects\Models\Project;
use App\Domains\Projects\Models\ProjectMilestone;
use App\Services\MilestoneTemplateService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MilestoneTemplateController extends Controller
{
    protected $templateService;

    public function __construct(MilestoneTemplateService $templateService)
    {
        $this->templateService = $templateService;
    }
    /**
     * Display a listing of milestone templates
     */
    public function index(Request $request): JsonResponse
    {
        $query = MilestoneTemplate::with(['items' => function ($q) {
            $q->orderBy('order');
        }, 'program', 'department', 'creator']);

        // Filter by program
        if ($request->has('program_id')) {
            // Include templates for this specific program OR templates available for all programs (program_id is null)
            $query->where(function ($q) use ($request) {
                $q->where('program_id', $request->program_id)
                  ->orWhereNull('program_id');
            });
        }

        // Filter by department
        if ($request->has('department_id')) {
            // Include templates for this specific department OR templates available for all departments (department_id is null)
            $query->where(function ($q) use ($request) {
                $q->where('department_id', $request->department_id)
                  ->orWhereNull('department_id');
            });
        }

        // Filter by default
        if ($request->has('is_default')) {
            $query->where('is_default', $request->boolean('is_default'));
        }

        $templates = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'templates' => $templates,
        ]);
    }

    /**
     * Store a newly created milestone template
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'program_id' => 'nullable|exists:programs,id',
            'department_id' => 'nullable|exists:departments,id',
            'is_default' => 'boolean',
            'items' => 'sometimes|array|min:1',
            'items.*.title' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.estimated_days' => 'required|integer|min:0',
            'items.*.is_required' => 'boolean',
            'items.*.order' => 'required|integer|min:0',
            'items.*.allowed_roles' => 'nullable|array',
            'items.*.allowed_roles.*' => 'in:admin,faculty,student',
            'items.*.allowed_actions' => 'nullable|array',
            'items.*.allowed_actions.*' => 'in:start,pause,extend,view,edit,complete',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate permissions for each item
        if ($request->has('items')) {
            foreach ($request->items as $index => $item) {
                $permissionErrors = $this->templateService->validatePermissions([
                    'allowed_roles' => $item['allowed_roles'] ?? null,
                    'allowed_actions' => $item['allowed_actions'] ?? null,
                ]);

                if (!empty($permissionErrors)) {
                    foreach ($permissionErrors as $field => $error) {
                        $validator->errors()->add("items.{$index}.{$field}", $error);
                    }
                }
            }

            if ($validator->errors()->any()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
        }

        try {
            $user = $request->user();

            // If setting as default, unset other defaults in same scope
            if ($request->boolean('is_default')) {
                $this->unsetOtherDefaults(
                    $request->program_id,
                    $request->department_id
                );
            }

            // Create template using service
            $template = $this->templateService->createTemplate([
                'name' => $request->name,
                'description' => $request->description,
                'program_id' => $request->program_id,
                'department_id' => $request->department_id,
                'is_default' => $request->boolean('is_default', false),
                'created_by_user_id' => $user->id,
                'items' => $request->items ?? [],
            ]);

            return response()->json([
                'message' => 'Milestone template created successfully',
                'template' => $template
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create milestone template: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create milestone template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified milestone template
     */
    public function show(MilestoneTemplate $milestoneTemplate): JsonResponse
    {
        return response()->json([
            'template' => $milestoneTemplate->load(['items' => function ($query) {
                $query->orderBy('order');
            }, 'program', 'department', 'creator'])
        ]);
    }

    /**
     * Update the specified milestone template
     */
    public function update(Request $request, MilestoneTemplate $milestoneTemplate): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'program_id' => 'nullable|exists:programs,id',
            'department_id' => 'nullable|exists:departments,id',
            'is_default' => 'boolean',
            'items' => 'sometimes|required|array|min:1',
            'items.*.id' => 'nullable|exists:milestone_template_items,id',
            'items.*.title' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.estimated_days' => 'required|integer|min:0',
            'items.*.is_required' => 'boolean',
            'items.*.order' => 'required|integer|min:0',
            'items.*.allowed_roles' => 'nullable|array',
            'items.*.allowed_roles.*' => 'in:admin,faculty,student',
            'items.*.allowed_actions' => 'nullable|array',
            'items.*.allowed_actions.*' => 'in:start,pause,extend,view,edit,complete',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate permissions for each item
        if ($request->has('items')) {
            foreach ($request->items as $index => $item) {
                $permissionErrors = $this->templateService->validatePermissions([
                    'allowed_roles' => $item['allowed_roles'] ?? null,
                    'allowed_actions' => $item['allowed_actions'] ?? null,
                ]);

                if (!empty($permissionErrors)) {
                    foreach ($permissionErrors as $field => $error) {
                        $validator->errors()->add("items.{$index}.{$field}", $error);
                    }
                }
            }

            if ($validator->errors()->any()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
        }

        try {
            // If setting as default, unset other defaults
            if ($request->has('is_default') && $request->boolean('is_default')) {
                $this->unsetOtherDefaults(
                    $request->program_id ?? $milestoneTemplate->program_id,
                    $request->department_id ?? $milestoneTemplate->department_id,
                    $milestoneTemplate->id
                );
            }

            // Update template using service
            $template = $this->templateService->updateTemplate($milestoneTemplate->id, $request->all());

            return response()->json([
                'message' => 'Milestone template updated successfully',
                'template' => $template
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to update milestone template {$milestoneTemplate->id}: " . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update milestone template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified milestone template
     */
    public function destroy(MilestoneTemplate $milestoneTemplate): JsonResponse
    {
        // Check if template is being used by any projects
        $projectsUsingTemplate = $milestoneTemplate->projects()->count();
        
        if ($projectsUsingTemplate > 0) {
            return response()->json([
                'message' => 'Cannot delete template. It is being used by ' . $projectsUsingTemplate . ' project(s).',
            ], 422);
        }

        $milestoneTemplate->delete();

        return response()->json([
            'message' => 'Milestone template deleted successfully'
        ], 200);
    }

    /**
     * Get template items
     */
    public function getItems(MilestoneTemplate $milestoneTemplate): JsonResponse
    {
        $items = $milestoneTemplate->items()->orderBy('order')->get();

        return response()->json([
            'items' => $items
        ]);
    }

    /**
     * Add item to template
     */
    public function addItem(Request $request, MilestoneTemplate $milestoneTemplate): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'estimated_days' => 'required|integer|min:0',
            'is_required' => 'boolean',
            'order' => 'integer|min:0',
            'allowed_roles' => 'nullable|array',
            'allowed_roles.*' => 'in:admin,faculty,student',
            'allowed_actions' => 'nullable|array',
            'allowed_actions.*' => 'in:start,pause,extend,view,edit,complete',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate permissions
        $permissionErrors = $this->templateService->validatePermissions([
            'allowed_roles' => $request->allowed_roles ?? null,
            'allowed_actions' => $request->allowed_actions ?? null,
        ]);

        if (!empty($permissionErrors)) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $permissionErrors
            ], 422);
        }

        $maxOrder = $milestoneTemplate->items()->max('order') ?? -1;
        $order = $request->order ?? ($maxOrder + 1);

        $item = MilestoneTemplateItem::create([
            'template_id' => $milestoneTemplate->id,
            'title' => $request->title,
            'description' => $request->description,
            'estimated_days' => $request->estimated_days,
            'is_required' => $request->boolean('is_required', true),
            'order' => $order,
            'allowed_roles' => $request->allowed_roles ?? [],
            'allowed_actions' => $request->allowed_actions ?? [],
        ]);

        return response()->json([
            'message' => 'Template item added successfully',
            'item' => $item
        ], 201);
    }

    /**
     * Update template item
     */
    public function updateItem(Request $request, MilestoneTemplateItem $milestoneTemplateItem): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'estimated_days' => 'sometimes|required|integer|min:0',
            'is_required' => 'boolean',
            'order' => 'integer|min:0',
            'allowed_roles' => 'nullable|array',
            'allowed_roles.*' => 'in:admin,faculty,student',
            'allowed_actions' => 'nullable|array',
            'allowed_actions.*' => 'in:start,pause,extend,view,edit,complete',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate permissions if provided
        if ($request->has('allowed_roles') || $request->has('allowed_actions')) {
            $permissionErrors = $this->templateService->validatePermissions([
                'allowed_roles' => $request->allowed_roles ?? null,
                'allowed_actions' => $request->allowed_actions ?? null,
            ]);

            if (!empty($permissionErrors)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $permissionErrors
                ], 422);
            }
        }

        $milestoneTemplateItem->update($request->only([
            'title', 'description', 'estimated_days', 'is_required', 'order',
            'allowed_roles', 'allowed_actions'
        ]));

        return response()->json([
            'message' => 'Template item updated successfully',
            'item' => $milestoneTemplateItem
        ]);
    }

    /**
     * Delete template item
     */
    public function deleteItem(MilestoneTemplateItem $milestoneTemplateItem): JsonResponse
    {
        $milestoneTemplateItem->delete();

        return response()->json([
            'message' => 'Template item deleted successfully'
        ], 200);
    }

    /**
     * Reorder template items
     */
    public function reorderItems(Request $request, MilestoneTemplate $milestoneTemplate): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'item_orders' => 'required|array|min:1',
            'item_orders.*.item_id' => 'required|exists:milestone_template_items,id',
            'item_orders.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate all items belong to the template
        $itemIds = collect($request->item_orders)->pluck('item_id')->toArray();
        $itemsInTemplate = $milestoneTemplate->items()->whereIn('id', $itemIds)->count();
        
        if ($itemsInTemplate !== count($itemIds)) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => ['item_orders' => 'Some items do not belong to this template']
            ], 422);
        }

        DB::transaction(function () use ($request, $milestoneTemplate) {
            foreach ($request->item_orders as $itemOrder) {
                MilestoneTemplateItem::where('id', $itemOrder['item_id'])
                    ->where('template_id', $milestoneTemplate->id)
                    ->update(['order' => $itemOrder['order']]);
            }
        });

        return response()->json([
            'message' => 'Items reordered successfully'
        ]);
    }

    /**
     * Apply template to project
     */
    public function applyToProject(Request $request, MilestoneTemplate $milestoneTemplate): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'start_date' => 'required|date',
            'preserve_custom_milestones' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $project = Project::findOrFail($request->project_id);
        $startDate = Carbon::parse($request->start_date);

        try {
            DB::beginTransaction();

            // Delete existing incomplete milestones if not preserving custom ones
            if (!$request->boolean('preserve_custom_milestones', false)) {
                $project->milestones()->where('status', '!=', ProjectStatus::COMPLETED)->delete();
            }

            // Get template items ordered
            $templateItems = $milestoneTemplate->items()->orderBy('order')->get();

            // Create milestones from template
            $createdMilestones = [];
            $currentDate = $startDate->copy();

            foreach ($templateItems as $index => $templateItem) {
                // Calculate due date: add estimated_days to current date
                $dueDate = $currentDate->copy()->addDays($templateItem->estimated_days);

                // Determine dependencies: previous milestone if exists
                $dependencies = [];
                if ($index > 0 && isset($createdMilestones[$index - 1])) {
                    $dependencies[] = $createdMilestones[$index - 1]->id;
                }

                $milestone = ProjectMilestone::create([
                    'project_id' => $project->id,
                    'template_item_id' => $templateItem->id,
                    'title' => $templateItem->title,
                    'description' => $templateItem->description,
                    'status' => 'not_started',
                    'due_date' => $dueDate,
                    'order' => $index,
                    'dependencies' => !empty($dependencies) ? $dependencies : null,
                ]);

                $createdMilestones[$index] = $milestone;
                $currentDate = $dueDate->copy();
            }

            // Update project to reference this template
            $project->update([
                'milestone_template_id' => $milestoneTemplate->id
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Template applied to project successfully',
                'milestones' => $project->milestones()->with('templateItem')->orderBy('order')->get()
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to apply template {$milestoneTemplate->id} to project {$project->id}: " . $e->getMessage());
            return response()->json([
                'message' => 'Failed to apply template to project',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper: Unset other default templates in same scope
     */
    private function unsetOtherDefaults($programId, $departmentId, $exceptId = null): JsonResponse
    {
        $query = MilestoneTemplate::where('is_default', true);

        if ($programId) {
            $query->where('program_id', $programId);
        } else {
            $query->whereNull('program_id');
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        } else {
            $query->whereNull('department_id');
        }

        if ($exceptId) {
            $query->where('id', '!=', $exceptId);
        }

        $query->update(['is_default' => false]);
    }

}

