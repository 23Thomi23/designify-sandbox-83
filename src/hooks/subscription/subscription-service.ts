
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  included_images: number;
  description: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  subscription_id: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  status: string;
  subscription_plans: SubscriptionPlan;
}

export const fetchUserSubscription = async (userId: string): Promise<Subscription | null> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      subscription_plans:subscription_id (
        id,
        name,
        price,
        included_images,
        description
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching subscription:', error);
    throw error;
  }
  
  return data;
};

export const fetchAvailablePlans = async (): Promise<SubscriptionPlan[]> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });
    
  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
  
  return data || [];
};

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

export const createSubscription = async (planId: string, userId: string): Promise<{ url?: string, success?: boolean }> => {
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

// Simple method to update a user's subscription tier directly (for demo/testing purposes)
export const updateSubscriptionTier = async (userId: string, planId: string): Promise<void> => {
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
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('included_images')
      .eq('id', planId)
      .single();
      
    if (planData) {
      // Update or create image consumption record
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
    }
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    throw error;
  }
};
