
/**
 * Updates the user's image consumption after a successful transformation
 * @param supabaseClient Supabase client instance with proper permissions
 * @param userId User ID to update usage for
 * @returns True if successful, false if error or limit exceeded
 */
export async function updateUserUsage(supabaseClient: any, userId: string): Promise<boolean> {
  try {
    // First get the user's profile to check if they're a legacy user
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_legacy_user')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      return false;
    }
    
    // Legacy users don't have consumption limits
    if (profileData?.is_legacy_user) {
      console.log("Legacy user detected - no consumption limits applied");
      return true;
    }
    
    // Get current image consumption
    const { data: consumption, error: consumptionError } = await supabaseClient
      .from('image_consumption')
      .select('available_images, used_images')
      .eq('user_id', userId)
      .single();
      
    if (consumptionError) {
      console.error("Error getting image consumption:", consumptionError);
      return false;
    }

    // STRICT CHECK: Ensure user has available images before proceeding
    if (!consumption || consumption.available_images <= 0) {
      console.error("User has no available images left");
      return false;
    }
    
    // Use database functions to safely decrement available images and increment used images
    const { error: updateError } = await supabaseClient.rpc('decrement_available_images', { user_id: userId });
    if (updateError) {
      console.error("Error decreasing available images:", updateError);
      return false;
    }
    
    const { error: incrementError } = await supabaseClient.rpc('increment_used_images', { user_id: userId });
    if (incrementError) {
      console.error("Error incrementing used images:", incrementError);
      // We've already decremented available, so log but continue
      console.log("Warning: Available images decreased but used count not incremented");
    }
    
    console.log(`Successfully updated usage for user ${userId}. New available: ${consumption.available_images - 1}, Used: ${consumption.used_images + 1}`);
    return true;
  } catch (error) {
    console.error("Unexpected error updating user consumption:", error);
    return false;
  }
}

/**
 * Checks if a user has available images to process
 * @param supabaseClient Supabase client instance with proper permissions
 * @param userId User ID to check
 * @returns True if user can process images, false if limit reached or error
 */
export async function checkUserLimit(supabaseClient: any, userId: string): Promise<boolean> {
  try {
    // Check if user is a legacy user first
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_legacy_user')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      return false;
    }
    
    // Legacy users don't have limits
    if (profileData?.is_legacy_user) {
      return true;
    }
    
    // Get user's consumption data
    const { data: consumption, error: consumptionError } = await supabaseClient
      .from('image_consumption')
      .select('available_images')
      .eq('user_id', userId)
      .single();
      
    if (consumptionError) {
      console.error("Error checking user limit:", consumptionError);
      return false;
    }
    
    // STRICT CHECK: Return false if user has no available images or if no consumption record found
    return consumption && consumption.available_images > 0;
  } catch (error) {
    console.error("Unexpected error checking user limit:", error);
    return false;
  }
}

/**
 * Logs the processing of an image
 * This is a placeholder function that can be expanded later
 */
export async function logProcessing(userId: string, transformedImage: string, originalImagePath?: string): Promise<void> {
  console.log(`Logging processing for user ${userId}`);
  // Implementation can be added later if needed
}
