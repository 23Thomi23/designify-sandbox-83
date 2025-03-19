
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HistoryItemProps } from '@/components/history/HistoryItem';

export const useHistoryData = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return {
    historyItems,
    isLoading,
    imageUrls
  };
};
