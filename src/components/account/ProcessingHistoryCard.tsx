
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Image, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingHistoryCardProps {
  processingHistory: any[];
}

export const ProcessingHistoryCard = ({ processingHistory }: ProcessingHistoryCardProps) => {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    const getSignedUrls = async () => {
      if (processingHistory.length === 0) {
        setLoadingImages(false);
        return;
      }
      
      try {
        const urls: Record<string, string> = {};
        for (const item of processingHistory) {
          if (item.enhanced_image && !item.enhanced_image.startsWith('http')) {
            try {
              const { data: signedUrl } = await supabase
                .storage
                .from('enhanced_images')
                .createSignedUrl(item.enhanced_image, 60 * 60); // 1 hour expiry
                
              if (signedUrl) {
                urls[item.id] = signedUrl.signedUrl;
              }
            } catch (urlError) {
              console.error('Error generating signed URL:', urlError);
            }
          } else if (item.enhanced_image) {
            urls[item.id] = item.enhanced_image;
          }
        }
        setImageUrls(urls);
      } catch (error) {
        console.error('Error getting signed URLs:', error);
      } finally {
        setLoadingImages(false);
      }
    };
    
    getSignedUrls();
  }, [processingHistory]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Processing History</CardTitle>
          <CardDescription>Your recently processed images</CardDescription>
        </div>
        <History className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {processingHistory.length > 0 ? (
          <div className="space-y-4">
            {processingHistory.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded overflow-hidden bg-muted mr-3">
                    {loadingImages ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : imageUrls[item.id] ? (
                      <img 
                        src={imageUrls[item.id]} 
                        alt="Processed" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="h-6 w-6 m-3 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {item.processing_type === 'interior_design' ? 'Interior Design' : 'Image Processing'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="ghost" className="w-full text-sm" asChild>
              <Link to="/history">
                View Full History <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Image className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No processing history yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
