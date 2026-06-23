<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialization extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'slug'];

    public function professionals()
    {
        return $this->belongsToMany(Professional::class, 'professional_specialization');
    }
}
