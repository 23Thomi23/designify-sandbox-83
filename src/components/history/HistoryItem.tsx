
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface HistoryItemProps {
  id: string;
  original_image: string;
  enhanced_image: string;
  created_at: string;
  processing_type: string;
  imageUrl?: string;
}

export const HistoryItemCard = ({ 
  id, 
  enhanced_image, 
  created_at, 
  processing_type,
  imageUrl 
}: HistoryItemProps) => {
  const [downloadingId, setDownloadingId] = useState<boolean>(false);

  const handleDownload = async () => {
    try {
      setDownloadingId(true);
      
      // Get the image URL (either from imageUrl prop or generate a new one)
      let url = imageUrl;
      
      // If we don't have a URL yet, try to get one
      if (!url && enhanced_image && !enhanced_image.startsWith('http')) {
        const { data: signedUrl } = await supabase
          .storage
          .from('enhanced_images')
          .createSignedUrl(enhanced_image, 60 * 60); // 1 hour expiry
          
        if (signedUrl) {
          url = signedUrl.signedUrl;
        }
      }
      
      if (!url) {
        throw new Error('Could not retrieve image URL');
      }
      
      // Download the image
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download image');
      
      const blob = await response.blob();
      
      // Convert the blob to PNG format if it's not already
      let downloadBlob = blob;
      if (blob.type !== 'image/png') {
        // Create a canvas to convert the image to PNG
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const pngBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0);
          });
          downloadBlob = pngBlob;
        }
        
        // Clean up the temporary object URL
        URL.revokeObjectURL(img.src);
      }
      
      // Create download link for the PNG image
      const downloadUrl = window.URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `enhanced-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloadingId(false);
    }
  };

  return (
    <Card key={id} className="overflow-hidden">
      <div className="relative aspect-square">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Enhanced property" 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-muted-foreground">
              {processing_type === 'interior_design' ? 'Property Enhancement' : 'Image Enhancement'}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(created_at), 'PPP')}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleDownload}
          disabled={downloadingId}
        >
          {downloadingId ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};
