
import { useState } from 'react';
import { Room } from '@/components/RoomSelector';
import { useImageSelection } from './image-transformation/useImageSelection';
import { useImageProcessor } from './image-transformation/useImageProcessor';
import { useUsageStats } from './image-transformation/useUsageStats';
import { toast } from 'sonner';

interface UseImageTransformationProps {
  userId: string;
}

export const useImageTransformation = ({ userId }: UseImageTransformationProps) => {
  const {
    selectedImage,
    selectedStyle,
    selectedRoom,
    originalPreview,
    handleImageSelect,
    handleStyleSelect,
    handleRoomSelect
  } = useImageSelection();

  const {
    usageStats,
    subscriptionData,
    showLimitDialog,
    setShowLimitDialog,
    fetchUsageData,
    checkImageLimit,
    showUsageDialog
  } = useUsageStats(userId);

  const {
    isLoading,
    processingPhase,
    processingProgress,
    error,
    transformedImage,
    processImage,
    setTransformedImage
  } = useImageProcessor(userId, fetchUsageData);

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
      setShowLimitDialog(true);
      return;
    }

    // Process the image, and if successful the callback will refresh usage stats
    const success = await processImage(selectedImage, selectedRoom, selectedStyle);
    
    // If successful, immediately fetch latest usage data to update UI
    if (success) {
      await fetchUsageData();
    }
  };

  return {
    // Image selection
    selectedImage,
    selectedStyle,
    selectedRoom,
    originalPreview,
    handleImageSelect,
    handleStyleSelect,
    handleRoomSelect,
    
    // Image processing
    isLoading,
    processingPhase,
    processingProgress,
    error,
    transformedImage,
    
    // Usage and limits
    usageStats,
    subscriptionData,
    showLimitDialog,
    setShowLimitDialog,
    showUsageDialog,
    
    // Main transformation function
    handleTransformation
  };
};
