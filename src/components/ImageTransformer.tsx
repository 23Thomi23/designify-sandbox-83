
import { SubscriptionLimitDialog } from '@/components/SubscriptionLimitDialog';
import { TransformationContainer } from '@/components/TransformationContainer';
import { useImageTransformation } from '@/hooks/useImageTransformation';
import { STYLES } from '@/constants/styleOptions';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface ImageTransformerProps {
  userId: string;
}

export const ImageTransformer = ({ userId }: ImageTransformerProps) => {
  const {
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
  } = useImageTransformation({ userId });

  return (
    <>
      {usageStats && usageStats.remainingImages > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
          <div className="text-sm text-blue-700">
            You have <span className="font-semibold">{usageStats.remainingImages}</span> image transformations remaining
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-700 hover:text-blue-800 hover:bg-blue-100"
            onClick={showUsageDialog}
          >
            <Info className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      )}

      <TransformationContainer
        selectedImage={selectedImage}
        selectedStyle={selectedStyle}
        selectedRoom={selectedRoom}
        originalPreview={originalPreview}
        transformedImage={transformedImage}
        isLoading={isLoading}
        processingPhase={processingPhase}
        processingProgress={processingProgress}
        error={error}
        styles={STYLES}
        onImageSelect={handleImageSelect}
        onStyleSelect={handleStyleSelect}
        onRoomSelect={handleRoomSelect}
        onTransform={handleTransformation}
      />
      
      {showLimitDialog && subscriptionData && usageStats && (
        <SubscriptionLimitDialog 
          open={showLimitDialog}
          onClose={() => setShowLimitDialog(false)}
          plans={subscriptionData}
          remainingImages={usageStats.remainingImages}
          usedImages={usageStats.usedImages}
          totalImages={usageStats.availableImages}
        />
      )}
    </>
  );
};
