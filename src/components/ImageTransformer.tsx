
import { SubscriptionLimitDialog } from '@/components/SubscriptionLimitDialog';
import { TransformationContainer } from '@/components/TransformationContainer';
import { useImageTransformation } from '@/hooks/useImageTransformation';
import { STYLES } from '@/constants/styleOptions';
import { Button } from '@/components/ui/button';
import { Info, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useEffect } from 'react';
import { toast } from 'sonner';

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

  // Show a toast notification when usageStats changes and indicates low images remaining
  useEffect(() => {
    if (usageStats && usageStats.remainingImages <= 2 && usageStats.remainingImages > 0) {
      toast.warning(
        `You only have ${usageStats.remainingImages} image transformation${usageStats.remainingImages !== 1 ? 's' : ''} remaining.`,
        { duration: 5000 }
      );
    } else if (usageStats && usageStats.remainingImages === 0) {
      toast.error('You have no image transformations left. Please upgrade your plan to continue.', 
        { duration: 8000 }
      );
    }
  }, [usageStats?.remainingImages]);

  return (
    <>
      {usageStats && (
        <div className="flex flex-col gap-1 mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {usageStats.remainingImages > 0 ? (
                <>You have <span className="font-semibold">{usageStats.remainingImages}</span> image {usageStats.remainingImages === 1 ? 'transformation' : 'transformations'} remaining</>
              ) : (
                <div className="flex items-center text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 mr-1.5" />
                  <span>You've reached your image transformation limit</span>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-700 dark:text-blue-300 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800"
              onClick={showUsageDialog}
            >
              <Info className="h-4 w-4 mr-1" />
              Details
            </Button>
          </div>
          
          {usageStats.availableImages > 0 && (
            <div className="mt-1">
              <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300 mb-1">
                <span>{usageStats.usedImages} used</span>
                <span>{usageStats.availableImages} total</span>
              </div>
              <Progress 
                value={(usageStats.usedImages / usageStats.availableImages) * 100} 
                className="h-1.5 bg-blue-100 dark:bg-blue-900" 
              />
            </div>
          )}
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
        remainingImages={usageStats?.remainingImages}
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
