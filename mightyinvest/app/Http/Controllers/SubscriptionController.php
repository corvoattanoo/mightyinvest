<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends Controller
{
    public function createCheckoutSession(Request $request){
        
        $request->validate([
            'plan' => 'required|in:monthly,yearly'
        ]);

        $priceId = $request->plan === 'yearly'
            ? config('services.stripe.yearly_price_id')
            : config('services.stripe.monthly_price_id');

            $user = $request->user();

            $checkout = $user->newSubscription('default', $priceId)
                ->checkout([
                    'success_url' => config('app.frontend_url') . '/premium/success?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => config('app.frontend_url') . '/premium/cancel',
                ]);

            return response()->json([
                'checkout_url' => $checkout->url,
            ]);
            
    }

    public function getStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscription('default');

        return response()->json([
            'is_premium' => $user->is_premium,
            'subscribed' => $user->subscribed('default'),
            'status' => $subscription?->stripe_status ?? 'none',
            'plan'          => $subscription?->items->first()?->stripe_price ?? null,
            'ends_at'       => $subscription?->ends_at,
        ]);
    }
    
}
