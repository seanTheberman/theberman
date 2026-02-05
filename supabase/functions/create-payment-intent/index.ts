
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

console.log("Create Payment Intent Function Invoked")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, currency = 'eur', metadata } = await req.json()

        // 1. Initialize Stripe
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
        if (!STRIPE_SECRET_KEY) {
            throw new Error('Missing STRIPE_SECRET_KEY environment variable')
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2022-11-15',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // 2. Create PaymentIntent
        const amountInCents = Math.round(amount * 100)

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency,
            automatic_payment_methods: { enabled: true },
            metadata: metadata || {},
        })

        // 3. Return clientSecret to frontend
        return new Response(
            JSON.stringify({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            },
        )
    } catch (error: any) {
        console.error(error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            },
        )
    }
})
