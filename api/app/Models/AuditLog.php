<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Access/audit trail for clinical records (MoH Guideline 4 — Data Management).
 * Records who accessed or exported sensitive data, when, and from where.
 */
class AuditLog extends Model
{
    public const UPDATED_AT = null; // immutable log — created_at only

    protected $fillable = [
        'user_id', 'action', 'subject_type', 'subject_id', 'ip_address', 'meta',
    ];

    protected $casts = [
        'meta'       => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Record an audit entry. Never throws — auditing must not break the request.
     */
    public static function record(
        string $action,
        ?string $subjectType = null,
        ?int $subjectId = null,
        array $meta = []
    ): void {
        try {
            self::create([
                'user_id'      => auth('api')->id(),
                'action'       => $action,
                'subject_type' => $subjectType,
                'subject_id'   => $subjectId,
                'ip_address'   => request()->ip(),
                'meta'         => $meta ?: null,
                'created_at'   => now(),
            ]);
        } catch (\Throwable $e) {
            // swallow — audit logging is best-effort
        }
    }
}
