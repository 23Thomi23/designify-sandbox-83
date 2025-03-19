
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
      console.log('Fetching usage data for user:', userId);
      
      // Fetch user's image consumption data
      const { data: consumptionData, error: consumptionError } = await supabase
        .from('image_consumption')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      console.log('Consumption data query result:', consumptionData, consumptionError);
        
      if (consumptionError && consumptionError.code !== 'PGRST116') {
        console.error('Error fetching usage data:', consumptionError);
        return;
      }
      
      // Get user profile to check if they're a legacy user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_legacy_user')
        .eq('id', userId)
        .single();
        
      console.log('Profile data for legacy check:', profileData);
        
      // Legacy users are not subject to limits
      if (profileData?.is_legacy_user) {
        console.log('User is a legacy user, not subject to limits');
        return;
      }
      
      if (consumptionData) {
        const usedImages = consumptionData.used_images;
        const availableImages = consumptionData.available_images;
        const remainingImages = Math.max(0, availableImages - usedImages);
        
        console.log('Setting usage stats:', { usedImages, availableImages, remainingImages });
        
        setUsageStats({
          usedImages,
          availableImages,
          remainingImages
        });
        
        // If user has very few images left, show a warning
        if (remainingImages <= 2 && remainingImages > 0) {
          toast.warning(`You have only ${remainingImages} image${remainingImages === 1 ? '' : 's'} left in your plan.`);
        }
      } else {
        console.log('No consumption data found, creating default record for new user');
        
        // Create a default consumption record for new users (free tier - 5 images)
        const { data: subscriptionData } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'Free')
          .single();
          
        console.log('Free tier subscription data:', subscriptionData);
          
        const defaultLimit = subscriptionData?.included_images || 5;
        
        console.log('Creating new consumption record with limit:', defaultLimit);
        
        const { data: newConsumption, error: insertError } = await supabase
          .from('image_consumption')
          .insert({
            user_id: userId,
            available_images: defaultLimit,
            used_images: 0
          })
          .select()
          .single();
          
        console.log('New consumption record result:', newConsumption, insertError);
          
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
      console.log('Checking image limit for user:', userId);
      
      // Get user profile to check if they're a legacy user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_legacy_user')
        .eq('id', userId)
        .single();
        
      console.log('Profile data for limit check:', profileData);
        
      // Legacy users are not subject to limits
      if (profileData?.is_legacy_user) {
        console.log('User is a legacy user, bypassing limit check');
        return true;
      }
      
      // Fetch user's image consumption data
      const { data: consumption, error: consumptionError } = await supabase
        .from('image_consumption')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      console.log('Consumption data for limit check:', consumption, consumptionError);
      
      if (consumptionError) {
        console.error('Error fetching usage limit:', consumptionError);
        return false;
      }
      
      // If user has used all their images, show the limit dialog
      if (consumption && consumption.used_images >= consumption.available_images) {
        console.log('User has reached their limit, showing upgrade dialog');
        
        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });
          
        console.log('Available plans for upgrade:', plans);
          
        setSubscriptionData(plans || null);
        setUsageStats({
          usedImages: consumption.used_images,
          availableImages: consumption.available_images,
          remainingImages: 0
        });
        setShowLimitDialog(true);
        return false;
      }
      
      // Update the usage stats
      if (consumption) {
        console.log('User has not reached limit, updating stats display');
        
        setUsageStats({
          usedImages: consumption.used_images,
          availableImages: consumption.available_images,
          remainingImages: Math.max(0, consumption.available_images - consumption.used_images)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error checking image limit:', error);
      return false;
    }
  };

  const showUsageDialog = async () => {
    console.log('Showing usage dialog');
    
    if (!usageStats) await fetchUsageData();
    
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
      
    console.log('Available plans for dialog:', plans);
      
    if (plans) {
      setSubscriptionData(plans);
      setShowLimitDialog(true);
    }
  };

  useEffect(() => {
    if (userId) {
      console.log('Initial load - fetching usage data for user:', userId);
      fetchUsageData();
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
