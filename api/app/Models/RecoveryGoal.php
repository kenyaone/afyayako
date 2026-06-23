<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class RecoveryGoal extends Model {
    protected $guarded = [];
    protected $casts = ['milestones'=>'array','warning_signs'=>'array','coping_strategies'=>'array','support_contacts'=>'array','crisis_resources'=>'array','reasons_to_live'=>'array','safe_environment_steps'=>'array'];
    public function user() { return $this->belongsTo(User::class); }
    public function professional() { return $this->belongsTo(Professional::class); }
}
