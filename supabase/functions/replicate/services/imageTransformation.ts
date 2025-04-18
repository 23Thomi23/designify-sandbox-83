
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

/**
 * Calls the Replicate API to generate an image transformation
 * @param apiKey Replicate API key
 * @param image Base64 encoded image
 * @param prompt Transformation prompt
 * @returns URL of the generated image or null if failed
 */
export async function generateTransformation(
  apiKey: string,
  image: string,
  prompt: string
): Promise<string | null> {
  // Call adirik/interior-design for image generation
  console.log("Calling Replicate API with prompt:", prompt);

  const replicateResponse = await fetch(
    "https://api.replicate.com/v1/predictions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version:
          "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
        input: {
          image: image,
          prompt: prompt,
          prompt_strength: 0.65, // Reverted back to 0.65
        },
      }),
    },
  );

  const prediction = await replicateResponse.json();

  if (prediction.error) {
    console.error("Replicate API error:", prediction.error);
    return null;
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
          "Authorization": `Token ${apiKey}`,
        },
      },
    );

    const status = await statusResponse.json();

    if (status.status === "succeeded") {
      generatedImage = status.output;
      break;
    } else if (status.status === "failed") {
      console.error("Generation failed:", status.error);
      return null;
    }

    // Wait before checking again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return generatedImage;
}
