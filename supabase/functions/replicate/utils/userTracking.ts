
import { supabaseClient } from '../../_shared/supabase-client.ts';

/**
 * Updates the user's image consumption count after successful processing
 */
export async function updateUserUsage(userId: string): Promise<void> {
  const supabase = supabaseClient();
  
  // Get user profile to check if they're a legacy user (legacy users don't count against limits)
  const { data: profileData } = await supabase
    .from('profiles')
    .select('is_legacy_user')
    .eq('id', userId)
    .single();
    
  // Skip usage update for legacy users
  if (profileData?.is_legacy_user) {
    console.log("Skipping usage update for legacy user:", userId);
    return;
  }
  
  console.log("Updating usage count for user:", userId);
  
  // Update the user's consumption record - increment used_images by 1
  const { data, error } = await supabase
    .from('image_consumption')
    .update({ 
      used_images: supabase.sql`used_images + 1`,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select();
  
  if (error) {
    console.error("Error updating user usage:", error);
    throw new Error(`Failed to update user usage: ${error.message}`);
  }
  
  console.log("Updated usage for user:", userId, "New count:", data?.[0]?.used_images);
}

/**
 * Logs the successful processing of an image
 */
export async function logProcessing(userId: string, imageUrl: string): Promise<void> {
  if (!userId) {
    console.error("Cannot log processing: Missing userId");
    return;
  }
  
  const supabase = supabaseClient();
  
  try {
    // First, save the original image URL from storage if provided
    let originalImage = null;
    
    // Insert a record into the processing_history table
    const { error } = await supabase
      .from('processing_history')
      .insert({
        user_id: userId,
        original_image: originalImage,
        enhanced_image: imageUrl,
        processing_type: 'interior_design', 
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error logging processing history:", error);
      // Don't throw here, just log the error - we don't want to fail the whole process
    } else {
      console.log("Successfully logged processing history for user:", userId);
    }
  } catch (error) {
    console.error("Exception when logging processing history:", error);
    // Don't throw, just log the error
  }
}
