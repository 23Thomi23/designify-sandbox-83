
import { supabase } from '@/integrations/supabase/client';
import { Subscription, SubscriptionPlan } from './types';

/**
 * Fetch the user's active subscription
 */
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

/**
 * Fetch all available subscription plans
 */
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
