<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function faculty()
    {
        return $this->hasMany(Faculty::class);
    }
}
