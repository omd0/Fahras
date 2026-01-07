<?php

namespace App\Http\Requests\Project;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if user can update this project
        $project = $this->route('project');
        return $project && $project->created_by_user_id === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'program_id' => 'sometimes|required|exists:programs,id',
            'title' => 'sometimes|required|string|max:255',
            'abstract' => 'sometimes|required|string',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:50',
            'academic_year' => 'sometimes|required|string',
            'semester' => 'sometimes|required|in:fall,spring,summer',
            'status' => 'sometimes|required|in:draft,submitted,under_review,approved,rejected,completed',
            'is_public' => 'sometimes|boolean',
            'doi' => 'nullable|string',
            'repo_url' => 'nullable|url',
            'members' => 'sometimes|array',
            'members.*.user_id' => 'nullable|integer',
            'members.*.customName' => 'nullable|string|max:255',
            'members.*.role' => 'required_with:members|in:LEAD,MEMBER',
            'advisors' => 'sometimes|array',
            'advisors.*.user_id' => 'nullable|integer',
            'advisors.*.customName' => 'nullable|string|max:255',
            'advisors.*.role' => 'required_with:advisors|in:MAIN,CO_ADVISOR,REVIEWER',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validateMembers($validator);
            $this->validateAdvisors($validator);
        });
    }

    /**
     * Validate that each member has either a valid user_id or a customName.
     */
    protected function validateMembers($validator): void
    {
        if (!$this->has('members')) {
            return;
        }

        foreach ($this->members as $index => $member) {
            if (empty($member['customName']) && (empty($member['user_id']) || $member['user_id'] <= 0)) {
                $validator->errors()->add(
                    "members.{$index}",
                    'Each member must have either a valid user_id or a custom name'
                );
            }
            
            // If user_id is provided and greater than 0, validate it exists
            if (!empty($member['user_id']) && $member['user_id'] > 0) {
                if (!User::find($member['user_id'])) {
                    $validator->errors()->add(
                        "members.{$index}.user_id",
                        'The selected user does not exist'
                    );
                }
            }
        }
    }

    /**
     * Validate that each advisor has either a valid user_id or a customName.
     */
    protected function validateAdvisors($validator): void
    {
        if (!$this->has('advisors')) {
            return;
        }

        foreach ($this->advisors as $index => $advisor) {
            if (empty($advisor['customName']) && (empty($advisor['user_id']) || $advisor['user_id'] <= 0)) {
                $validator->errors()->add(
                    "advisors.{$index}",
                    'Each advisor must have either a valid user_id or a custom name'
                );
            }
            
            // If user_id is provided and greater than 0, validate it exists
            if (!empty($advisor['user_id']) && $advisor['user_id'] > 0) {
                if (!User::find($advisor['user_id'])) {
                    $validator->errors()->add(
                        "advisors.{$index}.user_id",
                        'The selected user does not exist'
                    );
                }
            }
        }
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
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Unauthorized to update this project'
            ], 403)
        );
    }

    /**
     * Get custom members array for syncing.
     */
    public function getCustomMembersForSync(): ?array
    {
        if (!$this->has('members')) {
            return null;
        }

        $customMembers = [];
        
        foreach ($this->members as $member) {
            if (!empty($member['customName'])) {
                $customMembers[] = [
                    'name' => $member['customName'],
                    'role' => $member['role']
                ];
            }
        }
        
        return !empty($customMembers) ? $customMembers : null;
    }

    /**
     * Get regular members array for syncing (indexed by user_id).
     */
    public function getRegularMembersForSync(): array
    {
        if (!$this->has('members')) {
            return [];
        }

        $regularMembers = [];
        
        foreach ($this->members as $member) {
            if (empty($member['customName']) && !empty($member['user_id']) && $member['user_id'] > 0) {
                $regularMembers[$member['user_id']] = [
                    'role_in_project' => $member['role']
                ];
            }
        }
        
        return $regularMembers;
    }

    /**
     * Get custom advisors array for syncing.
     */
    public function getCustomAdvisorsForSync(): ?array
    {
        if (!$this->has('advisors')) {
            return null;
        }

        $customAdvisors = [];
        
        foreach ($this->advisors as $advisor) {
            if (!empty($advisor['customName'])) {
                $customAdvisors[] = [
                    'name' => $advisor['customName'],
                    'role' => $advisor['role']
                ];
            }
        }
        
        return !empty($customAdvisors) ? $customAdvisors : null;
    }

    /**
     * Get regular advisors array for syncing (indexed by user_id).
     */
    public function getRegularAdvisorsForSync(): array
    {
        if (!$this->has('advisors')) {
            return [];
        }

        $regularAdvisors = [];
        
        foreach ($this->advisors as $advisor) {
            if (empty($advisor['customName']) && !empty($advisor['user_id']) && $advisor['user_id'] > 0) {
                $regularAdvisors[$advisor['user_id']] = [
                    'advisor_role' => $advisor['role']
                ];
            }
        }
        
        return $regularAdvisors;
    }
}
