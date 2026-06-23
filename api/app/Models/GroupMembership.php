<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class GroupMembership extends Model {
    protected $table = 'group_memberships';
    protected $fillable = ['group_id','user_id','display_name','is_anonymous','joined_at'];
    protected $casts = ['is_anonymous'=>'boolean','joined_at'=>'datetime'];
}
