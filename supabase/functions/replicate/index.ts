
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { checkSubscriptionLimits, ensureSubscriptionPlans } from "./utils/subscription.ts";
import { generateTransformation } from "./services/imageTransformation.ts";
import { enhanceWithUpscaler } from "./services/imageEnhancement.ts";
import { updateUserUsage, checkUserLimit, logProcessing } from "./utils/userTracking.ts";
import { supabaseClient } from "../_shared/supabase-client.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Ensure subscription plans exist
    await ensureSubscriptionPlans();

    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

    if (!REPLICATE_API_KEY) {
      console.error("REPLICATE_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Missing Replicate API key" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { image, prompt, userId, originalImagePath } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: "Missing image" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check authentication
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // STRICT CHECK #1: Using supabaseClient to directly check if the user has available images
    const supabase = supabaseClient();
    const canProcess = await checkUserLimit(supabase, userId);
    if (!canProcess) {
      console.log(`User ${userId} has no available images. Rejecting request.`);
      return new Response(
        JSON.stringify({
          limitExceeded: true,
          message: "You have reached your subscription limit for this period",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // STRICT CHECK #2: Double-check subscription limits
    const limitExceeded = await checkSubscriptionLimits(userId);
    if (limitExceeded) {
      console.log(`User ${userId} has exceeded their subscription limit. Rejecting request.`);
      return new Response(
        JSON.stringify({
          limitExceeded: true,
          message: "You have reached your subscription limit for this period",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate the initial transformation
    const generatedImage = await generateTransformation(REPLICATE_API_KEY, image, prompt);
    if (!generatedImage) {
      return new Response(JSON.stringify({ error: "Generation failed or timed out" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enhance the image with upscaler
    const finalImage = await enhanceWithUpscaler(REPLICATE_API_KEY, generatedImage);

    // Update user usage and log processing - IMPORTANT: this increments the used_images count
    const usageUpdated = await updateUserUsage(supabase, userId);
    if (!usageUpdated) {
      console.error(`Failed to update usage for user ${userId}. This may indicate a limit issue.`);
      return new Response(
        JSON.stringify({ 
          error: "Failed to update usage. You may have reached your subscription limit."
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    await logProcessing(userId, finalImage, originalImagePath);

    // Return the final image
    return new Response(JSON.stringify({ output: finalImage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
