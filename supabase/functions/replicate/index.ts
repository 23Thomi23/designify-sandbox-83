
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

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

    const { image, prompt } = await req.json()

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

    console.log('Starting image transformation with prompt:', prompt)

    // Verify model exists before attempting to use it
    try {
      // Using stability-ai/sdxl which is a reliable model
      const transformedImage = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: prompt,
            image: image,
            strength: 0.53,
            guidance_scale: 7.5,
            num_inference_steps: 25,
            negative_prompt: "lowres, watermark, banner, logo, watermark, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, upholstered walls, fabric walls, plush walls"
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

      // Now upscale the transformed image using a reliable upscaler model
      try {
        const upscaledImage = await replicate.run(
          "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
          {
            input: {
              image: imageToUpscale,
              scale: 2,
              face_enhance: true
            }
          }
        );

        console.log('Upscaling completed successfully')

        return new Response(JSON.stringify({ output: upscaledImage }), {
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
