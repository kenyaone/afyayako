<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class GroupMessage extends Model {
    protected $table = 'group_messages';
    protected $fillable = ['group_id','user_id','content','display_name','is_pinned','is_moderated'];
    protected $casts = ['is_pinned'=>'boolean','is_moderated'=>'boolean'];
}
