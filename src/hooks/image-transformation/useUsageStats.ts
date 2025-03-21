
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UsageStats, SubscriptionPlan } from './types';

export const useUsageStats = (userId: string) => {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionPlan[] | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  // Fetch user's subscription and usage data
  const fetchUsageData = async () => {
    try {
      console.log("Fetching usage data for user:", userId);
      
      // Get user profile to check if they're a legacy user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_legacy_user')
        .eq('id', userId)
        .single();
        
      // Legacy users are not subject to limits
      if (profileData?.is_legacy_user) {
        console.log("User is a legacy user, no limits apply");
        return;
      }
      
      // Fetch user's image consumption data
      const { data: consumptionData, error: consumptionError } = await supabase
        .from('image_consumption')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (consumptionError && consumptionError.code !== 'PGRST116') {
        console.error('Error fetching usage data:', consumptionError);
        return;
      }
      
      console.log("Consumption data:", consumptionData);
      
      if (consumptionData) {
        const usedImages = consumptionData.used_images;
        const availableImages = consumptionData.available_images;
        const totalImages = usedImages + availableImages;
        
        console.log(`User has ${availableImages} images remaining (${usedImages} used out of ${totalImages} total)`);
        
        setUsageStats({
          usedImages,
          availableImages: totalImages,
          remainingImages: Math.max(0, availableImages)
        });
        
        // If user has very few images left, show a warning
        if (availableImages <= 2 && availableImages > 0) {
          toast.warning(`You have only ${availableImages} image${availableImages === 1 ? '' : 's'} left in your plan.`);
        }
        
        // If user is out of images, show a notification
        if (availableImages === 0) {
          toast.error('You have reached your image transformation limit. Please upgrade your plan to continue.');
        }
      } else {
        console.log("No consumption data found, creating default entry");
        
        // Create a default consumption record for new users (free tier - 5 images)
        const { data: subscriptionData } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'Free')
          .single();
          
        const defaultLimit = subscriptionData?.included_images || 5;
        
        const { data: newConsumption, error: insertError } = await supabase
          .from('image_consumption')
          .insert({
            user_id: userId,
            available_images: defaultLimit,
            used_images: 0
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating usage record:', insertError);
          return;
        }
        
        if (newConsumption) {
          setUsageStats({
            usedImages: 0,
            availableImages: defaultLimit,
            remainingImages: defaultLimit
          });
          
          toast.info(`Welcome! You have ${defaultLimit} free images to transform.`);
        }
      }
    } catch (error) {
      console.error('Error in fetchUsageData:', error);
    }
  };

  // Check if user has reached their image limit
  const checkImageLimit = async (): Promise<boolean> => {
    try {
      // Get user profile to check if they're a legacy user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_legacy_user')
        .eq('id', userId)
        .single();
        
      // Legacy users are not subject to limits
      if (profileData?.is_legacy_user) {
        return true;
      }
      
      // Fetch user's image consumption data
      const { data: consumption, error: consumptionError } = await supabase
        .from('image_consumption')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (consumptionError) {
        console.error('Error fetching usage limit:', consumptionError);
        return false;
      }
      
      // If user has no available images, show the limit dialog
      if (consumption && consumption.available_images <= 0) {
        console.log("User has reached their limit, showing upgrade dialog");
        
        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });
          
        setSubscriptionData(plans || null);
        setUsageStats({
          usedImages: consumption.used_images,
          availableImages: consumption.available_images,
          remainingImages: Math.max(0, consumption.available_images)
        });
        setShowLimitDialog(true);
        return false;
      }
      
      // Update the usage stats
      if (consumption) {
        setUsageStats({
          usedImages: consumption.used_images,
          availableImages: consumption.available_images,
          remainingImages: Math.max(0, consumption.available_images)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error checking image limit:', error);
      return false;
    }
  };

  const showUsageDialog = async () => {
    if (!usageStats) await fetchUsageData();
    
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
      
    if (plans) {
      setSubscriptionData(plans);
      setShowLimitDialog(true);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUsageData();
      
      // Set up a subscription to refresh usage data every time the page is focused
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchUsageData();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [userId]);

  return {
    usageStats,
    subscriptionData,
    showLimitDialog,
    setShowLimitDialog,
    fetchUsageData,
    checkImageLimit,
    showUsageDialog
  };
};
