
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
    selectedStyle: string
  ) => {
    setIsLoading(true);
    setProcessingPhase('Analyzing your space...');
    setProcessingProgress(10);
    setError(null);
    setTransformedImage(null);
    
    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });

      const roomPrefix = selectedRoom ? `A ${selectedRoom} with ` : '';
      const stylePrompt = STYLE_PROMPTS[selectedStyle as keyof typeof STYLE_PROMPTS];
      const fullPrompt = `${roomPrefix}${stylePrompt} High quality, photorealistic.`;

      setProcessingPhase('Applying design style...');
      setProcessingProgress(25);
      
      console.log('Calling Replicate function with:', { 
        prompt: fullPrompt, 
        imageSize: encodeURI(base64Image).split(',').length 
      });
      
      const response = await supabase.functions.invoke('replicate', {
        body: {
          image: base64Image,
          prompt: fullPrompt,
          userId: userId
        }
      });

      console.log("Replicate function response:", response);

      if (response.data && response.data.limitExceeded) {
        setError('You have reached your subscription limit');
        toast.error('Subscription limit reached. Please upgrade your plan to continue.');
        return false;
      }

      if (response.error) {
        console.error('Supabase function error:', response.error);
        setError(`Service error: ${response.error.message || 'Failed to process image'}. Please try again later.`);
        toast.error('Failed to transform image');
        return false;
      }

      if (response.data && response.data.error) {
        console.error('Replicate API error:', response.data.error);
        setError(`API error: ${response.data.error || 'Failed to process image'}. Please try a different image.`);
        toast.error('Failed to transform image');
        return false;
      }

      setProcessingPhase('Enhancing with AI upscaler...');
      setProcessingProgress(75);

      if (!response.data || !response.data.output) {
        console.error('No output received from API');
        setError('Error: No image was returned from the service. Please try a different image.');
        toast.error('Failed to transform image');
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress(100);
      
      setTransformedImage(response.data.output);
      toast.success('Transformation complete with enhanced clarity!');
      
      // Trigger the callback on success
      onSuccess();
      return true;
    } catch (error: any) {
      console.error('Transformation error:', error);
      setError(`Error: ${error?.message || 'An unexpected error occurred'}. Please try again.`);
      toast.error('Failed to transform image');
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
