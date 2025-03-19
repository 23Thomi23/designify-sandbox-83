
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface HistoryItem {
  id: string;
  original_image: string;
  enhanced_image: string;
  created_at: string;
  processing_type: string;
}

const History = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('processing_history')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
            
          if (error) {
            console.error('Error fetching history:', error);
            toast.error('Failed to load history');
          } else {
            setHistoryItems(data || []);
            
            // Get signed URLs for all images
            const urls: Record<string, string> = {};
            for (const item of data || []) {
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
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDownload = async (item: HistoryItem) => {
    try {
      setDownloadingId(item.id);
      
      // Get the image URL (either from our imageUrls state or generate a new one)
      let imageUrl = imageUrls[item.id];
      
      // If we don't have a URL yet, try to get one
      if (!imageUrl && item.enhanced_image && !item.enhanced_image.startsWith('http')) {
        const { data: signedUrl } = await supabase
          .storage
          .from('enhanced_images')
          .createSignedUrl(item.enhanced_image, 60 * 60); // 1 hour expiry
          
        if (signedUrl) {
          imageUrl = signedUrl.signedUrl;
          setImageUrls(prev => ({ ...prev, [item.id]: imageUrl }));
        }
      }
      
      if (!imageUrl) {
        throw new Error('Could not retrieve image URL');
      }
      
      // Download the image
      const response = await fetch(imageUrl);
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
      const url = window.URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enhanced-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 space-y-8">
        <Header />
        <BackButton />
        
        <div>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Your Enhancement History
          </h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center p-8 bg-muted/50 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No history yet</h3>
              <p className="text-muted-foreground">
                Your enhanced images will appear here once you start transforming properties.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative aspect-square">
                    {imageUrls[item.id] ? (
                      <img 
                        src={imageUrls[item.id]} 
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
                          {item.processing_type === 'interior_design' ? 'Property Enhancement' : 'Image Enhancement'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(item.created_at), 'PPP')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDownload(item)}
                      disabled={downloadingId === item.id}
                    >
                      {downloadingId === item.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
