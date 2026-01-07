<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Project;
use App\Models\User;
use App\Models\Program;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Mockery;

class ProjectTransactionTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $program;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test department
        $department = Department::create([
            'name' => 'Test Department',
            'code' => 'TEST',
        ]);

        // Create test program
        $this->program = Program::create([
            'department_id' => $department->id,
            'name' => 'Test Program',
            'code' => 'TESTPROG',
            'degree_level' => 'bachelors',
        ]);

        // Create test user
        $this->user = User::factory()->create();
        $this->user->assignRole('student');
    }

    /**
     * Test that store() method rolls back on failure
     */
    public function test_store_rolls_back_on_failure()
    {
        $this->actingAs($this->user);

        $initialProjectCount = Project::count();

        // Attempt to create a project with invalid data that will fail during transaction
        // We'll use an invalid program_id to trigger a failure
        $response = $this->postJson('/api/projects', [
            'program_id' => 99999, // Non-existent program
            'title' => 'Test Project',
            'abstract' => 'Test Abstract',
            'academic_year' => '2023-2024',
            'semester' => 'fall',
            'members' => [
                ['user_id' => $this->user->id, 'role' => 'LEAD'],
            ],
        ]);

        // Verify that no project was created (rollback successful)
        $this->assertEquals($initialProjectCount, Project::count());
        $response->assertStatus(422); // Validation error
    }

    /**
     * Test that store() method commits on success
     */
    public function test_store_commits_on_success()
    {
        $this->actingAs($this->user);

        $initialProjectCount = Project::count();

        $response = $this->postJson('/api/projects', [
            'program_id' => $this->program->id,
            'title' => 'Test Project',
            'abstract' => 'Test Abstract',
            'keywords' => ['test', 'project'],
            'academic_year' => '2023-2024',
            'semester' => 'fall',
            'members' => [
                ['user_id' => $this->user->id, 'role' => 'LEAD'],
            ],
        ]);

        // Verify that project was created
        $this->assertEquals($initialProjectCount + 1, Project::count());
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'project' => [
                'id',
                'title',
                'abstract',
                'members',
            ],
        ]);

        // Verify that members were attached
        $project = Project::latest()->first();
        $this->assertEquals(1, $project->members()->count());
    }

    /**
     * Test that update() method rolls back on failure
     */
    public function test_update_rolls_back_on_failure()
    {
        $this->actingAs($this->user);

        // Create a project
        $project = Project::create([
            'program_id' => $this->program->id,
            'created_by_user_id' => $this->user->id,
            'title' => 'Original Title',
            'abstract' => 'Original Abstract',
            'academic_year' => '2023-2024',
            'semester' => 'fall',
            'status' => 'draft',
        ]);

        $originalTitle = $project->title;

        // Mock ProjectActivityService to throw an exception
        $this->mock('App\Services\ProjectActivityService', function ($mock) {
            $mock->shouldReceive('logProjectUpdated')
                ->andThrow(new \Exception('Service failure'));
        });

        // Attempt to update the project
        $response = $this->putJson("/api/projects/{$project->id}", [
            'title' => 'Updated Title',
        ]);

        // Verify that the project title was NOT updated (rollback successful)
        $project->refresh();
        $this->assertEquals($originalTitle, $project->title);
        $response->assertStatus(500);
    }

    /**
     * Test that update() method commits on success
     */
    public function test_update_commits_on_success()
    {
        $this->actingAs($this->user);

        // Create a project
        $project = Project::create([
            'program_id' => $this->program->id,
            'created_by_user_id' => $this->user->id,
            'title' => 'Original Title',
            'abstract' => 'Original Abstract',
            'academic_year' => '2023-2024',
            'semester' => 'fall',
            'status' => 'draft',
        ]);

        // Update the project
        $response = $this->putJson("/api/projects/{$project->id}", [
            'title' => 'Updated Title',
            'abstract' => 'Updated Abstract',
        ]);

        // Verify that the project was updated
        $project->refresh();
        $this->assertEquals('Updated Title', $project->title);
        $this->assertEquals('Updated Abstract', $project->abstract);
        $response->assertStatus(200);
    }

    /**
     * Test that destroy() method rolls back on failure
     */
    public function test_destroy_rolls_back_on_failure()
    {
        $this->actingAs($this->user);

        // Create a project
        $project = Project::create([
            'program_id' => $this->program->id,
            'created_by_user_id' => $this->user->id,
            'title' => 'Test Project',
            'abstract' => 'Test Abstract',
            'academic_year' => '2023-2024',
            'semester' => 'fall',
            'status' => 'draft',
        ]);

        $projectId = $project->id;

        // Mock DB facade to simulate a failure
        DB::shouldReceive('transaction')
            ->once()
            ->andThrow(new \Exception('Database error'));

        // Attempt to delete the project
        $response = $this->deleteJson("/api/projects/{$projectId}");

        // Verify that the project still exists (rollback successful)
        $this->assertDatabaseHas('projects', ['id' => $projectId]);
        $response->assertStatus(500);
    }

    /**
     * Test that destroy() method commits on success
     */
    public function test_destroy_commits_on_success()
    {
        $this->actingAs($this->user);

        // Create a project
        $project = Project::create([
            'program_id' => $this->program->id,
            'created_by_user_id' => $this->user->id,
            'title' => 'Test Project',
            'abstract' => 'Test Abstract',
            'academic_year' => '2023-2024',
            'semester' => 'fall',
            'status' => 'draft',
        ]);

        $projectId = $project->id;

        // Delete the project
        $response = $this->deleteJson("/api/projects/{$projectId}");

        // Verify that the project was deleted
        $this->assertDatabaseMissing('projects', ['id' => $projectId]);
        $response->assertStatus(200);
    }

    /**
     * Test that members sync is rolled back on failure
     */
    public function test_members_sync_rolls_back_on_failure()
    {
        $this->actingAs($this->user);

        $member1 = User::factory()->create();
        $member2 = User::factory()->create();

        // Create a project with initial members
        $project = Project::create([
            'program_id' => $this->program->id,
            'created_by_user_id' => $this->user->id,
            'title' => 'Test Project',
            'abstract' => 'Test Abstract',
            'academic_year' => '2023-2024',
            'semester' => 'fall',
            'status' => 'draft',
        ]);

        $project->members()->attach($member1->id, ['role_in_project' => 'MEMBER']);

        $initialMembersCount = $project->members()->count();

        // Mock ProjectActivityService to throw an exception
        $this->mock('App\Services\ProjectActivityService', function ($mock) {
            $mock->shouldReceive('logProjectUpdated')
                ->andThrow(new \Exception('Service failure'));
        });

        // Attempt to update members
        $response = $this->putJson("/api/projects/{$project->id}", [
            'members' => [
                ['user_id' => $member2->id, 'role' => 'MEMBER'],
            ],
        ]);

        // Verify that members were NOT synced (rollback successful)
        $project->refresh();
        $this->assertEquals($initialMembersCount, $project->members()->count());
        $this->assertTrue($project->members()->where('user_id', $member1->id)->exists());
        $this->assertFalse($project->members()->where('user_id', $member2->id)->exists());
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
