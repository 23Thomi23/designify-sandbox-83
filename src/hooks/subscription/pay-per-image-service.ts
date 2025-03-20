
import { supabase } from '@/integrations/supabase/client';

/**
 * Purchase a one-time image pack
 */
export const purchaseImagePack = async (userId: string, packSize: number = 25): Promise<{ url?: string }> => {
  try {
    const response = await supabase.functions.invoke('create-checkout', {
      body: {
        userId,
        isPayPerImage: true,
        imagePackSize: packSize
      }
    });
    
    if (response.error) {
      throw new Error(response.error);
    } else if (response.data?.error) {
      throw new Error(response.data.error);
    }
    
    return {
      url: response.data?.url
    };
  } catch (error) {
    console.error('Error creating pay-per-image checkout:', error);
    throw error;
  }
};
