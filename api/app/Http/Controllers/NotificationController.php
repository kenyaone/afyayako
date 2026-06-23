<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user  = auth('api')->user();
        $query = Notification::where('user_id', $user->id)->orderByDesc('created_at');

        if ($request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        return response()->json([
            'notifications' => $query->limit(50)->get(),
            'unread_count'  => Notification::where('user_id', $user->id)->whereNull('read_at')->count(),
        ]);
    }

    public function markRead(Request $request)
    {
        $user = auth('api')->user();
        $ids  = (array) $request->input('ids', []);

        $q = Notification::where('user_id', $user->id)->whereNull('read_at');
        if (!empty($ids)) {
            $q->whereIn('id', $ids);
        }
        $q->update(['read_at' => now()]);

        return response()->json(['status' => 'ok']);
    }
}
