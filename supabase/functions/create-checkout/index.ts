
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabaseClient } from "../_shared/supabase-client.ts"
import { corsHeaders, initializeStripe } from "../_shared/stripe-utils.ts"
import { 
  handlePayPerImageCheckout,
  handleSubscriptionCheckout
} from "../_shared/checkout-services.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'
    
    console.log('Starting checkout process...')
    
    if (!STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set')
      return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY is not set' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      })
    }

    // Initialize Stripe
    const stripe = initializeStripe(STRIPE_SECRET_KEY)

    // Parse request body
    const reqBody = await req.json()
    console.log('Request body:', JSON.stringify(reqBody))
    
    const { planId, userId, isPayPerImage, imagePackSize } = reqBody

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing required field: userId' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }

    try {
      // Handle pay-per-image checkout
      if (isPayPerImage) {
        const packSize = imagePackSize || 10 // Default to 10 images if not specified
        const result = await handlePayPerImageCheckout(userId, packSize, stripe, SITE_URL)
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        })
      }
      
      // Regular subscription flow
      if (!planId) {
        return new Response(JSON.stringify({ error: 'Missing required field: planId' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        })
      }
      
      const result = await handleSubscriptionCheckout(userId, planId, stripe, SITE_URL)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      })
    } catch (error) {
      console.error('Error processing checkout:', error)
      return new Response(JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      })
    }
  } catch (error) {
    console.error('Error in create-checkout function:', error)
    return new Response(JSON.stringify({ 
      error: 'Unexpected error in checkout process', 
      details: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    })
  }
})
