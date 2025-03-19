
import { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TransformationViewProps {
  originalImage: string | null;
  transformedImage: string | null;
  isLoading?: boolean;
  processingPhase?: string | null;
  processingProgress?: number;
  className?: string;
}

export const TransformationView = ({
  originalImage,
  transformedImage,
  isLoading = false,
  processingPhase = null,
  processingProgress = 0,
  className,
}: TransformationViewProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!transformedImage) return;
    
    try {
      setIsDownloading(true);
      
      let imageUrl = transformedImage;
      
      // If this is a storage path (not a URL), get a signed URL
      if (transformedImage && !transformedImage.startsWith('http')) {
        const { data: signedUrl } = await supabase
          .storage
          .from('enhanced_images')
          .createSignedUrl(transformedImage, 60 * 60); // 1 hour expiry
          
        if (signedUrl) {
          imageUrl = signedUrl.signedUrl;
        } else {
          throw new Error('Failed to generate signed URL');
        }
      }
      
      // Download the image
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to download image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enhanced-image-${Date.now()}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={cn("grid grid-cols-2 gap-8", className)}>
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
        {originalImage && (
          <img
            src={originalImage}
            alt="Original"
            className="w-full h-full object-contain"
          />
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 text-xs font-medium bg-background/95 backdrop-blur-sm rounded-full shadow-sm">
            Original
          </span>
        </div>
      </div>
      
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="relative animate-pulse mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10" />
              <Loader2 className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
            </div>
            {processingPhase && (
              <div className="text-center space-y-3 w-full max-w-xs">
                <p className="text-sm font-medium">{processingPhase}</p>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}
          </div>
        ) : transformedImage ? (
          <>
            <img
              src={transformedImage}
              alt="Transformed"
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-4 right-4">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                disabled={isDownloading}
                className="rounded-full bg-background/95 backdrop-blur-sm shadow-sm hover:bg-background"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        ) : null}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 text-xs font-medium bg-background/95 backdrop-blur-sm rounded-full shadow-sm">
            Enhanced
          </span>
        </div>
      </div>
    </div>
  );
};
