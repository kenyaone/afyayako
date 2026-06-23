<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_sw',
        'slug',
        'category',
        'language',
        'level',
        'summary',
        'summary_sw',
        'content',
        'content_sw',
        'key_takeaways',
        'key_takeaways_sw',
        'duration_minutes',
        'is_premium',
        'is_published',
        'order',
        'thumbnail_emoji',
    ];

    protected function casts(): array
    {
        return [
            'key_takeaways' => 'array',
            'key_takeaways_sw' => 'array',
            'is_premium' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function progress()
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function userProgress()
    {
        return $this->hasOne(LessonProgress::class)->where('user_id', auth('api')->id());
    }
}
