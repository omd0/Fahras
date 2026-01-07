<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class SearchProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Search is available to all users (visibility handled by controller logic)
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Search and filtering
            'q' => 'nullable|string|max:255',
            'search' => 'nullable|string|max:255',
            
            // Filtering
            'status' => 'nullable|in:draft,submitted,under_review,approved,rejected,completed',
            'program_id' => 'nullable|exists:programs,id',
            'department_id' => 'nullable|exists:departments,id',
            'academic_year' => 'nullable|string',
            'semester' => 'nullable|in:fall,spring,summer',
            'is_public' => 'nullable|boolean',
            'admin_approval_status' => 'nullable|in:pending,approved,hidden',
            'created_by' => 'nullable|exists:users,id',
            'my_projects' => 'nullable|boolean',
            'member_id' => 'nullable|exists:users,id',
            'advisor_id' => 'nullable|exists:users,id',
            'approval_status' => 'nullable|in:pending,approved,hidden',
            
            // Date range filtering
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date|after_or_equal:created_from',
            
            // Sorting
            'sort_by' => 'nullable|in:created_at,updated_at,title,academic_year,status,admin_approval_status,approved_at',
            'sort_order' => 'nullable|in:asc,desc',
            
            // Pagination
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'created_to.after_or_equal' => 'The end date must be after or equal to the start date.',
            'per_page.max' => 'You cannot request more than 100 items per page.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422)
        );
    }

    /**
     * Get the validated sort field.
     */
    public function getSortBy(): string
    {
        return $this->get('sort_by', 'created_at');
    }

    /**
     * Get the validated sort order.
     */
    public function getSortOrder(): string
    {
        return $this->get('sort_order', 'desc');
    }

    /**
     * Get the validated per page value.
     */
    public function getPerPage(): int
    {
        return min($this->get('per_page', 15), 100);
    }

    /**
     * Check if this is a "my projects" request.
     */
    public function isMyProjectsRequest(): bool
    {
        return $this->has('my_projects') && $this->boolean('my_projects');
    }

    /**
     * Get the search term (supports both 'q' and 'search' parameters).
     */
    public function getSearchTerm(): ?string
    {
        return $this->get('q') ?? $this->get('search');
    }

    /**
     * Check if the request has a search term.
     */
    public function hasSearchTerm(): bool
    {
        $searchTerm = $this->getSearchTerm();
        return !empty($searchTerm);
    }

    /**
     * Get allowed sort fields.
     */
    public static function getAllowedSortFields(): array
    {
        return ['created_at', 'updated_at', 'title', 'academic_year', 'status', 'admin_approval_status', 'approved_at'];
    }
}
