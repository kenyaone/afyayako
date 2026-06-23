<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SessionFeedback extends Model {
    protected $table = 'session_feedback';
    protected $fillable = ['consultation_id','user_id','overall_rating','communication_rating','felt_heard','would_recommend','felt_safe','comment','flag_status','flag_reason','flagged_by','flagged_at','is_hidden'];
    protected $casts = ['felt_heard'=>'boolean','would_recommend'=>'boolean','felt_safe'=>'boolean','is_hidden'=>'boolean','flagged_at'=>'datetime'];

    public function consultation() { return $this->belongsTo(Consultation::class); }
    public function flagger()      { return $this->belongsTo(\App\Models\User::class, 'flagged_by'); }
}
