<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPresence extends Model
{
    protected $table = 'user_presence';

    protected $fillable = [
        'user_id', 'last_seen_at', 'is_online', 'status',
        'current_page', 'typing_in_consultation_id', 'typing_updated_at',
    ];

    protected $casts = [
        'last_seen_at'       => 'datetime',
        'typing_updated_at'  => 'datetime',
        'is_online'          => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // User is considered online if seen in the last 60 seconds
    public static function onlineCutoff(): \Carbon\Carbon
    {
        return now()->subSeconds(60);
    }

    // User is considered away if seen in last 5 minutes but not last 60s
    public static function awayCutoff(): \Carbon\Carbon
    {
        return now()->subMinutes(5);
    }
}
