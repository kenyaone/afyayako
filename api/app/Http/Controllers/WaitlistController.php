<?php
namespace App\Http\Controllers;

use App\Models\ProfessionalWaitlist;
use App\Models\Professional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class WaitlistController extends Controller
{
    public function join(Request $request, int $professionalId)
    {
        $user = auth('api')->user();
        $pro = Professional::findOrFail($professionalId);

        $entry = ProfessionalWaitlist::firstOrCreate(
            ['professional_id' => $pro->id, 'user_id' => $user->id],
            ['preferred_time' => $request->preferred_time, 'notified' => false]
        );

        return response()->json(['message' => 'Added to waitlist.', 'position' => $entry->id]);
    }

    public function leave(int $professionalId)
    {
        ProfessionalWaitlist::where('professional_id', $professionalId)
            ->where('user_id', auth('api')->id())->delete();
        return response()->json(['message' => 'Removed from waitlist.']);
    }

    public function myWaitlist()
    {
        $user = auth('api')->user();
        $entries = ProfessionalWaitlist::where('user_id', $user->id)
            ->with('professional.user:id,display_name')->get();
        return response()->json(['waitlist' => $entries]);
    }

    // Professional notifies next person on their waitlist
    public function notifyNext(int $professionalId)
    {
        $pro = Professional::where('id', $professionalId)
            ->where('user_id', auth('api')->id())->firstOrFail();

        $next = ProfessionalWaitlist::where('professional_id', $pro->id)
            ->where('notified', false)->orderBy('created_at')->first();

        if (!$next) return response()->json(['message' => 'Waitlist is empty.']);

        $next->update(['notified' => true, 'notified_at' => now()]);

        // Send email notification
        if ($next->user && $next->user->email) {
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Hi {$next->user->display_name},\n\n" .
                    "A slot has opened with {$pro->full_name}. Log in to book it now before it fills up.\n\n" .
                    "Visit: https://mhapke.com/professionals/{$pro->id}\n\n" .
                    "— Afya Yako Siri Yako",
                    fn($m) => $m->to($next->user->email)->subject('A slot opened with your waitlisted therapist')
                );
            } catch (\Exception $e) {}
        }

        return response()->json(['message' => 'Next person notified.', 'user' => $next->user?->display_name]);
    }
}
