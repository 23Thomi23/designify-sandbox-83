import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
      const supabase = supabaseClient();

      // Check if user is legacy (not subject to limits)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_legacy_user")
        .eq("id", userId)
        .single();

      if (!profileData?.is_legacy_user) {
        // User is not legacy, check their limits
        const { data: usageData } = await supabase
          .from("image_consumption")
          .select("available_images, used_images")
          .eq("user_id", userId)
          .single();

        if (
          usageData &&
          usageData.used_images >= usageData.available_images
        ) {
          console.log(
            `User ${userId} has reached their limit: ${usageData.used_images}/${usageData.available_images}`,
          );
          return new Response(
            JSON.stringify({
              limitExceeded: true,
              message:
                "You have reached your subscription limit for this period",
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
      }
    }

    // Call adirik/interior-design for image generation
    console.log("Calling Replicate API with prompt:", prompt);

    const replicateResponse = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${REPLICATE_API_KEY}`,
        },
        body: JSON.stringify({
          version:
            "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
          input: {
            image: image,
            prompt: prompt,
            prompt_strength: 0.65, // Setting prompt_strength to 0.65 as requested
          },
        }),
      },
    );

    const prediction = await replicateResponse.json();

    if (prediction.error) {
      console.error("Replicate API error:", prediction.error);
      return new Response(JSON.stringify({ error: prediction.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Poll for the result
    const predictionId = prediction.id;
    let generatedImage = null;

    for (let i = 0; i < 30; i++) {
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${REPLICATE_API_KEY}`,
          },
        },
      );

      const status = await statusResponse.json();

      if (status.status === "succeeded") {
        generatedImage = status.output;
        break;
      } else if (status.status === "failed") {
        console.error("Generation failed:", status.error);
        return new Response(JSON.stringify({ error: status.error }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Wait before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!generatedImage) {
      return new Response(JSON.stringify({ error: "Generation timed out" }), {
        status: 408,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use philz1337x/clarity-upscaler to enhance the image
    console.log("Upscaling generated image");

    const upscalerResponse = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${REPLICATE_API_KEY}`,
        },
        body: JSON.stringify({
          version:
            "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
          input: {
            image: generatedImage,
          },
        }),
      },
    );

    const upscalerPrediction = await upscalerResponse.json();

    if (upscalerPrediction.error) {
      console.error("Upscaler API error:", upscalerPrediction.error);
      // If upscaling fails, return the non-upscaled image instead
      return new Response(JSON.stringify({ output: generatedImage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Poll for the upscaler result
    const upscalerId = upscalerPrediction.id;
    let upscaledImage = null;

    for (let i = 0; i < 30; i++) {
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${upscalerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${REPLICATE_API_KEY}`,
          },
        },
      );

      const status = await statusResponse.json();

      if (status.status === "succeeded") {
        // The clarity-upscaler model returns an array or object of images
        upscaledImage = Array.isArray(status.output)
          ? status.output[0]
          : (typeof status.output === "object"
            ? Object.values(status.output)[0]
            : status.output);
        break;
      } else if (status.status === "failed") {
        console.error("Upscaling failed:", status.error);
        // If upscaling fails, use the original generated image
        upscaledImage = generatedImage;
        break;
      }

      // Wait before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // If upscaled image is not available, use the original generated image
    const finalImage = upscaledImage || generatedImage;

    // If user ID is provided, update usage and log the processing
    if (userId) {
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

      // Log the processing history
      await supabase
        .from("processing_history")
        .insert([{
          user_id: userId,
          original_image: null, // We don't store the original image for privacy
          enhanced_image: finalImage,
          processing_type: "interior_design",
        }]);
    }

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
