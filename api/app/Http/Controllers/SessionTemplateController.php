<?php
namespace App\Http\Controllers;

use App\Models\SessionTemplate;
use Illuminate\Http\Request;

class SessionTemplateController extends Controller
{
    public function index()
    {
        $user = auth('api')->user();
        $pro  = $user->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $templates = SessionTemplate::where('professional_id', $pro->id)
            ->orderByDesc('updated_at')->get();
        return response()->json(['templates' => $templates]);
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();
        $pro  = $user->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $tpl = SessionTemplate::create([
            'professional_id' => $pro->id,
            'name'            => $request->name,
            'category'        => $request->category ?? 'general',
            'subjective'      => $request->subjective,
            'objective'       => $request->objective,
            'assessment'      => $request->assessment,
            'plan'            => $request->plan,
            'notes'           => $request->notes,
        ]);
        return response()->json(['template' => $tpl], 201);
    }

    public function update(Request $request, $id)
    {
        $user = auth('api')->user();
        $pro  = $user->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        $tpl = SessionTemplate::where('id', $id)->where('professional_id', $pro->id)->firstOrFail();
        $tpl->update($request->only(['name', 'category', 'subjective', 'objective', 'assessment', 'plan', 'notes']));
        return response()->json(['template' => $tpl]);
    }

    public function destroy($id)
    {
        $user = auth('api')->user();
        $pro  = $user->professional;
        if (!$pro) return response()->json(['error' => 'Not a professional'], 403);

        SessionTemplate::where('id', $id)->where('professional_id', $pro->id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }
}
