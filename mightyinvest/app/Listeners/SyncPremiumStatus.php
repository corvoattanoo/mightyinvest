<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Laravel\Cashier\Events\WebhookHandled;
use App\Models\User;

class SyncPremiumStatus
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(WebhookHandled $event): void
    {
        $payload = $event->payload;

        \Log::info($payload);
        $type = $payload['type'] ?? '';
        
        if(in_array($type, [
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
        ])){
            $stripeID =$payload['data']['object']['customer'] ?? null;
            
            if($stripeID){
                $user = User::where('stripe_id', $stripeID)->first();

                if($user){
                    $user->update([
                        'is_premium' => $user->subscribed('default')
                    ]);
                }
            }           
        }
    }
}
