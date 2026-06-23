<?php
namespace App\Http\Controllers;

use App\Models\PromoCode;
use App\Models\PromoRedemption;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PromoCodeController extends Controller
{
    public function validate(Request $request)
    {
        $code = PromoCode::where('code', strtoupper($request->code))
            ->where('is_active', true)->first();

        if (!$code) return response()->json(['error' => 'Invalid or expired code'], 404);
        if ($code->expires_at && $code->expires_at < now())
            return response()->json(['error' => 'This code has expired'], 422);
        if ($code->max_uses && $code->used_count >= $code->max_uses)
            return response()->json(['error' => 'This code has been fully used'], 422);

        $alreadyUsed = PromoRedemption::where('promo_code_id', $code->id)
            ->where('user_id', auth('api')->id())->exists();
        if ($alreadyUsed) return response()->json(['error' => 'You have already used this code'], 422);

        return response()->json([
            'valid'       => true,
            'type'        => $code->type,
            'value'       => $code->value,
            'description' => $code->type === 'percent'
                ? "{$code->value}% discount"
                : "KES " . number_format($code->value, 0) . " off",
        ]);
    }

    public function redeem(Request $request)
    {
        $code = PromoCode::where('code', strtoupper($request->code))
            ->where('is_active', true)->firstOrFail();

        $user = auth('api')->user();
        $alreadyUsed = PromoRedemption::where('promo_code_id', $code->id)
            ->where('user_id', $user->id)->exists();
        if ($alreadyUsed) return response()->json(['error' => 'Already redeemed'], 422);

        PromoRedemption::create([
            'promo_code_id'    => $code->id,
            'user_id'          => $user->id,
            'consultation_id'  => $request->consultation_id,
            'discount_applied' => $request->discount_amount ?? $code->value,
        ]);
        $code->increment('used_count');

        // Reward referrer with a new code (KES 200 credit)
        if ($code->referrer_id && $code->referrer_id !== $user->id) {
            PromoCode::create([
                'code'        => 'REF-' . strtoupper(Str::random(6)),
                'type'        => 'fixed',
                'value'       => 200,
                'max_uses'    => 1,
                'is_active'   => true,
                'referrer_id' => $code->referrer_id,
                'created_by'  => null,
                'expires_at'  => now()->addDays(90),
            ]);
        }

        return response()->json(['message' => 'Code redeemed successfully.']);
    }

    // Patient generates a personal referral code
    public function myReferralCode()
    {
        $user = auth('api')->user();
        $existing = PromoCode::where('referrer_id', $user->id)
            ->where('is_active', true)->where('max_uses', null)->first();

        if ($existing) return response()->json(['code' => $existing->code]);

        $code = PromoCode::create([
            'code'       => 'REF-' . strtoupper(Str::random(6)),
            'type'       => 'fixed',
            'value'      => 300,
            'max_uses'   => null,
            'is_active'  => true,
            'referrer_id'=> $user->id,
            'created_by' => $user->id,
        ]);
        return response()->json(['code' => $code->code]);
    }

    // Admin: create promo code
    public function adminCreate(Request $request)
    {
        $code = PromoCode::create([
            'code'       => strtoupper($request->code ?? Str::random(8)),
            'type'       => $request->type ?? 'fixed',
            'value'      => $request->value,
            'max_uses'   => $request->max_uses,
            'is_active'  => true,
            'created_by' => auth('api')->id(),
            'expires_at' => $request->expires_at,
        ]);
        return response()->json(['code' => $code], 201);
    }

    public function adminList()
    {
        $codes = PromoCode::orderByDesc('created_at')->paginate(50);
        return response()->json($codes);
    }
}
