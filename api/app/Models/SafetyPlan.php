<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SafetyPlan extends Model {
    protected $guarded = [];
    // PHI encrypted at rest (MoH Guideline 4 — Data Management & Confidentiality)
    protected $casts = ['milestones'=>'array','warning_signs'=>'encrypted:array','coping_strategies'=>'encrypted:array','support_contacts'=>'encrypted:array','crisis_resources'=>'encrypted:array','reasons_to_live'=>'encrypted:array','safe_environment_steps'=>'encrypted:array'];
    public function user() { return $this->belongsTo(User::class); }
    public function professional() { return $this->belongsTo(Professional::class); }
}
