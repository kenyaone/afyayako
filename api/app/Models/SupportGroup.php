<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SupportGroup extends Model {
    protected $fillable = ['name','slug','description','category','icon','is_active','member_count'];
    protected $casts = ['is_active'=>'boolean'];
    public function memberships() { return $this->hasMany(GroupMembership::class,'group_id'); }
    public function messages() { return $this->hasMany(GroupMessage::class,'group_id'); }
    public function isMember(int $userId): bool {
        return $this->memberships()->where('user_id',$userId)->exists();
    }
}
