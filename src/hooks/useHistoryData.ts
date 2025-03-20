
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
        setIsLoading(true);
        
        // Get the current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch processing history for the current user
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
        } else {
          // If no user is logged in, redirect to auth page
          console.log('No user session found, history will be empty');
          setHistoryItems([]);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    
    // Set up auth state change listener to refresh history when user logs in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchHistory();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    historyItems,
    isLoading,
    imageUrls
  };
};
