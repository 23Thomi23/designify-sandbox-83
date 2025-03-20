
import { supabaseClient } from '../../_shared/supabase-client.ts';

/**
 * Checks if a user has reached their subscription limit
 * @returns true if the limit is exceeded, false otherwise
 */
export async function checkSubscriptionLimits(userId: string): Promise<boolean> {
  console.log(`Checking subscription limits for user: ${userId}`);
  const supabase = supabaseClient();
  
  try {
    // First check if the user is a legacy user (not subject to limits)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_legacy_user')
      .eq('id', userId)
      .single();
      
    // Legacy users are not subject to limits
    if (profileData?.is_legacy_user) {
      console.log(`User ${userId} is a legacy user, no limits apply`);
      return false;
    }
    
    // Check the user's image consumption
    const { data: consumptionData, error: consumptionError } = await supabase
      .from('image_consumption')
      .select('available_images, used_images')
      .eq('user_id', userId)
      .single();
      
    if (consumptionError) {
      // If the user doesn't have a consumption record yet, create one for the free tier
      if (consumptionError.code === 'PGRST116') {
        // Get the free tier limit
        const { data: freeTier } = await supabase
          .from('subscription_plans')
          .select('included_images')
          .eq('name', 'Free')
          .single();
          
        const freeLimit = freeTier?.included_images || 5;
        
        // Create a consumption record for the free tier
        const { error: insertError } = await supabase
          .from('image_consumption')
          .insert({
            user_id: userId,
            available_images: freeLimit,
            used_images: 0
          });
          
        if (insertError) {
          console.error(`Error creating consumption record for user ${userId}:`, insertError);
          // Default to blocking if we can't verify
          return true;
        }
        
        // New user with 0 used images, hasn't reached limit yet
        console.log(`New user ${userId} created with ${freeLimit} available images`);
        return false;
      }
      
      console.error(`Error fetching consumption data for user ${userId}:`, consumptionError);
      // Default to blocking if we can't verify
      return true;
    }
    
    // Strictly check if the user has reached their limit
    if (consumptionData.used_images >= consumptionData.available_images) {
      console.log(`User ${userId} has reached their limit: ${consumptionData.used_images}/${consumptionData.available_images}`);
      return true;
    }
    
    console.log(`User ${userId} has ${consumptionData.available_images - consumptionData.used_images} images remaining`);
    return false;
  } catch (error) {
    console.error(`Error checking subscription limits for user ${userId}:`, error);
    // Default to blocking if we can't verify
    return true;
  }
}

/**
 * Ensures that the subscription plans exist in the database
 */
export async function ensureSubscriptionPlans(): Promise<void> {
  const supabase = supabaseClient();
  
  // Check if we have subscription plans
  const { data: plans, error } = await supabase
    .from('subscription_plans')
    .select('id')
    .limit(1);
    
  if (error) {
    console.error('Error checking subscription plans:', error);
    return;
  }
  
  // If we already have plans, we're good
  if (plans && plans.length > 0) {
    return;
  }
  
  // Otherwise, create the default plans
  const defaultPlans = [
    {
      name: 'Free',
      description: 'Basic access with limited transformations',
      price: 0,
      included_images: 5,
      features: ['5 image transformations per month', 'Basic AI enhancement', 'Standard resolution output']
    },
    {
      name: 'Pro',
      description: 'Professional access with more transformations',
      price: 9.99,
      included_images: 50,
      features: ['50 image transformations per month', 'Advanced AI enhancement', 'High resolution output', 'Priority support']
    },
    {
      name: 'Business',
      description: 'Enterprise-grade access with unlimited transformations',
      price: 29.99,
      included_images: 200,
      features: ['200 image transformations per month', 'Premium AI enhancement', 'Ultra high resolution output', 'Dedicated support', 'Commercial usage rights']
    }
  ];
  
  const { error: insertError } = await supabase
    .from('subscription_plans')
    .insert(defaultPlans);
    
  if (insertError) {
    console.error('Error creating default subscription plans:', insertError);
  }
}
