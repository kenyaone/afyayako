<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Referral extends Model {
    protected $fillable = ['professional_id','patient_id','consultation_id','type','referred_to_professional_id','referred_to_name','referred_to_org','reason','notes','status','receiver_notes','responded_at','outcome','outcome_at'];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
            'outcome_at'   => 'datetime',
        ];
    }

    public function professional() { return $this->belongsTo(Professional::class); }
    public function patient() { return $this->belongsTo(User::class,'patient_id'); }
    public function referredToProfessional() { return $this->belongsTo(Professional::class, 'referred_to_professional_id'); }
}
