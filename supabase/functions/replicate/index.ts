
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { checkSubscriptionLimits, ensureSubscriptionPlans } from "./utils/subscription.ts";
import { generateTransformation } from "./services/imageTransformation.ts";
import { enhanceWithUpscaler } from "./services/imageEnhancement.ts";
import { updateUserUsage, logProcessing } from "./utils/userTracking.ts";

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

    const { image, prompt, userId } = await req.json();

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

    // Check subscription limits if userId is provided
    if (userId) {
      const limitExceeded = await checkSubscriptionLimits(userId);
      if (limitExceeded) {
        return new Response(
          JSON.stringify({
            limitExceeded: true,
            message:
              "You have reached your subscription limit for this period",
          }),
          {
            status: 403, // Change to a clearer status code for limit exceeded
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      // If no userId is provided, we should not process the image
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
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

    // Update user usage and log processing
    await updateUserUsage(userId);
    await logProcessing(userId, finalImage);

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
