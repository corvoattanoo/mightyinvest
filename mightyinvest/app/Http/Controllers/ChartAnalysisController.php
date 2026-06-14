<?php

namespace App\Http\Controllers;


use App\Models\ChartAnalysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ChartAnalysisController extends Controller
{
    // AI graph analys

    public function analyze(Request $request) {

        $monthlyCount = ChartAnalysis::where('user_id', $request->user()->id)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        if($monthlyCount >= 100){
            return response()->json([
                'message' => 'You have reached your monthly limit of 100 analyses.'
            ], 429);
        }

        // validate image upload
        $request->validate([
            'chart' => 'required|image|max:5120|mimes:jpeg,png,jpg,webp',
        ]);

        try {
            //UPLOAD IMAGE
            $file = $request->file('chart');
            $disk = env('FILESYSTEM_DISK', 'public');
            $path = $file->store('chart', $disk);
            $imageUrl = \Illuminate\Support\Facades\Storage::disk($disk)->url($path);

            //DB record
            $analysis = ChartAnalysis::create([
                'user_id' => $request->user()->id,
                'image_path' => $imageUrl,
                'status' => 'pending',
            ]);

            //JOB DISPATCH
            \App\Jobs\AnalyzeChartJob::dispatch($analysis->id);

             return  response()->json([
                'success' => true,
                'data' => $analysis,
                'status' => 'pending',
                'remaining' => max(0, 100 - ($monthlyCount + 1))
            ], Response::HTTP_ACCEPTED);


        } catch (\Throwable $th) {
                Log::error("Graph analysis error: " . $th->getMessage());
                return response()->json([
                'message' => 'An unexpected error occurred in the system.'
        ],  Response::HTTP_INTERNAL_SERVER_ERROR);
        }   
    }
    // liset past analysis fo the user
    public function history(Request $request){
            $analyses = ChartAnalysis::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $monthlyCount = ChartAnalysis::where('user_id', $request->user()->id)
                ->where('created_at', '>=', now()->startOfMonth())
                ->count();

            return response()->json([
                'success' => true,
                'data' => $analyses,
                'remaining' => max(0, 100 - $monthlyCount)
            ]);
        }
    
}
