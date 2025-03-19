
import { SubscriptionLimitDialog } from '@/components/SubscriptionLimitDialog';
import { TransformationContainer } from '@/components/TransformationContainer';
import { useImageTransformation } from '@/hooks/useImageTransformation';
import { STYLES } from '@/constants/styleOptions';
import { Button } from '@/components/ui/button';
import { Info, AlertCircle } from 'lucide-react';

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
      {usageStats && (
        <div className={`flex items-center justify-between mb-4 p-3 rounded-md ${
          usageStats.remainingImages <= 2 ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'
        }`}>
          <div className="flex items-center">
            {usageStats.remainingImages <= 2 && (
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            )}
            <div className={`text-sm ${usageStats.remainingImages <= 2 ? 'text-red-700' : 'text-blue-700'}`}>
              {usageStats.remainingImages > 0 ? (
                <>You have <span className="font-semibold">{usageStats.remainingImages}</span> image {usageStats.remainingImages === 1 ? 'transformation' : 'transformations'} remaining</>
              ) : (
                <>You have reached your limit of {usageStats.availableImages} images</>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${usageStats.remainingImages <= 2 ? 'text-red-700 hover:text-red-800 hover:bg-red-100' : 'text-blue-700 hover:text-blue-800 hover:bg-blue-100'}`}
            onClick={showUsageDialog}
          >
            <Info className="h-4 w-4 mr-1" />
            {usageStats.remainingImages === 0 ? 'Upgrade Now' : 'Details'}
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
