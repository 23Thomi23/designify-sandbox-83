
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabaseClient } from "../_shared/supabase-client.ts"
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Map plan names to Stripe price IDs
const PLAN_PRICE_MAP: Record<string, string> = {
  // Free plan - should be $0
  'free': 'price_1P2nW5Gy89EHd6dDUEvQ62Kl',
  
  // Paid plans
  'basic': 'price_1P2nWNGy89EHd6dDcQhKICDi',
  'professional': 'price_1P2nWaGy89EHd6dDFVFSqI8p',
  'business': 'price_1P2nWnGy89EHd6dDnm9DQYPj',
  
  // Default fallback - use the basic plan if no match found
  'default': 'price_1P2nWNGy89EHd6dDcQhKICDi'
}

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

    // Initialize Stripe with debug mode to see detailed errors
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Log request body for debugging
    const reqBody = await req.json()
    console.log('Request body:', JSON.stringify(reqBody))
    
    const { planId, userId } = reqBody

    if (!planId) {
      return new Response(JSON.stringify({ error: 'Missing required field: planId' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing required field: userId' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }

    // Get user and plan details
    console.log('Getting Supabase client...')
    const supabase = supabaseClient()
    console.log('Fetching plan details for planId:', planId)
    
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError) {
      console.error('Error fetching plan:', planError)
      return new Response(JSON.stringify({ error: 'Invalid plan ID', details: planError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }
    
    if (!plan) {
      console.error('Plan not found for ID:', planId)
      return new Response(JSON.stringify({ error: 'Plan not found' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }
    
    console.log('Plan found:', JSON.stringify(plan))
    
    // Check if this is the free plan (price = 0)
    if (plan.price === 0) {
      console.log('Free plan selected, no payment needed')
      // Here you would handle free plan signup logic
      // For example, you could create a subscription record with status 'active'
      // and set up the user's benefits without going through Stripe
      
      // For now, we'll just return a success message
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Free plan activated', 
        redirect: `${SITE_URL}/subscription/success?free=true` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      })
    }
    
    console.log('Fetching user details for userId:', userId)

    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return new Response(JSON.stringify({ error: 'Invalid user ID', details: userError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }
    
    if (!user) {
      console.error('User not found for ID:', userId)
      return new Response(JSON.stringify({ error: 'User not found' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }
    
    console.log('User found with email:', user.email)

    // Create Stripe customer if not already created
    console.log('Checking if user has a Stripe customer ID')
    let customerId: string
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', userId)
      .single()

    if (customerError || !customerData) {
      console.log('Creating new Stripe customer for user:', userId)
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: userId
          }
        })
        
        console.log('Stripe customer created:', customer.id)
        
        const { error: insertError } = await supabase
          .from('stripe_customers')
          .insert([{
            user_id: userId,
            customer_id: customer.id
          }])
          
        if (insertError) {
          console.error('Error saving Stripe customer ID:', insertError)
        }
        
        customerId = customer.id
      } catch (stripeError) {
        console.error('Stripe customer creation error:', stripeError)
        return new Response(JSON.stringify({ 
          error: 'Failed to create Stripe customer', 
          details: stripeError instanceof Error ? stripeError.message : String(stripeError)
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        })
      }
    } else {
      customerId = customerData.customer_id
      console.log('Found existing Stripe customer:', customerId)
    }

    // Get the plan name in lowercase for mapping
    const planNameLower = plan.name.toLowerCase().replace(/\s+/g, '');
    console.log('Looking up price ID for plan name (normalized):', planNameLower);
    
    // Find the price ID for the plan - use the normalized plan name or fallback to default
    let priceId = PLAN_PRICE_MAP[planNameLower] || PLAN_PRICE_MAP['default'];
    console.log('Using price ID:', priceId);
    
    // Create Stripe session
    console.log('Creating Stripe checkout session with:')
    console.log('- Customer ID:', customerId)
    console.log('- Price ID:', priceId)
    console.log('- Success URL:', `${SITE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`)
    console.log('- Cancel URL:', `${SITE_URL}/subscription/cancel`)
    
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${SITE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}/subscription/cancel`,
        metadata: {
          userId: userId,
          planId: planId
        }
      })
      
      console.log('Checkout session created successfully:', session.id)
      console.log('Checkout URL:', session.url)

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      })
    } catch (stripeError) {
      console.error('Stripe session creation error:', stripeError)
      return new Response(JSON.stringify({ 
        error: 'Failed to create checkout session', 
        details: stripeError instanceof Error ? stripeError.message : String(stripeError)
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
