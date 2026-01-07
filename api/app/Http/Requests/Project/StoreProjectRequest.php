<?php

namespace App\Http\Requests\Project;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'program_id' => 'required|exists:programs,id',
            'title' => 'required|string|max:255',
            'abstract' => 'required|string',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:50',
            'academic_year' => 'required|string',
            'semester' => 'required|in:fall,spring,summer',
            'members' => 'required|array|min:1',
            'members.*.user_id' => 'nullable|integer',
            'members.*.customName' => 'nullable|string|max:255',
            'members.*.role' => 'required|in:LEAD,MEMBER',
            'advisors' => 'nullable|array',
            'advisors.*.user_id' => 'nullable|integer',
            'advisors.*.customName' => 'nullable|string|max:255',
            'advisors.*.role' => 'required|in:MAIN,CO_ADVISOR,REVIEWER',
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
     * Get custom members array.
     */
    public function getCustomMembers(): array
    {
        $customMembers = [];
        
        if ($this->has('members')) {
            foreach ($this->members as $member) {
                if (!empty($member['customName'])) {
                    $customMembers[] = [
                        'name' => $member['customName'],
                        'role' => $member['role']
                    ];
                }
            }
        }
        
        return $customMembers;
    }

    /**
     * Get regular members array (with user_id).
     */
    public function getRegularMembers(): array
    {
        $regularMembers = [];
        
        if ($this->has('members')) {
            foreach ($this->members as $member) {
                if (empty($member['customName']) && !empty($member['user_id']) && $member['user_id'] > 0) {
                    $regularMembers[] = $member;
                }
            }
        }
        
        return $regularMembers;
    }

    /**
     * Get custom advisors array.
     */
    public function getCustomAdvisors(): array
    {
        $customAdvisors = [];
        
        if ($this->has('advisors')) {
            foreach ($this->advisors as $advisor) {
                if (!empty($advisor['customName'])) {
                    $customAdvisors[] = [
                        'name' => $advisor['customName'],
                        'role' => $advisor['role']
                    ];
                }
            }
        }
        
        return $customAdvisors;
    }

    /**
     * Get regular advisors array (with user_id).
     */
    public function getRegularAdvisors(): array
    {
        $regularAdvisors = [];
        
        if ($this->has('advisors')) {
            foreach ($this->advisors as $advisor) {
                if (empty($advisor['customName']) && !empty($advisor['user_id']) && $advisor['user_id'] > 0) {
                    $regularAdvisors[] = $advisor;
                }
            }
        }
        
        return $regularAdvisors;
    }
}
