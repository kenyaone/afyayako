<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LocationController extends Controller
{
    /** Public: active locations for dropdowns/filters. */
    public function index()
    {
        $locations = Location::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'county', 'town', 'latitude', 'longitude']);

        return response()->json(['locations' => $locations]);
    }

    /** Admin: full list incl. inactive. */
    public function adminIndex()
    {
        return response()->json(['locations' => Location::orderBy('name')->get()]);
    }

    /** Admin: add a custom location. */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:120',
            'county'    => 'nullable|string|max:120',
            'town'      => 'nullable|string|max:120',
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        $location = Location::create([
            'name'      => $request->name,
            'county'    => $request->county ?: $request->name,
            'town'      => $request->town ?: $request->name,
            'latitude'  => $request->latitude,
            'longitude' => $request->longitude,
            'is_active' => true,
            'is_custom' => true,
        ]);

        return response()->json(['location' => $location], 201);
    }

    /** Admin: update a location. */
    public function update(Request $request, $id)
    {
        $location = Location::findOrFail($id);
        $location->update($request->only(['name', 'county', 'town', 'latitude', 'longitude', 'is_active']));
        return response()->json(['location' => $location]);
    }

    /** Admin: delete a location. */
    public function destroy($id)
    {
        Location::findOrFail($id)->delete();
        return response()->json(['message' => 'Location deleted.']);
    }
}
