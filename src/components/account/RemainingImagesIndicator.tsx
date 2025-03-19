import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const RemainingImagesIndicator = () => {
  const [remainingImages, setRemainingImages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRemainingImages = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        // Get user profile to check if they're a legacy user
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_legacy_user')
          .eq('id', session.user.id)
          .single();
          
        // Legacy users don't have limits
        if (profileData?.is_legacy_user) {
          setRemainingImages(null);
          setLoading(false);
          return;
        }
        
        // Fetch user's image consumption data
        const { data: consumptionData, error: consumptionError } = await supabase
          .from('image_consumption')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (!consumptionError && consumptionData) {
          const usedImages = consumptionData.used_images;
          const availableImages = consumptionData.available_images;
          const remaining = Math.max(0, availableImages - usedImages);
          setRemainingImages(remaining);
        }
      } catch (error) {
        console.error('Error fetching image usage data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRemainingImages();
    
    // Set up a listener for auth changes to update the indicator
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRemainingImages();
    });
    
    return () => subscription.unsubscribe();
  }, []);

  if (loading || remainingImages === null) {
    return null;
  }

  const handleClick = () => {
    navigate('/account');
  };
  
  // Determine the variant based on remaining images
  const getVariant = () => {
    if (remainingImages <= 0) return "destructive";
    if (remainingImages <= 2) return "warning";
    return "secondary";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="flex items-center cursor-pointer space-x-1 px-2 py-1 rounded-md hover:bg-accent transition-colors"
            onClick={handleClick}
          >
            {remainingImages <= 0 ? (
              <AlertTriangle size={14} className="text-destructive" />
            ) : (
              <ImageIcon size={14} />
            )}
            <Badge 
              variant={getVariant()} 
              className="text-xs"
            >
              {remainingImages === 0 
                ? "No images left" 
                : `${remainingImages} image${remainingImages !== 1 ? 's' : ''} left`}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {remainingImages <= 0 
            ? "You've reached your limit. Click to upgrade."
            : "Click to view account details"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
