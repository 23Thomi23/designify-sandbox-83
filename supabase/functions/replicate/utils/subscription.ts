
import { supabaseClient } from "../../_shared/supabase-client.ts";

/**
 * Checks if a user has reached their subscription limit
 * @param userId The user ID to check limits for
 * @returns boolean True if limit exceeded, false otherwise
 */
export async function checkSubscriptionLimits(userId: string): Promise<boolean> {
  const supabase = supabaseClient();

  // Check if user is legacy (not subject to limits)
  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_legacy_user")
    .eq("id", userId)
    .single();

  if (profileData?.is_legacy_user) {
    return false; // Legacy users are not limited
  }

  // Check user's image consumption limits
  const { data: usageData } = await supabase
    .from("image_consumption")
    .select("available_images, used_images")
    .eq("user_id", userId)
    .single();

  if (usageData && usageData.used_images >= usageData.available_images) {
    console.log(
      `User ${userId} has reached their limit: ${usageData.used_images}/${usageData.available_images}`,
    );
    return true; // Limit exceeded
  }

  return false; // User has available images
}
