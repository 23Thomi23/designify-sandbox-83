
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabaseClient } from "../_shared/supabase-client.ts"
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Map plan IDs to Stripe product IDs with multiple possible database naming variations
const PLAN_PRODUCT_MAP = {
  // Standard naming - lowercase without spaces
  'basic': 'prod_Rw6uZtBUhYP4nK',
  'professional': 'prod_Rw6vNNtU27aVfE',
  'business': 'prod_Rw6wuuBVh4OrbN',
  'initial': 'prod_Rw6uDCgGcVASwd',
  
  // Variations with spaces
  'basic plan': 'prod_Rw6uZtBUhYP4nK',
  'professional plan': 'prod_Rw6vNNtU27aVfE',
  'business plan': 'prod_Rw6wuuBVh4OrbN',
  'initial plan': 'prod_Rw6uDCgGcVASwd',
  
  // Variations with capitalization
  'Basic': 'prod_Rw6uZtBUhYP4nK',
  'Professional': 'prod_Rw6vNNtU27aVfE',
  'Business': 'prod_Rw6wuuBVh4OrbN',
  'Initial': 'prod_Rw6uDCgGcVASwd',
  
  // Variations with spaces and capitalization
  'Basic Plan': 'prod_Rw6uZtBUhYP4nK',
  'Professional Plan': 'prod_Rw6vNNtU27aVfE',
  'Business Plan': 'prod_Rw6wuuBVh4OrbN',
  'Initial Plan': 'prod_Rw6uDCgGcVASwd'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'
    
    if (!STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set')
      return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY is not set' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      })
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const { planId, userId } = await req.json()

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
    const supabase = supabaseClient()
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      console.error('Error fetching plan:', planError)
      return new Response(JSON.stringify({ error: 'Invalid plan ID' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }

    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('Error fetching user:', userError)
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }

    // Create Stripe customer if not already created
    let customerId: string
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', userId)
      .single()

    if (customerError || !customerData) {
      console.log('Creating new Stripe customer for user:', userId)
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId
        }
      })
      
      await supabase
        .from('stripe_customers')
        .insert([{
          user_id: userId,
          customer_id: customer.id
        }])
      
      customerId = customer.id
    } else {
      customerId = customerData.customer_id
    }

    // Try direct matching with plan name first (exact match, case-sensitive)
    let productId = PLAN_PRODUCT_MAP[plan.name]
    
    // If not found, try lowercase version
    if (!productId) {
      productId = PLAN_PRODUCT_MAP[plan.name.toLowerCase()]
    }
    
    // If still not found, try removing spaces and lowercase
    if (!productId) {
      const planKey = plan.name.toLowerCase().replace(/\s+/g, '')
      productId = PLAN_PRODUCT_MAP[planKey]
    }
    
    // Log what plan name we're trying to match
    console.log('Matching plan name:', plan.name, 'to product ID:', productId)
    
    // If still no match, use basic as default
    if (!productId) {
      console.log('No mapping found for plan name:', plan.name, 'using default basic plan')
      productId = PLAN_PRODUCT_MAP.basic
    }
    
    // Find the prices for the product
    const { data: prices } = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1,
    })

    if (!prices || prices.length === 0) {
      console.error('No prices found for product:', productId)
      return new Response(JSON.stringify({ error: 'No pricing available for this plan' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices[0].id,
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

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    })
  } catch (error) {
    console.error('Error in create-checkout function:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    })
  }
})
