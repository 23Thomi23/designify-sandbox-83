
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
  
  try {
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
      .maybeSingle();
      
    if (error) {
      // Only throw if it's not a "no rows returned" error
      if (!error.message.includes('no rows')) {
        console.error('Error fetching subscription:', error);
        throw error;
      }
    }
    
    console.log('Subscription found:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchUserSubscription:', error);
    // Don't throw error for "no subscription" - it's a valid state
    if (error instanceof Error && error.message.includes('no rows')) {
      return null;
    }
    throw error;
  }
};

export const fetchAvailablePlans = async (): Promise<SubscriptionPlan[]> => {
  console.log('Fetching available subscription plans');
  
  try {
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
  } catch (error) {
    console.error('Error in fetchAvailablePlans:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  console.log('Cancelling subscription:', subscriptionId);
  
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: {
        subscriptionId
      }
    });
    
    if (error) {
      console.error('Error from Supabase function:', error);
      throw new Error(error.message || 'Failed to cancel subscription');
    }
    
    if (data && data.error) {
      console.error('Error from cancel-subscription function:', data.error);
      throw new Error(data.error || 'Failed to cancel subscription');
    }
    
    console.log('Subscription cancelled successfully');
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    throw error;
  }
};

export const createSubscription = async (planId: string, userId: string): Promise<{ url?: string, success?: boolean }> => {
  console.log('Creating subscription for user:', userId, 'with plan:', planId);
  
  try {
    // For free plans, handle differently
    if (!planId) {
      console.log('No plan ID provided, assuming direct payment link');
      return { success: true };
    }
    
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('price')
      .eq('id', planId)
      .single();
      
    if (plan && plan.price === 0) {
      console.log('Free plan selected, no payment needed');
      // For free plans, we could activate them directly
      return { success: true };
    }
    
    const response = await supabase.functions.invoke('create-checkout', {
      body: {
        planId,
        userId
      }
    });
    
    if (response.error) {
      console.error('Error from Supabase function:', response.error);
      throw new Error(response.error.message || 'Failed to create subscription');
    } else if (response.data?.error) {
      console.error('Error from checkout function:', response.data.error);
      throw new Error(response.data.error || 'Failed to create subscription');
    }
    
    console.log('Subscription creation response:', response.data);
    return {
      url: response.data?.url,
      success: response.data?.success
    };
  } catch (error) {
    console.error('Error in createSubscription:', error);
    throw error;
  }
};
