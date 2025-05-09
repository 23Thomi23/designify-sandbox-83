
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabaseClient } from "../_shared/supabase-client.ts"
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set')
      return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY is not set' }), {
        status: 500
      })
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return new Response(JSON.stringify({ error: 'STRIPE_WEBHOOK_SECRET is not set' }), {
        status: 500
      })
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400
      })
    }

    const body = await req.text()
    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(JSON.stringify({ error: `Webhook signature verification failed` }), {
        status: 400
      })
    }

    const supabase = supabaseClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.metadata?.userId && session.metadata?.planId) {
          console.log(`Checkout completed for user ${session.metadata.userId}, plan ${session.metadata.planId}`)
          
          // Update user subscription
          const { data: plan, error: planError } = await supabase
            .from('subscription_plans')
            .select('included_images, name')
            .eq('id', session.metadata.planId)
            .single()
            
          if (planError) {
            console.error('Error fetching plan:', planError)
            break
          }

          // Update or create user subscription
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: session.metadata.userId,
              subscription_id: session.metadata.planId,
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              status: 'active',
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              cancel_at_period_end: false
            })
            
          if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError)
            break
          }

          console.log(`Subscription updated for user ${session.metadata.userId}, plan: ${plan.name} with ${plan.included_images} images`)

          // Update user's available images and reset used images count
          const { error: usageError } = await supabase
            .from('image_consumption')
            .upsert({
              user_id: session.metadata.userId,
              available_images: plan.included_images,
              used_images: 0,
              updated_at: new Date().toISOString()
            })
            
          if (usageError) {
            console.error('Error updating image consumption:', usageError)
          } else {
            console.log(`Usage reset for user ${session.metadata.userId}: ${plan.included_images} available, 0 used`)
          }
        } else if (session.mode === 'payment' && session.metadata?.userId && session.metadata?.imagePackSize) {
          // Handle one-time payment for image pack
          console.log(`One-time payment completed for user ${session.metadata.userId}, ${session.metadata.imagePackSize} images`)
          
          // Get current user consumption
          const { data: currentConsumption, error: consumptionError } = await supabase
            .from('image_consumption')
            .select('available_images, used_images')
            .eq('user_id', session.metadata.userId)
            .single()
            
          if (consumptionError && consumptionError.code !== 'PGRST116') {
            console.error('Error fetching consumption data:', consumptionError)
            break
          }
          
          const packSize = parseInt(session.metadata.imagePackSize)
          const currentAvailable = currentConsumption?.available_images || 0
          const currentUsed = currentConsumption?.used_images || 0
          
          // Update with additional images from pack
          const { error: updateError } = await supabase
            .from('image_consumption')
            .upsert({
              user_id: session.metadata.userId,
              available_images: currentAvailable + packSize,
              used_images: currentUsed,
              updated_at: new Date().toISOString()
            })
            
          if (updateError) {
            console.error('Error updating image consumption for pay-per-image:', updateError)
          } else {
            console.log(`Added ${packSize} images to user ${session.metadata.userId}, new total: ${currentAvailable + packSize}`)
          }
        }
        break
      }
      
      case 'invoice.payment_succeeded': {
        // For subscription renewals
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          // Get subscription to find associated user
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          if (subscription.metadata?.userId && subscription.metadata?.planId) {
            console.log(`Payment succeeded for subscription ${invoice.subscription}, user ${subscription.metadata.userId}`)
            
            // Get plan details
            const { data: plan, error: planError } = await supabase
              .from('subscription_plans')
              .select('included_images, name')
              .eq('id', subscription.metadata.planId)
              .single()
              
            if (planError) {
              console.error('Error fetching plan:', planError)
              break
            }
            
            console.log(`Renewal for plan: ${plan.name} with ${plan.included_images} images`)
            
            // Reset available images for the new billing period
            const { error: usageError } = await supabase
              .from('image_consumption')
              .upsert({
                user_id: subscription.metadata.userId,
                available_images: plan.included_images,
                used_images: 0,
                updated_at: new Date().toISOString()
              })
              
            if (usageError) {
              console.error('Error resetting image consumption:', usageError)
            } else {
              console.log(`Usage reset for renewal: ${plan.included_images} images available, 0 used`)
            }
            
            // Update subscription period
            const { error: subscriptionError } = await supabase
              .from('user_subscriptions')
              .update({
                status: 'active',
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('stripe_subscription_id', invoice.subscription)
              
            if (subscriptionError) {
              console.error('Error updating subscription period:', subscriptionError)
            }
          }
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        if (subscription.metadata?.userId) {
          console.log(`Subscription ${subscription.id} updated for user ${subscription.metadata.userId}`)
          
          // Update subscription status
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .update({
              status: subscription.status,
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)
            
          if (subscriptionError) {
            console.error('Error updating subscription status:', subscriptionError)
          }
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`Subscription ${subscription.id} cancelled`)
        
        // Cancel subscription
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)
          
        if (subscriptionError) {
          console.error('Error cancelling subscription:', subscriptionError)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200
    })
  } catch (error) {
    console.error('Error in stripe-webhook function:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error' 
    }), {
      status: 500
    })
  }
})
