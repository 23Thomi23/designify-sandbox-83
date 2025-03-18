
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/components/RoomSelector';
import { Style } from '@/components/StyleSelector';

const STYLE_PROMPTS = {
  minimalista: "A minimalist style with clean lines, functional furniture, and soft neutral tones.",
  moderno: "A modern style with clean lines, functional furniture, and soft neutral tones.",
  contemporaneo: "A contemporary style with clean lines, functional furniture, and soft neutral tones.",
  rustico: "A rustic style with clean lines, functional furniture, and soft neutral tones.",
  industrial: "An industrial style with clean lines, functional furniture, and soft neutral tones."
};

interface UseImageTransformationProps {
  userId: string;
}

export const useImageTransformation = ({ userId }: UseImageTransformationProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('moderno');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<{
    usedImages: number;
    availableImages: number;
    remainingImages: number;
  } | null>(null);

  // Fetch user's subscription and usage data on component mount
  useEffect(() => {
    if (userId) {
      fetchUsageData();
    }
  }, [userId]);

  const fetchUsageData = async () => {
    try {
      // Fetch user's image consumption data
      const { data: consumptionData, error: consumptionError } = await supabase
        .from('image_consumption')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (consumptionError && consumptionError.code !== 'PGRST116') {
        console.error('Error fetching usage data:', consumptionError);
        return;
      }
      
      // Get user profile to check if they're a legacy user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_legacy_user')
        .eq('id', userId)
        .single();
        
      // Legacy users are not subject to limits
      if (profileData?.is_legacy_user) {
        return;
      }
      
      if (consumptionData) {
        const usedImages = consumptionData.used_images;
        const availableImages = consumptionData.available_images;
        const remainingImages = Math.max(0, availableImages - usedImages);
        
        setUsageStats({
          usedImages,
          availableImages,
          remainingImages
        });
        
        // If user has very few images left, show a warning
        if (remainingImages <= 2 && remainingImages > 0) {
          toast.warning(`You have only ${remainingImages} image${remainingImages === 1 ? '' : 's'} left in your plan.`);
        }
      } else {
        // Create a default consumption record for new users (free tier - 5 images)
        const { data: subscriptionData } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'Free')
          .single();
          
        const defaultLimit = subscriptionData?.included_images || 5;
        
        const { data: newConsumption, error: insertError } = await supabase
          .from('image_consumption')
          .insert({
            user_id: userId,
            available_images: defaultLimit,
            used_images: 0
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating usage record:', insertError);
          return;
        }
        
        if (newConsumption) {
          setUsageStats({
            usedImages: 0,
            availableImages: defaultLimit,
            remainingImages: defaultLimit
          });
          
          toast.info(`Welcome! You have ${defaultLimit} free images to transform.`);
        }
      }
    } catch (error) {
      console.error('Error in fetchUsageData:', error);
    }
  };

  const checkImageLimit = async () => {
    try {
      // Get user profile to check if they're a legacy user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_legacy_user')
        .eq('id', userId)
        .single();
        
      // Legacy users are not subject to limits
      if (profileData?.is_legacy_user) {
        return true;
      }
      
      // Fetch user's image consumption data
      const { data: consumption, error: consumptionError } = await supabase
        .from('image_consumption')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (consumptionError) {
        console.error('Error fetching usage limit:', consumptionError);
        return false;
      }
      
      // If user has used all their images, show the limit dialog
      if (consumption && consumption.used_images >= consumption.available_images) {
        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });
          
        setSubscriptionData(plans);
        setUsageStats({
          usedImages: consumption.used_images,
          availableImages: consumption.available_images,
          remainingImages: 0
        });
        setShowLimitDialog(true);
        return false;
      }
      
      // Update the usage stats
      if (consumption) {
        setUsageStats({
          usedImages: consumption.used_images,
          availableImages: consumption.available_images,
          remainingImages: Math.max(0, consumption.available_images - consumption.used_images)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error checking image limit:', error);
      return false;
    }
  };

  const showUsageDialog = async () => {
    if (!usageStats) await fetchUsageData();
    
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
      
    if (plans) {
      setSubscriptionData(plans);
      setShowLimitDialog(true);
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const preview = URL.createObjectURL(file);
    setOriginalPreview(preview);
    setTransformedImage(null);
    setError(null);
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    setError(null);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setError(null);
  };

  const handleTransformation = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    if (!selectedRoom) {
      toast.error('Please select a room type');
      return;
    }

    // Check if user has reached their image limit
    const hasAvailableImages = await checkImageLimit();
    if (!hasAvailableImages) {
      toast.error('You have reached your image transformation limit');
      return;
    }

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
        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });
          
        if (plans) {
          setSubscriptionData(plans);
          setShowLimitDialog(true);
        }
        return;
      }

      if (response.error) {
        console.error('Supabase function error:', response.error);
        setError(`Service error: ${response.error.message || 'Failed to process image'}. Please try again later.`);
        toast.error('Failed to transform image');
        return;
      }

      if (response.data && response.data.error) {
        console.error('Replicate API error:', response.data.error);
        setError(`API error: ${response.data.error || 'Failed to process image'}. Please try a different image.`);
        toast.error('Failed to transform image');
        return;
      }

      setProcessingPhase('Enhancing with AI upscaler...');
      setProcessingProgress(75);

      if (!response.data || !response.data.output) {
        console.error('No output received from API');
        setError('Error: No image was returned from the service. Please try a different image.');
        toast.error('Failed to transform image');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress(100);
      
      setTransformedImage(response.data.output);
      toast.success('Transformation complete with enhanced clarity!');
      
      // Refresh usage data after successful transformation
      fetchUsageData();
    } catch (error: any) {
      console.error('Transformation error:', error);
      setError(`Error: ${error?.message || 'An unexpected error occurred'}. Please try again.`);
      toast.error('Failed to transform image');
    } finally {
      setIsLoading(false);
      setProcessingPhase(null);
      setProcessingProgress(0);
    }
  };

  return {
    selectedImage,
    selectedStyle,
    selectedRoom,
    originalPreview,
    transformedImage,
    isLoading,
    processingPhase,
    processingProgress,
    error,
    showLimitDialog,
    subscriptionData,
    usageStats,
    handleImageSelect,
    handleStyleSelect,
    handleRoomSelect,
    handleTransformation,
    setShowLimitDialog,
    showUsageDialog
  };
};
