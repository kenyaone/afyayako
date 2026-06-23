<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientRiskAssessment extends Model
{
    protected $guarded = [];
    protected $casts = ['payload' => 'array'];
}
