
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
 * Uploads an image to Supabase storage and returns the public URL
 * @param userId The user ID who owns the image
 * @param imageUrl The temporary image URL to download and upload to storage
 * @returns The permanent storage URL
 */
async function uploadImageToStorage(userId: string, imageUrl: string): Promise<string> {
  try {
    const supabase = supabaseClient();
    
    // Download the image from the temporary URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const fileName = `${Date.now()}.webp`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('enhanced_images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/webp',
        upsert: false
      });
    
    if (error) {
      console.error("Error uploading to storage:", error);
      return imageUrl; // Fall back to the original URL if storage fails
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('enhanced_images')
      .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error in image upload process:", error);
    return imageUrl; // Fall back to the original URL if anything fails
  }
}

/**
 * Logs the image processing to history
 * @param userId The user ID to log processing for
 * @param imageUrl URL of the processed image
 */
export async function logProcessing(userId: string, imageUrl: string): Promise<void> {
  const supabase = supabaseClient();
  
  // Upload the image to permanent storage
  const permanentImageUrl = await uploadImageToStorage(userId, imageUrl);
  
  // Log the processing history
  await supabase
    .from("processing_history")
    .insert([{
      user_id: userId,
      original_image: null, // We don't store the original image for privacy
      enhanced_image: permanentImageUrl,
      processing_type: "interior_design",
    }]);
}
