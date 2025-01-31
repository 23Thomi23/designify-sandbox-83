import { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface TransformationViewProps {
  originalImage: string | null;
  transformedImage: string | null;
  isLoading?: boolean;
  className?: string;
}

export const TransformationView = ({
  originalImage,
  transformedImage,
  isLoading = false,
  className,
}: TransformationViewProps) => {
  const [zoom, setZoom] = useState(1);

  const handleDownload = async () => {
    if (!transformedImage) return;
    
    try {
      const response = await fetch(transformedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transformed-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className={cn("grid grid-cols-2 gap-8", className)}>
      <div className="relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm">
        {originalImage && (
          <img
            src={originalImage}
            alt="Original"
            className="w-full h-full object-contain"
            style={{ transform: `scale(${zoom})` }}
          />
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-full">
            Original
          </span>
        </div>
      </div>
      
      <div className="relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary" />
              <Loader2 className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
            </div>
          </div>
        ) : transformedImage ? (
          <>
            <img
              src={transformedImage}
              alt="Transformed"
              className="w-full h-full object-contain"
              style={{ transform: `scale(${zoom})` }}
            />
            <div className="absolute bottom-4 right-4">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : null}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-full">
            Transformed
          </span>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
        <button
          onClick={() => setZoom(Math.max(1, zoom - 0.1))}
          className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          -
        </button>
        <button
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          +
        </button>
      </div>
    </div>
  );
};