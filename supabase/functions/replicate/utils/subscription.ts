
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

/**
 * Check and initialize subscription plans if they don't exist
 */
export async function ensureSubscriptionPlans(): Promise<void> {
  const supabase = supabaseClient();
  
  // Check if plans already exist
  const { data: existingPlans, error } = await supabase
    .from("subscription_plans")
    .select("name")
    .limit(1);
    
  if (error) {
    console.error("Error checking for subscription plans:", error);
    return;
  }
  
  // If plans already exist, no need to create them
  if (existingPlans && existingPlans.length > 0) {
    return;
  }
  
  // Define the default plans
  const defaultPlans = [
    {
      name: "Free",
      price: 0,
      included_images: 5,
      description: "Free tier with limited images"
    },
    {
      name: "Basic",
      price: 9.99,
      included_images: 20,
      description: "Basic plan for regular users"
    },
    {
      name: "Professional",
      price: 19.99,
      included_images: 50,
      description: "Professional plan for power users"
    },
    {
      name: "Pay Per Image",
      price: 19.99,
      included_images: 25,
      description: "Pay as you go for occasional use"
    }
  ];
  
  // Insert the default plans
  const { error: insertError } = await supabase
    .from("subscription_plans")
    .insert(defaultPlans);
    
  if (insertError) {
    console.error("Error creating subscription plans:", insertError);
  } else {
    console.log("Default subscription plans created successfully");
  }
}
