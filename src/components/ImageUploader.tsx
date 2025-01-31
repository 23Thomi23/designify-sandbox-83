import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  className?: string;
}

export const ImageUploader = ({ onImageSelect, className }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onImageSelect(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-[400px] border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out bg-background/50 backdrop-blur-sm",
        isDragActive ? "border-primary" : "border-muted",
        className
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-contain rounded-lg"
        />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <Upload className="w-12 h-12 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Drop your image here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select a file
            </p>
          </div>
        </div>
      )}
    </div>
  );
};