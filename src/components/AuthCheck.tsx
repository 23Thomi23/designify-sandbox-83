
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
          
        // If no consumption data exists, create one with free tier settings
        if (error && error.code === 'PGRST116') {
          const { data: freePlan, error: planError } = await supabase
            .from('subscription_plans')
            .select('id, included_images')
            .eq('name', 'Free')
            .single();
            
          if (planError) {
            console.error('Error fetching free plan:', planError);
            toast.error('Error initializing your account. Please refresh or contact support.');
            return;
          }
            
          if (freePlan) {
            const defaultImageCount = freePlan.included_images || 5;
            
            // First create the subscription record
            const { error: subscriptionError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: session.user.id,
                subscription_id: freePlan.id,
                status: 'active',
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
              });
              
            if (subscriptionError) {
              console.error('Error creating subscription record:', subscriptionError);
              toast.error('Error setting up your account. Please try again or contact support.');
              return;
            }
            
            // After subscription is created, create the consumption record
            const { error: insertError } = await supabase
              .from('image_consumption')
              .insert({
                user_id: session.user.id,
                available_images: defaultImageCount,
                used_images: 0
              });
              
            if (insertError) {
              console.error('Error creating consumption record:', insertError);
              toast.error('Error setting up your account. Please refresh or contact support.');
              return;
            }
              
            toast.info(`Welcome! You have ${defaultImageCount} free images to transform.`);
          }
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
