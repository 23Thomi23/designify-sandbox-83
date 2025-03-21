import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/components/RoomSelector';
import { STYLE_PROMPTS } from './constants';

export const useImageProcessor = (userId: string, onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);

  const processImage = async (
    selectedImage: File, 
    selectedRoom: Room, 
    selectedStyle: string,
    originalImagePath: string
  ) => {
    setIsLoading(true);
    setProcessingPhase('Checking subscription limits...');
    setProcessingProgress(5);
    setError(null);
    setTransformedImage(null);
    
    try {
      // ENHANCED LIMIT ENFORCEMENT - Client-side check before sending to API
      // Get user profile to check if they're a legacy user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_legacy_user')
        .eq('id', userId)
        .single();
        
      // If not a legacy user, strictly verify the image limit
      if (!profileData?.is_legacy_user) {
        // Double-check the user has available images before proceeding
        const { data: consumption, error: consumptionError } = await supabase
          .from('image_consumption')
          .select('available_images')
          .eq('user_id', userId)
          .single();
          
        if (consumptionError) {
          console.error('Error fetching usage data:', consumptionError);
          setError('Could not verify subscription status. Please try again later.');
          toast.error('Error checking subscription status');
          setIsLoading(false);
          return false;
        }
        
        // Very strict limit enforcement - if user has no available images, prevent processing
        if (!consumption || consumption.available_images <= 0) {
          setError('You have no available images remaining');
          toast.error('No available images left. Please upgrade your plan to continue.');
          setIsLoading(false);
          return false;
        }

        console.log(`User has ${consumption.available_images} images remaining before processing`);
      }

      // Convert the image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });

      setProcessingPhase('Analyzing your space...');
      setProcessingProgress(15);

      // Prepare the prompt
      const roomPrefix = selectedRoom ? `A ${selectedRoom} with ` : '';
      const stylePrompt = STYLE_PROMPTS[selectedStyle as keyof typeof STYLE_PROMPTS];
      const fullPrompt = `${roomPrefix}${stylePrompt} High quality, photorealistic.`;

      setProcessingPhase('Applying design style...');
      setProcessingProgress(25);
      
      console.log('Calling Replicate function with:', { 
        prompt: fullPrompt, 
        imageSize: encodeURI(base64Image).split(',').length 
      });
      
      // Call the Edge Function to process the image
      const response = await supabase.functions.invoke('replicate', {
        body: {
          image: base64Image,
          prompt: fullPrompt,
          userId: userId,
          originalImagePath: originalImagePath
        }
      });

      console.log("Replicate function response:", response);

      // Handle limit exceeded error
      if (response.data && response.data.limitExceeded) {
        setError('You have no available images remaining');
        toast.error('No available images left. Please upgrade your plan to continue.');
        setIsLoading(false);
        return false;
      }

      // Handle other errors
      if (response.error) {
        console.error('Supabase function error:', response.error);
        setError(`Service error: ${response.error.message || 'Failed to process image'}. Please try again later.`);
        toast.error('Failed to transform image');
        setIsLoading(false);
        return false;
      }

      if (response.data && response.data.error) {
        console.error('Replicate API error:', response.data.error);
        setError(`API error: ${response.data.error || 'Failed to process image'}. Please try a different image.`);
        toast.error('Failed to transform image');
        setIsLoading(false);
        return false;
      }

      setProcessingPhase('Enhancing with AI upscaler...');
      setProcessingProgress(75);

      // Check if we received an output
      if (!response.data || !response.data.output) {
        console.error('No output received from API');
        setError('Error: No image was returned from the service. Please try a different image.');
        toast.error('Failed to transform image');
        setIsLoading(false);
        return false;
      }

      // Small delay for UI effect
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress(100);
      
      // Set the transformed image
      setTransformedImage(response.data.output);
      toast.success('Transformation complete!');
      
      // Trigger the callback on success to fetch the updated usage stats
      onSuccess();
      return true;
    } catch (error: any) {
      console.error('Transformation error:', error);
      setError(`Error: ${error?.message || 'An unexpected error occurred'}. Please try again.`);
      toast.error('Failed to transform image');
      setIsLoading(false);
      return false;
    } finally {
      setIsLoading(false);
      setProcessingPhase(null);
      setProcessingProgress(0);
    }
  };

  return {
    isLoading,
    processingPhase,
    processingProgress,
    error,
    transformedImage,
    processImage,
    setTransformedImage
  };
};
