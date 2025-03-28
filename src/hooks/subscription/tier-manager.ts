
import { supabase } from '@/integrations/supabase/client';

/**
 * Simple method to update a user's subscription tier directly (for demo/testing purposes)
 */
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
    
    // Get the plan's image allocation
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
        // Update existing consumption: Reset available_images to the plan's included_images
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
