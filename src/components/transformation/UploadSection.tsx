
import { ImageUploader } from '../ImageUploader';

interface UploadSectionProps {
  onImageSelect: (file: File) => void;
}

export const UploadSection = ({ onImageSelect }: UploadSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Upload Image</h2>
      <ImageUploader onImageSelect={onImageSelect} />
    </div>
  );
};
