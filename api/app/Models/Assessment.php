<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Assessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'assessment_type',
        'score',
        'severity',
        'interpretation',
        'recommendations',
        'responses',
        'is_crisis_flag',
    ];

    protected function casts(): array
    {
        return [
            'responses' => 'encrypted:array', // PHI encrypted at rest (Guideline 4)
            'is_crisis_flag' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
