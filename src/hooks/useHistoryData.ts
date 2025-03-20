import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HistoryItemProps } from '@/components/history/HistoryItem';

export const useHistoryData = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('No user session found, history will be empty');
          if (isMounted) {
            setHistoryItems([]);
            setIsLoading(false);
          }
          return;
        }
        
        // Fetch processing history for the current user
        const { data, error } = await supabase
          .from('processing_history')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching history:', error);
          toast.error('Failed to load history');
          if (isMounted) setIsLoading(false);
          return;
        }
        
        if (!isMounted) return;
        
        if (!data || data.length === 0) {
          setHistoryItems([]);
          setIsLoading(false);
          return;
        }
        
        setHistoryItems(data);
        
        // Get signed URLs for all images
        const urls: Record<string, string> = {};
        
        // Process all images in parallel
        await Promise.all(data.map(async (item) => {
          if (!item.enhanced_image) return;
          
          // If it's already a full URL, use it directly
          if (item.enhanced_image.startsWith('http')) {
            urls[item.id] = item.enhanced_image;
            return;
          }
          
          try {
            // Otherwise, get a signed URL from storage
            const { data: signedUrl } = await supabase
              .storage
              .from('enhanced_images')
              .createSignedUrl(item.enhanced_image, 60 * 60); // 1 hour expiry
              
            if (signedUrl && isMounted) {
              urls[item.id] = signedUrl.signedUrl;
            }
          } catch (urlError) {
            console.error('Error generating signed URL:', urlError);
          }
        }));
        
        if (isMounted) {
          setImageUrls(urls);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load history');
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHistory();
    
    // Set up auth state change listener to refresh history when user logs in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchHistory();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    historyItems,
    isLoading,
    imageUrls
  };
};
