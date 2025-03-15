
import { SubscriptionLimitDialog } from '@/components/SubscriptionLimitDialog';
import { TransformationContainer } from '@/components/TransformationContainer';
import { useImageTransformation } from '@/hooks/useImageTransformation';
import { STYLES } from '@/constants/styleOptions';

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
    handleImageSelect,
    handleStyleSelect,
    handleRoomSelect,
    handleTransformation,
    setShowLimitDialog
  } = useImageTransformation({ userId });

  return (
    <>
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
      
      {showLimitDialog && subscriptionData && (
        <SubscriptionLimitDialog 
          open={showLimitDialog}
          onClose={() => setShowLimitDialog(false)}
          plans={subscriptionData}
        />
      )}
    </>
  );
};
