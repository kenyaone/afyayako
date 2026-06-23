<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class FollowUpSurvey extends Model {
    protected $table = 'follow_up_surveys';
    protected $fillable = ['consultation_id','user_id','survey_type','due_at','completed_at','responses','wellbeing_score'];
    protected $casts = ['due_at'=>'datetime','completed_at'=>'datetime','responses'=>'array'];
    public function consultation() { return $this->belongsTo(Consultation::class); }
}
