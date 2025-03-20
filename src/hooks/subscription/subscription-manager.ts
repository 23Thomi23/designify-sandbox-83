
import { supabase } from '@/integrations/supabase/client';

/**
 * Cancel an existing subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('cancel-subscription', {
    body: {
      subscriptionId
    }
  });
  
  if (error || (data && data.error)) {
    console.error('Error cancelling subscription:', error || data.error);
    throw new Error(error?.message || (data && data.error) || 'Failed to cancel subscription');
  }
};

/**
 * Create a new subscription
 */
export const createSubscription = async (planId: string, userId: string): Promise<{ url?: string, success?: boolean }> => {
  // For the free plan, handle it directly without going through Stripe
  const { data: planData } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();
    
  if (planData && planData.price === 0) {
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
            available_images: planData.included_images,
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
            available_images: planData.included_images,
            used_images: 0
          });
          
        if (error) throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error setting up free subscription:', error);
      throw error;
    }
  }
  
  // For paid plans, use the Edge Function to create a Stripe checkout
  const response = await supabase.functions.invoke('create-checkout', {
    body: {
      planId,
      userId
    }
  });
  
  if (response.error) {
    throw new Error(response.error);
  } else if (response.data?.error) {
    throw new Error(response.data.error);
  }
  
  return {
    url: response.data?.url,
    success: response.data?.success
  };
};
