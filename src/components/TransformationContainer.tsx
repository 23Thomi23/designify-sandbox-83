
import { ImageUploader } from './ImageUploader';
import { StyleSelector, Style } from './StyleSelector';
import { TransformationView } from './TransformationView';
import { RoomSelector, Room } from './RoomSelector';
import { Button } from './ui/button';
import { Wand2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface TransformationContainerProps {
  selectedImage: File | null;
  selectedStyle: string;
  selectedRoom: Room | null;
  originalPreview: string | null;
  transformedImage: string | null;
  isLoading: boolean;
  processingPhase?: string | null;
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
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Upload Image</h2>
          <ImageUploader onImageSelect={onImageSelect} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Select Room</h2>
          <RoomSelector
            selectedRoom={selectedRoom}
            onRoomSelect={onRoomSelect}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Select Style</h2>
          <StyleSelector
            styles={styles}
            selectedStyle={selectedStyle}
            onStyleSelect={onStyleSelect}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              <div className="space-y-2">
                <p>{error}</p>
                <p className="text-xs opacity-80">
                  Try again with a different image or style. If the problem persists, the service might be unavailable.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={onTransform} 
          disabled={!selectedImage || !selectedRoom || isLoading}
          className="w-full"
        >
          {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2" />}
          {isLoading ? 'Procesando...' : 'Mejorar propiedad'}
        </Button>
      </div>

      <div className="lg:col-span-2">
        <TransformationView
          originalImage={originalPreview}
          transformedImage={transformedImage}
          isLoading={isLoading}
          processingPhase={processingPhase}
        />
      </div>
    </div>
  );
};
