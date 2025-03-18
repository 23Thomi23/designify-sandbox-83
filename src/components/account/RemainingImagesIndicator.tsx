
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ImageIcon } from 'lucide-react';
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
  }, []);

  if (loading || remainingImages === null) {
    return null;
  }

  const handleClick = () => {
    navigate('/account');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="flex items-center cursor-pointer space-x-1 px-2 py-1 rounded-md hover:bg-accent transition-colors"
            onClick={handleClick}
          >
            <ImageIcon size={14} />
            <Badge 
              variant={remainingImages <= 2 ? "destructive" : "secondary"} 
              className="text-xs"
            >
              {remainingImages} image{remainingImages !== 1 ? 's' : ''} left
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to view account details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
