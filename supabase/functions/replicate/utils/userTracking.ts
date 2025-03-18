
import { supabaseClient } from "../../_shared/supabase-client.ts";

/**
 * Updates user's image usage count
 * @param userId The user ID to update usage for
 */
export async function updateUserUsage(userId: string): Promise<void> {
  const supabase = supabaseClient();

  // Check if user is not legacy before incrementing usage
  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_legacy_user")
    .eq("id", userId)
    .single();

  if (!profileData?.is_legacy_user) {
    // Increment used images
    await supabase.rpc("increment_image_usage", { user_id: userId });
  }
}

/**
 * Logs the image processing to history
 * @param userId The user ID to log processing for
 * @param imageUrl URL of the processed image
 */
export async function logProcessing(userId: string, imageUrl: string): Promise<void> {
  const supabase = supabaseClient();
  
  // Log the processing history
  await supabase
    .from("processing_history")
    .insert([{
      user_id: userId,
      original_image: null, // We don't store the original image for privacy
      enhanced_image: imageUrl,
      processing_type: "interior_design",
    }]);
}
