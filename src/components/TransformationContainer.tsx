
import { ImageUploader } from './ImageUploader';
import { StyleSelector, Style } from './StyleSelector';
import { TransformationView } from './TransformationView';

interface TransformationContainerProps {
  selectedImage: File | null;
  selectedStyle: string;
  originalPreview: string | null;
  transformedImage: string | null;
  isLoading: boolean;
  styles: Style[];
  onImageSelect: (file: File) => void;
  onStyleSelect: (styleId: string) => void;
}

export const TransformationContainer = ({
  selectedImage,
  selectedStyle,
  originalPreview,
  transformedImage,
  isLoading,
  styles,
  onImageSelect,
  onStyleSelect,
}: TransformationContainerProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Upload Image</h2>
          <ImageUploader onImageSelect={onImageSelect} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Select Style</h2>
          <StyleSelector
            styles={styles}
            selectedStyle={selectedStyle}
            onStyleSelect={onStyleSelect}
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <TransformationView
          originalImage={originalPreview}
          transformedImage={transformedImage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
