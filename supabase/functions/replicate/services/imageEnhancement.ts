
/**
 * Enhances an image using the clarity-upscaler model
 * @param apiKey Replicate API key
 * @param imageUrl URL of the image to enhance
 * @returns URL of the enhanced image or the original if enhancement fails
 */
export async function enhanceWithUpscaler(
  apiKey: string,
  imageUrl: string
): Promise<string> {
  // Use philz1337x/clarity-upscaler to enhance the image
  console.log("Upscaling generated image");

  const upscalerResponse = await fetch(
    "https://api.replicate.com/v1/predictions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version:
          "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageUrl,
        },
      }),
    },
  );

  const upscalerPrediction = await upscalerResponse.json();

  if (upscalerPrediction.error) {
    console.error("Upscaler API error:", upscalerPrediction.error);
    // If upscaling fails, return the non-upscaled image
    return imageUrl;
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
          "Authorization": `Token ${apiKey}`,
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
      return imageUrl;
    }

    // Wait before checking again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Return the upscaled image if available, otherwise the original image
  return upscaledImage || imageUrl;
}
