<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $guarded = [];
    protected $casts = [
        'is_active'  => 'boolean',
        'is_custom'  => 'boolean',
        'latitude'   => 'float',
        'longitude'  => 'float',
    ];
}
