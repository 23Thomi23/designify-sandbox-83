
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"
import { supabaseClient } from "../_shared/supabase-client.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (!REPLICATE_API_KEY) {
      console.error('REPLICATE_API_KEY is not set')
      return new Response(JSON.stringify({ error: 'REPLICATE_API_KEY is not set' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      })
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const { image, prompt, userId } = await req.json()

    if (!image) {
      console.error('Missing required field: image is required')
      return new Response(JSON.stringify({ error: 'Missing required field: image is required' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }

    if (!prompt) {
      console.error('Missing required field: prompt is required')
      return new Response(JSON.stringify({ error: 'Missing required field: prompt is required' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      })
    }

    // Check user subscription if userId is provided
    // Only apply limits to new users; existing users continue without restrictions
    if (userId) {
      try {
        const supabase = supabaseClient();
        
        // Check if user is a new user (registered after subscription system implementation)
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('created_at, is_legacy_user')
          .eq('id', userId)
          .single();
          
        if (userError) {
          console.error('Error fetching user:', userError);
        } else if (user && !user.is_legacy_user) {
          // Only apply subscription limits to non-legacy users
          const { data: usage, error: usageError } = await supabase
            .from('image_consumption')
            .select('available_images, used_images')
            .eq('user_id', userId)
            .single();
            
          if (usageError) {
            console.error('Error fetching user usage:', usageError);
          } else if (usage && usage.used_images >= usage.available_images) {
            return new Response(JSON.stringify({ 
              error: 'Image limit exceeded', 
              message: 'You have reached your subscription limit. Please upgrade your plan to process more images.',
              limitExceeded: true 
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 403
            });
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        // Continue processing if there's an error checking the subscription
        // This ensures existing functionality isn't disrupted
      }
    }

    console.log('Starting image transformation with prompt:', prompt)

    // Using the adirik/interior-design model
    try {
      const transformedImage = await replicate.run(
        "adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
        {
          input: {
            image: image,
            prompt: prompt,
            guidance_scale: 5.0,
            negative_prompt: "lowres, watermark, banner, logo, watermark, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, upholstered walls, fabric walls, plush walls, mirror, mirrored",
            prompt_strength: 0.65,
            num_inference_steps: 20
          }
        }
      );

      console.log('Initial transformation completed, starting upscaling')

      // If transformedImage is not a URL string or array, handle accordingly
      let imageToUpscale;

      if (Array.isArray(transformedImage) && transformedImage.length > 0) {
        imageToUpscale = transformedImage[0];
        console.log('Using first image from array for upscaling')
      } else if (typeof transformedImage === 'string') {
        imageToUpscale = transformedImage;
        console.log('Using string URL for upscaling')
      } else {
        console.error('Unexpected format returned from transformation:', typeof transformedImage)
        return new Response(JSON.stringify({ 
          error: 'Initial transformation returned unexpected format',
          details: transformedImage 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        })
      }

      // Now upscale the transformed image using philz1337x/clarity-upscaler model
      try {
        const upscaledImage = await replicate.run(
          "philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
          {
            input: {
              image: imageToUpscale
            }
          }
        );

        console.log('Upscaling completed successfully')
        
        // Handle the output based on its format
        let finalImage;
        
        if (Array.isArray(upscaledImage) && upscaledImage.length > 0) {
          finalImage = upscaledImage[0];
          console.log('Using first image from upscaled array')
        } else if (typeof upscaledImage === 'string') {
          finalImage = upscaledImage;
          console.log('Using string URL from upscaler')
        } else if (upscaledImage && typeof upscaledImage === 'object') {
          // If it's an object with numbered keys (as shown in the example)
          finalImage = upscaledImage[0] || Object.values(upscaledImage)[0];
          console.log('Using first image from upscaled object')
        } else {
          console.error('Unexpected format returned from upscaler:', typeof upscaledImage)
          // Fall back to the original transformed image
          finalImage = imageToUpscale;
          console.log('Falling back to original transformed image due to unexpected upscaler format')
        }

        // Update image usage count for non-legacy users
        if (userId) {
          try {
            const supabase = supabaseClient();
            
            // Check if user is a new user (registered after subscription system implementation)
            const { data: user, error: userError } = await supabase
              .from('profiles')
              .select('is_legacy_user')
              .eq('id', userId)
              .single();
              
            if (userError) {
              console.error('Error fetching user:', userError);
            } else if (user && !user.is_legacy_user) {
              // Update usage count for non-legacy users
              const { error: updateError } = await supabase.rpc('increment_image_usage', { user_id: userId });
              
              if (updateError) {
                console.error('Error updating image usage:', updateError);
              }
              
              // Record processing history
              const { error: historyError } = await supabase
                .from('processing_history')
                .insert([{ 
                  user_id: userId, 
                  original_image: image.substring(0, 255), // Limit string length to avoid DB issues
                  enhanced_image: finalImage.substring(0, 255),
                  processing_type: 'interior-design'
                }]);
                
              if (historyError) {
                console.error('Error recording processing history:', historyError);
              }
            }
          } catch (error) {
            console.error('Error updating usage statistics:', error);
            // Continue processing if there's an error updating stats
          }
        }

        return new Response(JSON.stringify({ output: finalImage }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      } catch (upscaleError) {
        console.error('Error during upscaling:', upscaleError)
        
        // If upscaling fails, return the original transformed image as a fallback
        console.log('Returning original transformed image without upscaling')
        return new Response(JSON.stringify({ output: imageToUpscale, warning: "Upscaling failed, returning original transformed image" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }
    } catch (transformError) {
      console.error('Error during transformation:', transformError)
      return new Response(JSON.stringify({ 
        error: 'Error processing image', 
        details: transformError.message || 'Unknown error'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      })
    }
  } catch (error) {
    console.error('Error in replicate function:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    })
  }
})
