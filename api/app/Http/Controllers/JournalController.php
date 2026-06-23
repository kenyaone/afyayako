<?php
namespace App\Http\Controllers;

use App\Models\JournalEntry;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $user = auth('api')->user();
        $q = $request->query('q');

        $entries = JournalEntry::where('user_id', $user->id)
            ->when($q, fn($query) => $query->where('content', 'like', "%{$q}%")
                ->orWhere('title', 'like', "%{$q}%"))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($entries);
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();
        $entry = JournalEntry::create([
            'user_id' => $user->id,
            'title'   => $request->title,
            'content' => $request->content,
            'mood'    => $request->mood,
            'tags'    => $request->tags ?? [],
        ]);
        return response()->json(['entry' => $entry], 201);
    }

    public function show($id)
    {
        $user = auth('api')->user();
        $entry = JournalEntry::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        return response()->json(['entry' => $entry]);
    }

    public function update(Request $request, $id)
    {
        $user = auth('api')->user();
        $entry = JournalEntry::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $entry->update($request->only(['title', 'content', 'mood', 'tags']));
        return response()->json(['entry' => $entry]);
    }

    public function destroy($id)
    {
        $user = auth('api')->user();
        JournalEntry::where('id', $id)->where('user_id', $user->id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }
}
