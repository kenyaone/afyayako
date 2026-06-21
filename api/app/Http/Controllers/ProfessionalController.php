<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Professional;
use Carbon\Carbon;

class ProfessionalController extends Controller
{
    /**
     * Handle professional application with file uploads
     */
    public function apply(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:professionals,email',
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'professional_type' => 'required|in:counselor,doctor,peer_mentor,corporate',

            // File uploads
            'professional_photo' => 'nullable|image|mimes:jpeg,png,webp|max:5120', // 5MB
            'license_document' => 'nullable|mimes:pdf,jpeg,png,jpg|max:10240', // 10MB

            // License Information
            'kmpdc_license' => 'nullable|string',
            'cpb_license' => 'nullable|string',

            // Specializations & Languages
            'specializations' => 'nullable|array',
            'languages' => 'nullable|array',

            // SOP Consent
            'sop_agreed' => 'required|boolean|accepted',
            'signature_name' => 'required|string|max:255',

            // Payment Information
            'mpesa_number' => 'required|string|max:20',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:50',
            'account_name' => 'nullable|string|max:255',
            'branch_code' => 'nullable|string|max:50',
            'rate_per_hour' => 'required|numeric|min:500',

            // Bio & Experience
            'bio' => 'nullable|string|max:1000',
            'years_experience' => 'nullable|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Create professional record
            $professional = new Professional();
            $professional->email = $request->email;
            $professional->full_name = $request->full_name;
            $professional->phone = $request->phone;
            $professional->professional_type = $request->professional_type;
            $professional->kmpdc_license = $request->kmpdc_license;
            $professional->cpb_license = $request->cpb_license;

            // Handle photo upload
            if ($request->hasFile('professional_photo')) {
                $photoPath = $this->storeFile(
                    $request->file('professional_photo'),
                    'professionals/photos',
                    $request->email
                );
                $professional->professional_photo_path = $photoPath;
                $professional->professional_photo_original_name = $request->file('professional_photo')->getClientOriginalName();
            }

            // Handle license document upload
            if ($request->hasFile('license_document')) {
                $licensePath = $this->storeFile(
                    $request->file('license_document'),
                    'professionals/licenses',
                    $request->email
                );
                $professional->license_document_path = $licensePath;
                $professional->license_document_original_name = $request->file('license_document')->getClientOriginalName();
            }

            // Specializations & Languages
            $professional->specializations = $request->specializations ?? [];
            $professional->languages = $request->languages ?? ['english'];

            // SOP Consent
            $professional->sop_agreed = true;
            $professional->sop_agreed_at = Carbon::now();
            $professional->signature_name = $request->signature_name;

            // Payment Information
            $professional->mpesa_number = $request->mpesa_number;
            $professional->bank_name = $request->bank_name;
            $professional->account_number = $request->account_number;
            $professional->account_name = $request->account_name;
            $professional->branch_code = $request->branch_code;
            $professional->rate_per_hour = $request->rate_per_hour;

            // Bio & Experience
            $professional->bio = $request->bio;
            $professional->years_experience = $request->years_experience;

            // Set initial status to pending (admin review required)
            $professional->status = 'pending';

            $professional->save();

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully. Our team will review your documents and contact you within 24 hours.',
                'professional_id' => $professional->id,
                'status' => $professional->status,
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Professional application error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to process application. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Store file and return path
     */
    private function storeFile($file, $directory, $email)
    {
        $timestamp = now()->format('YmdHis');
        $sanitizedEmail = str_replace('@', '_', $email);
        $filename = "{$sanitizedEmail}_{$timestamp}." . $file->getClientOriginalExtension();

        // Store in storage/uploads/ directory
        $path = $file->storeAs($directory, $filename, 'uploads');

        return $path;
    }

    /**
     * Get professional details (authenticated)
     */
    public function show($id)
    {
        $professional = Professional::where('status', 'verified')->find($id);

        if (!$professional) {
            return response()->json([
                'success' => false,
                'message' => 'Professional not found or not verified',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $professional->id,
                'name' => $professional->full_name,
                'specializations' => $professional->specializations,
                'languages' => $professional->languages,
                'rate_per_hour' => $professional->rate_per_hour,
                'years_experience' => $professional->years_experience,
                'bio' => $professional->bio,
                'photo_url' => $professional->professional_photo_path ? asset('storage/' . $professional->professional_photo_path) : null,
            ],
        ]);
    }

    /**
     * List all verified professionals (public)
     */
    public function index(Request $request)
    {
        $query = Professional::where('status', 'verified');

        // Filter by specialization
        if ($request->has('specialization')) {
            $query->where('specializations', 'like', '%' . $request->specialization . '%');
        }

        // Filter by language
        if ($request->has('language')) {
            $query->where('languages', 'like', '%' . $request->language . '%');
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('professional_type', $request->type);
        }

        $professionals = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $professionals->items(),
            'pagination' => [
                'total' => $professionals->total(),
                'per_page' => $professionals->perPage(),
                'current_page' => $professionals->currentPage(),
            ],
        ]);
    }

    /**
     * Get professional dashboard (authenticated)
     */
    public function dashboard()
    {
        $user = auth()->user();
        $professional = Professional::where('user_id', $user->id)->first();

        if (!$professional) {
            return response()->json([
                'success' => false,
                'message' => 'Professional profile not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $professional,
            'stats' => [
                'status' => $professional->status,
                'verified_at' => $professional->verified_at,
                'sessions_completed' => 0, // To be implemented
                'earnings_total' => 0, // To be implemented
            ],
        ]);
    }

    /**
     * Update availability (authenticated)
     */
    public function updateAvailability(Request $request)
    {
        $user = auth()->user();
        $professional = Professional::where('user_id', $user->id)->first();

        if (!$professional) {
            return response()->json([
                'success' => false,
                'message' => 'Professional profile not found',
            ], 404);
        }

        // Implementation for availability updates
        // This would integrate with the AvailabilityController

        return response()->json([
            'success' => true,
            'message' => 'Availability updated',
        ]);
    }

    /**
     * Professional registration (authenticated)
     */
    public function register(Request $request)
    {
        // This is for existing users creating a professional profile
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'professional_type' => 'required|in:counselor,doctor,peer_mentor,corporate',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $professional = Professional::updateOrCreate(
            ['user_id' => $user->id],
            [
                'email' => $user->email,
                'full_name' => $request->full_name,
                'professional_type' => $request->professional_type,
                'status' => 'pending',
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $professional,
        ]);
    }
}
