
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabaseClient } from "../_shared/supabase-client.ts"
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `${plan.included_images} images per month`,
            },
            unit_amount: Math.round(plan.price * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
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
