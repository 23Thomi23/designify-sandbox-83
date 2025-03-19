
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Ensure user has consumption data
      try {
        const { data: consumptionData, error } = await supabase
          .from('image_consumption')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        // If no consumption data exists, create one with free tier settings (5 images)
        if (error && error.code === 'PGRST116') {
          const { data: freePlan } = await supabase
            .from('subscription_plans')
            .select('id, included_images')
            .eq('name', 'Free')
            .single();
            
          if (freePlan) {
            await supabase
              .from('image_consumption')
              .insert({
                user_id: session.user.id,
                available_images: freePlan.included_images || 5,
                used_images: 0
              });
              
            // Also create a subscription record
            await supabase
              .from('user_subscriptions')
              .insert({
                user_id: session.user.id,
                subscription_id: freePlan.id,
                status: 'active',
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
              });
          }
        }

        // Ensure storage access is available
        try {
          // Test storage bucket access by listing files (this will validate permissions)
          await supabase.storage.from('enhanced_images').list(`${session.user.id}`);
        } catch (storageError) {
          console.error('Storage access error:', storageError);
          // We'll continue even if there's an error as this is just a permission check
        }
      } catch (error) {
        console.error('Error checking user consumption:', error);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return <>{children}</>;
};
