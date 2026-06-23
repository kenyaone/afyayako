<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PeerMentorProfile extends Model
{
    protected $guarded = [];
    protected $casts = ['conditions_helped' => 'array', 'is_active' => 'boolean', 'is_verified' => 'boolean'];

    public function user() { return $this->belongsTo(User::class); }
}
