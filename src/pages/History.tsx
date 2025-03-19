
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

  const handleDownload = async (imageUrl: string, id: string) => {
    try {
      setDownloadingId(id);
      
      const isSupabaseUrl = imageUrl.includes('/storage/v1/object/public/enhanced_images/');
      
      if (isSupabaseUrl) {
        // For Supabase storage URLs, we can use the storage API directly
        const path = imageUrl.split('/enhanced_images/')[1];
        const { data, error } = await supabase.storage.from('enhanced_images').download(path);
        
        if (error) throw error;
        
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `enhanced-image-${Date.now()}.webp`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // For external URLs, use the fetch API
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
      }
      
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
                    <img 
                      src={item.enhanced_image} 
                      alt="Enhanced property" 
                      className="object-cover w-full h-full"
                    />
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
                      onClick={() => handleDownload(item.enhanced_image, item.id)}
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
