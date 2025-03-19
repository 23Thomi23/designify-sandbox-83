
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
  console.log('Fetching subscription for user:', userId);
  
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
    
  if (error) {
    // Log the full error for debugging
    console.error('Error fetching subscription:', error);
    
    // PGRST116 is the error code for "no rows returned" which is expected if the user has no subscription
    if (error.code === 'PGRST116') {
      console.log('No active subscription found for user');
      return null;
    }
    
    // For any other error, throw it
    throw error;
  }
  
  console.log('Subscription found:', data);
  return data;
};

export const fetchAvailablePlans = async (): Promise<SubscriptionPlan[]> => {
  console.log('Fetching available subscription plans');
  
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });
    
  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
  
  console.log('Available plans:', data);
  return data || [];
};

export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  console.log('Cancelling subscription:', subscriptionId);
  
  const { data, error } = await supabase.functions.invoke('cancel-subscription', {
    body: {
      subscriptionId
    }
  });
  
  if (error || (data && data.error)) {
    console.error('Error cancelling subscription:', error || data.error);
    throw new Error(error?.message || (data && data.error) || 'Failed to cancel subscription');
  }
  
  console.log('Subscription cancelled successfully');
};

export const createSubscription = async (planId: string, userId: string): Promise<{ url?: string, success?: boolean }> => {
  console.log('Creating subscription for user:', userId, 'with plan:', planId);
  
  const response = await supabase.functions.invoke('create-checkout', {
    body: {
      planId,
      userId
    }
  });
  
  if (response.error) {
    console.error('Error creating subscription:', response.error);
    throw new Error(response.error);
  } else if (response.data?.error) {
    console.error('Error from checkout function:', response.data.error);
    throw new Error(response.data.error);
  }
  
  console.log('Subscription creation response:', response.data);
  return {
    url: response.data?.url,
    success: response.data?.success
  };
};
