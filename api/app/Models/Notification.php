<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $table = 'notifications';

    protected $fillable = [
        'user_id', 'type', 'title', 'body', 'data', 'is_urgent', 'read_at',
    ];

    protected $casts = [
        'data'      => 'array',
        'is_urgent' => 'boolean',
        'read_at'   => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Dispatch a notification to one user
    public static function send(int $userId, string $type, string $title, string $body = '', array $data = [], bool $urgent = false): self
    {
        return self::create([
            'user_id'   => $userId,
            'type'      => $type,
            'title'     => $title,
            'body'      => $body,
            'data'      => $data,
            'is_urgent' => $urgent,
        ]);
    }

    // Dispatch to all admins
    public static function sendToAdmins(string $type, string $title, string $body = '', array $data = [], bool $urgent = false): void
    {
        $adminIds = User::where('role', 'admin')->pluck('id');
        foreach ($adminIds as $id) {
            self::send($id, $type, $title, $body, $data, $urgent);
        }
    }

    // Dispatch to all currently-online professionals
    public static function sendToOnlineProfessionals(string $type, string $title, string $body = '', array $data = [], bool $urgent = false): void
    {
        $onlineProIds = UserPresence::where('last_seen_at', '>=', UserPresence::onlineCutoff())
            ->whereHas('user', fn($q) => $q->where('role', 'professional'))
            ->pluck('user_id');

        foreach ($onlineProIds as $id) {
            self::send($id, $type, $title, $body, $data, $urgent);
        }
    }
}
