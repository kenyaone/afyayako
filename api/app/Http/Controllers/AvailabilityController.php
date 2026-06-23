<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Professional;
use App\Models\ProfessionalAvailability;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    // Professional sets / replaces their weekly availability slots
    public function update(Request $request)
    {
        $user = auth('api')->user();
        $pro  = Professional::where('email', $user->email)->first();
        if (!$pro) return response()->json(['error' => 'Not a professional.'], 403);

        $request->validate([
            'slots'               => 'required|array',
            'slots.*.day_of_week' => 'required|integer|min:0|max:6',
            'slots.*.start_time'  => 'required|date_format:H:i',
            'slots.*.end_time'    => 'required|date_format:H:i|after:slots.*.start_time',
            'max_clients_per_week'=> 'sometimes|integer|min:1|max:60',
        ]);

        // Replace all existing slots
        ProfessionalAvailability::where('professional_id', $pro->id)->delete();

        foreach ($request->slots as $slot) {
            ProfessionalAvailability::create([
                'professional_id' => $pro->id,
                'day_of_week'     => $slot['day_of_week'],
                'start_time'      => $slot['start_time'],
                'end_time'        => $slot['end_time'],
                'is_active'       => true,
            ]);
        }

        if ($request->filled('max_clients_per_week')) {
            $pro->update(['max_clients_per_week' => $request->max_clients_per_week]);
        }

        return response()->json(['message' => 'Availability updated.', 'slots' => $request->slots]);
    }

    // Get my availability
    public function mine()
    {
        $user = auth('api')->user();
        $pro  = Professional::where('email', $user->email)->first();
        if (!$pro) return response()->json(['error' => 'Not a professional.'], 403);

        return response()->json([
            'slots' => $pro->availability()->where('is_active', true)->get(),
            'max_clients_per_week' => $pro->max_clients_per_week,
        ]);
    }

    // Get available booking slots for a professional on a specific date
    public function bookableSlots(Request $request, int $professionalId)
    {
        $request->validate(['date' => 'required|date']);
        $date = \Carbon\Carbon::parse($request->date);
        $dow  = $date->dayOfWeek;   // 0=Sun .. 6=Sat

        $pro  = Professional::with('availability')->find($professionalId);
        if (!$pro) return response()->json(['slots' => []]);

        $slots = $pro->availability
            ->where('day_of_week', $dow)
            ->where('is_active', true);

        if ($slots->isEmpty()) {
            return response()->json(['slots' => [], 'message' => 'Professional is not available on this day.']);
        }

        // Get already-booked times on this date
        $booked = Consultation::where('professional_id', $professionalId)
            ->whereDate('scheduled_at', $date->toDateString())
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->get(['scheduled_at', 'duration_minutes']);

        $available = [];
        foreach ($slots as $slot) {
            $start = \Carbon\Carbon::parse($date->toDateString() . ' ' . $slot->start_time);
            $end   = \Carbon\Carbon::parse($date->toDateString() . ' ' . $slot->end_time);
            $cursor = $start->copy();

            while ($cursor->copy()->addHour()->lte($end)) {
                $slotStart = $cursor->copy();
                $slotEnd   = $cursor->copy()->addHour();

                // Check collision with booked consultations
                $conflict = $booked->first(function ($b) use ($slotStart, $slotEnd) {
                    $bs = \Carbon\Carbon::parse($b->scheduled_at);
                    $be = $bs->copy()->addMinutes($b->duration_minutes);
                    return $slotStart->lt($be) && $slotEnd->gt($bs);
                });

                if (!$conflict) {
                    $available[] = [
                        'start' => $slotStart->format('H:i'),
                        'end'   => $slotEnd->format('H:i'),
                        'iso'   => $slotStart->toISOString(),
                    ];
                }
                $cursor->addHour();
            }
        }

        return response()->json(['slots' => $available, 'date' => $date->toDateString()]);
    }
}
