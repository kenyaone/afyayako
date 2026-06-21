<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\AsCollection;

class Professional extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'email',
        'full_name',
        'phone',
        'professional_type',
        'kmpdc_license',
        'cpb_license',
        'professional_photo_path',
        'professional_photo_original_name',
        'license_document_path',
        'license_document_original_name',
        'specializations',
        'languages',
        'sop_agreed',
        'sop_agreed_at',
        'signature_name',
        'mpesa_number',
        'bank_name',
        'account_number',
        'account_name',
        'branch_code',
        'rate_per_hour',
        'status',
        'rejection_reason',
        'verified_at',
        'bio',
        'years_experience',
    ];

    protected $casts = [
        'specializations' => 'array',
        'languages' => 'array',
        'sop_agreed' => 'boolean',
        'sop_agreed_at' => 'datetime',
        'verified_at' => 'datetime',
        'rate_per_hour' => 'decimal:2',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
        'sop_agreed_at',
        'verified_at',
    ];

    /**
     * Scope: Get only verified professionals
     */
    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    /**
     * Scope: Get pending applications
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Get photo URL
     */
    public function getPhotoUrlAttribute()
    {
        if (!$this->professional_photo_path) {
            return null;
        }
        return asset('storage/' . $this->professional_photo_path);
    }

    /**
     * Get license URL
     */
    public function getLicenseUrlAttribute()
    {
        if (!$this->license_document_path) {
            return null;
        }
        return asset('storage/' . $this->license_document_path);
    }

    /**
     * Check if professional has completed SOP
     */
    public function hasAgreedToSop()
    {
        return $this->sop_agreed === true;
    }

    /**
     * Format specializations for display
     */
    public function getFormattedSpecializationsAttribute()
    {
        if (!$this->specializations) {
            return [];
        }
        return is_array($this->specializations) ? $this->specializations : json_decode($this->specializations, true);
    }

    /**
     * Format languages for display
     */
    public function getFormattedLanguagesAttribute()
    {
        if (!$this->languages) {
            return ['english'];
        }
        return is_array($this->languages) ? $this->languages : json_decode($this->languages, true);
    }
}
