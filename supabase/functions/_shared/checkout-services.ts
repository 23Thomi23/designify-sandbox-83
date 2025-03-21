
import { supabaseClient } from "./supabase-client.ts"
import { corsHeaders, PLAN_PRICE_MAP, initializeStripe } from "./stripe-utils.ts"
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

// Handles free plan subscriptions
export const handleFreePlanSubscription = async (userId: string, planId: string) => {
  console.log('Free plan selected, no payment needed')
  const supabase = supabaseClient()
  
  try {
    // First check if the user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('id, subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
      
    if (existingSubscription) {
      // Update existing subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          subscription_id: planId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id);
        
      if (error) throw error;
    } else {
      // Create new subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          subscription_id: planId,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });
        
      if (error) throw error;
    }
    
    // Get plan details to update available images
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('included_images')
      .eq('id', planId)
      .single();
      
    if (planError) throw planError;
    
    // Update user's available images based on the selected plan
    const { data: existingConsumption } = await supabase
      .from('image_consumption')
      .select('id, used_images')
      .eq('user_id', userId)
      .single();
      
    if (existingConsumption) {
      // Update existing consumption
      const { error } = await supabase
        .from('image_consumption')
        .update({ 
          available_images: plan.included_images,
          used_images: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConsumption.id);
        
      if (error) throw error;
    } else {
      // Create new consumption record
      const { error } = await supabase
        .from('image_consumption')
        .insert({
          user_id: userId,
          available_images: plan.included_images,
          used_images: 0
        });
        
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up free subscription:', error);
    throw error;
  }
}

// Get or create a Stripe customer
export const getOrCreateStripeCustomer = async (userId: string, userEmail: string, stripe: Stripe) => {
  console.log('Checking if user has a Stripe customer ID')
  const supabase = supabaseClient()
  
  const { data: customerData, error: customerError } = await supabase
    .from('stripe_customers')
    .select('customer_id')
    .eq('user_id', userId)
    .single()

  if (customerError || !customerData) {
    console.log('Creating new Stripe customer for user:', userId)
    try {
      const customer = await stripe.customers.create({
        email: userEmail,
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
      
      return customer.id
    } catch (stripeError) {
      console.error('Stripe customer creation error:', stripeError)
      throw new Error(`Failed to create Stripe customer: ${stripeError instanceof Error ? stripeError.message : String(stripeError)}`)
    }
  } else {
    console.log('Found existing Stripe customer:', customerData.customer_id)
    return customerData.customer_id
  }
}

// Create Stripe checkout session for subscription
export const createSubscriptionCheckout = async (
  customerId: string, 
  priceId: string, 
  userId: string, 
  planId: string, 
  siteUrl: string,
  stripe: Stripe
) => {
  console.log('Creating Stripe checkout session with:')
  console.log('- Customer ID:', customerId)
  console.log('- Price ID:', priceId)
  console.log('- Success URL:', `${siteUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`)
  console.log('- Cancel URL:', `${siteUrl}/subscription/cancel`)
  
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
      success_url: `${siteUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/subscription/cancel`,
      metadata: {
        userId: userId,
        planId: planId
      }
    })
    
    console.log('Checkout session created successfully:', session.id)
    console.log('Checkout URL:', session.url)
    
    return session
  } catch (stripeError) {
    console.error('Stripe session creation error:', stripeError)
    throw new Error(`Failed to create checkout session: ${stripeError instanceof Error ? stripeError.message : String(stripeError)}`)
  }
}

// Create one-time payment session for image pack
export const createPayPerImageCheckout = async (
  customerId: string,
  priceId: string,
  userId: string,
  packSize: number,
  siteUrl: string,
  stripe: Stripe
) => {
  console.log('Creating one-time payment session for image pack')
  console.log('- Pack size:', packSize)
  
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
      mode: 'payment',
      success_url: `${siteUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/subscription/cancel`,
      metadata: {
        userId: userId,
        isPayPerImage: 'true',
        imagePackSize: packSize.toString()
      }
    })
    
    console.log('Checkout session created successfully:', session.id)
    console.log('Checkout URL:', session.url)
    
    return session
  } catch (stripeError) {
    console.error('Stripe session creation error:', stripeError)
    throw new Error(`Failed to create checkout session: ${stripeError instanceof Error ? stripeError.message : String(stripeError)}`)
  }
}

// Handle pay-per-image checkout
export const handlePayPerImageCheckout = async (userId: string, packSize: number, stripe: Stripe, siteUrl: string) => {
  console.log('Processing pay-per-image checkout...')
  const supabase = supabaseClient()
  
  try {
    console.log('Fetching user details for userId:', userId)
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      throw new Error('Invalid user ID')
    }
    
    // Create or get Stripe customer
    const customerId = await getOrCreateStripeCustomer(userId, user.email, stripe)
    
    // Create a checkout session
    const priceId = PLAN_PRICE_MAP['payperimage']
    const session = await createPayPerImageCheckout(
      customerId, 
      priceId, 
      userId, 
      packSize, 
      siteUrl, 
      stripe
    )
    
    return { url: session.url }
  } catch (error) {
    console.error('Error in pay-per-image checkout:', error)
    throw error
  }
}

// Handle subscription checkout
export const handleSubscriptionCheckout = async (userId: string, planId: string, stripe: Stripe, siteUrl: string) => {
  console.log('Processing subscription checkout...')
  const supabase = supabaseClient()
  
  try {
    // Get plan details
    console.log('Fetching plan details for planId:', planId)
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError) {
      console.error('Error fetching plan:', planError)
      throw new Error('Invalid plan ID')
    }
    
    if (!plan) {
      console.error('Plan not found for ID:', planId)
      throw new Error('Plan not found')
    }
    
    console.log('Plan found:', JSON.stringify(plan))
    
    // Handle free plan subscription
    if (plan.price === 0) {
      await handleFreePlanSubscription(userId, planId)
      return { 
        success: true, 
        message: 'Free plan activated', 
        redirect: `${siteUrl}/subscription/success?free=true` 
      }
    }
    
    // Get user details
    console.log('Fetching user details for userId:', userId)
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      throw new Error('Invalid user ID')
    }
    
    // Create or get Stripe customer
    const customerId = await getOrCreateStripeCustomer(userId, user.email, stripe)
    
    // Get the plan name in lowercase for mapping
    const planNameLower = plan.name.toLowerCase().replace(/\s+/g, '')
    console.log('Looking up price ID for plan name (normalized):', planNameLower)
    
    // Find the price ID for the plan - use the normalized plan name or fallback to default
    const priceId = PLAN_PRICE_MAP[planNameLower] || PLAN_PRICE_MAP['default']
    console.log('Using price ID:', priceId)
    
    // Create a checkout session
    const session = await createSubscriptionCheckout(
      customerId, 
      priceId, 
      userId, 
      planId, 
      siteUrl, 
      stripe
    )
    
    return { url: session.url }
  } catch (error) {
    console.error('Error in subscription checkout:', error)
    throw error
  }
}
