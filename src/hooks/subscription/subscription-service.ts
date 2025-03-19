
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
