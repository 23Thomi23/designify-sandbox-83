
import { TransformationView } from './TransformationView';
import { Style } from './StyleSelector';
import { Room } from './RoomSelector';
import { UploadSection } from './transformation/UploadSection';
import { RoomSection } from './transformation/RoomSection';
import { StyleSection } from './transformation/StyleSection';
import { TransformButton } from './transformation/TransformButton';
import { ErrorDisplay } from './transformation/ErrorDisplay';

interface TransformationContainerProps {
  selectedImage: File | null;
  selectedStyle: string;
  selectedRoom: Room | null;
  originalPreview: string | null;
  transformedImage: string | null;
  isLoading: boolean;
  processingPhase?: string | null;
  processingProgress?: number;
  error?: string | null;
  styles: Style[];
  onImageSelect: (file: File) => void;
  onStyleSelect: (styleId: string) => void;
  onRoomSelect: (room: Room) => void;
  onTransform: () => void;
}

export const TransformationContainer = ({
  selectedImage,
  selectedStyle,
  selectedRoom,
  originalPreview,
  transformedImage,
  isLoading,
  processingPhase,
  processingProgress = 0,
  error,
  styles,
  onImageSelect,
  onStyleSelect,
  onRoomSelect,
  onTransform,
}: TransformationContainerProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="space-y-8">
        <UploadSection onImageSelect={onImageSelect} />
        
        <RoomSection 
          selectedRoom={selectedRoom}
          onRoomSelect={onRoomSelect}
        />

        <StyleSection 
          styles={styles}
          selectedStyle={selectedStyle}
          onStyleSelect={onStyleSelect}
        />

        <ErrorDisplay error={error} />

        <TransformButton 
          onClick={onTransform} 
          disabled={!selectedImage || !selectedRoom || isLoading}
          isLoading={isLoading}
        />
      </div>

      <div className="lg:col-span-2">
        <TransformationView
          originalImage={originalPreview}
          transformedImage={transformedImage}
          isLoading={isLoading}
          processingPhase={processingPhase}
          processingProgress={processingProgress}
        />
      </div>
    </div>
  );
};
