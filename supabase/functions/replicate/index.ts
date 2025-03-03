
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
      throw new Error('REPLICATE_API_KEY is not set')
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

    // Start the initial transformation
    try {
      const transformedImage = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            image: image,
            prompt: prompt,
            guidance_scale: 7.5,
            negative_prompt: "lowres, watermark, banner, logo, watermark, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, upholstered walls, fabric walls, plush walls, mirror, mirrored",
            prompt_strength: 0.8,
            num_inference_steps: 25
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

      // Now upscale the transformed image using Clarity Upscaler
      const upscaledImage = await replicate.run(
        "philz1337x/clarity-upscaler:0e0f77efdf4a2fee77d2f2c0414dff763fc65fe2783786a12cc4c03a81adc79d",
        {
          input: {
            image: imageToUpscale,
            upscale: 2,
            prompt: "HD detailed photograph with crisp details, sharp, high quality"
          }
        }
      );

      console.log('Upscaling completed successfully')

      return new Response(JSON.stringify({ output: upscaledImage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    } catch (transformError) {
      console.error('Error during transformation or upscaling:', transformError)
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
