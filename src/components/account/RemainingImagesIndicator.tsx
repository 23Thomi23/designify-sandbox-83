
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
        console.log('RemainingImagesIndicator: Fetching remaining images');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('RemainingImagesIndicator: No session found');
          setLoading(false);
          return;
        }
        
        console.log('RemainingImagesIndicator: User is logged in with ID:', session.user.id);
        
        // Fetch user's image consumption data
        const { data: consumptionData, error: consumptionError } = await supabase
          .from('image_consumption')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        console.log('RemainingImagesIndicator: Consumption data result:', consumptionData, consumptionError);
          
        if (!consumptionError && consumptionData) {
          const usedImages = consumptionData.used_images;
          const availableImages = consumptionData.available_images;
          const remaining = Math.max(0, availableImages - usedImages);
          console.log('RemainingImagesIndicator: Setting remaining images to:', remaining);
          setRemainingImages(remaining);
        } else if (consumptionError && consumptionError.code === 'PGRST116') {
          // No consumption record found, check if we need to create one
          console.log('RemainingImagesIndicator: No consumption record found, creating default');
          
          // Create a default consumption record for new users (free tier - 5 images)
          const { data: subscriptionData } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('name', 'Free')
            .single();
            
          console.log('RemainingImagesIndicator: Free tier data:', subscriptionData);
            
          const defaultLimit = subscriptionData?.included_images || 5;
          
          const { data: newConsumption, error: insertError } = await supabase
            .from('image_consumption')
            .insert({
              user_id: session.user.id,
              available_images: defaultLimit,
              used_images: 0
            })
            .select()
            .single();
            
          console.log('RemainingImagesIndicator: Created consumption record:', newConsumption, insertError);
            
          if (!insertError && newConsumption) {
            setRemainingImages(defaultLimit);
          }
        }
      } catch (error) {
        console.error('RemainingImagesIndicator: Error fetching image usage data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRemainingImages();
    
    // Set up a real-time subscription to update the counter when usage changes
    const channel = supabase
      .channel('image_consumption_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'image_consumption',
        filter: `user_id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user.id)}`
      }, fetchRemainingImages)
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
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
            className="flex items-center cursor-pointer space-x-1 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            onClick={handleClick}
          >
            <ImageIcon className="mr-1" size={16} />
            <Badge 
              variant={remainingImages <= 2 ? "destructive" : "secondary"} 
              className={`text-xs ${remainingImages <= 2 ? 'animate-pulse' : ''}`}
            >
              {remainingImages} image{remainingImages !== 1 ? 's' : ''} left
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>You have {remainingImages} image transformation{remainingImages !== 1 ? 's' : ''} remaining in your plan</p>
          <p className="text-xs mt-1">Click to view account details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
