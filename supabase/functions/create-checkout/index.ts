
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabaseClient } from "../_shared/supabase-client.ts"
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Map plan names to Stripe price IDs (not product IDs)
const PLAN_PRICE_MAP = {
  // Standard naming - lowercase without spaces
  'basic': 'price_1OwhUCGy89EHd6dDXqixE95G',
  'professional': 'price_1OwhVcGy89EHd6dDLLpGI7QH',
  'business': 'price_1OwhXJGy89EHd6dDkgFytKkm',
  'initial': 'price_1OwhTbGy89EHd6dDgDI8FQpk',
  
  // Variations with spaces
  'basic plan': 'price_1OwhUCGy89EHd6dDXqixE95G',
  'professional plan': 'price_1OwhVcGy89EHd6dDLLpGI7QH',
  'business plan': 'price_1OwhXJGy89EHd6dDkgFytKkm',
  'initial plan': 'price_1OwhTbGy89EHd6dDgDI8FQpk',
  
  // Variations with capitalization
  'Basic': 'price_1OwhUCGy89EHd6dDXqixE95G',
  'Professional': 'price_1OwhVcGy89EHd6dDLLpGI7QH',
  'Business': 'price_1OwhXJGy89EHd6dDkgFytKkm',
  'Initial': 'price_1OwhTbGy89EHd6dDgDI8FQpk',
  
  // Variations with spaces and capitalization
  'Basic Plan': 'price_1OwhUCGy89EHd6dDXqixE95G',
  'Professional Plan': 'price_1OwhVcGy89EHd6dDLLpGI7QH',
  'Business Plan': 'price_1OwhXJGy89EHd6dDkgFytKkm',
  'Initial Plan': 'price_1OwhTbGy89EHd6dDgDI8FQpk'
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

    // Find the price ID for the plan
    console.log('Matching plan name:', plan.name)
    
    // Try direct matching with plan name
    let priceId = PLAN_PRICE_MAP[plan.name]
    
    // If not found, try lowercase version
    if (!priceId) {
      priceId = PLAN_PRICE_MAP[plan.name.toLowerCase()]
    }
    
    // If still not found, try removing spaces and lowercase
    if (!priceId) {
      const planKey = plan.name.toLowerCase().replace(/\s+/g, '')
      priceId = PLAN_PRICE_MAP[planKey]
    }
    
    console.log('Using price ID:', priceId)
    
    // If still no match, use basic as default
    if (!priceId) {
      console.log('No mapping found for plan name:', plan.name, 'using default basic plan')
      priceId = PLAN_PRICE_MAP.basic
    }
    
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
