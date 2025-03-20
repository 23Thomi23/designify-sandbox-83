
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchUserSubscription, 
  fetchAvailablePlans,
  type Subscription,
  type SubscriptionPlan
} from './subscription-service';

export const useSubscriptionData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  
  const fetchSubscriptionData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      try {
        const subscriptionData = await fetchUserSubscription(session.user.id);
        if (subscriptionData) {
          setSubscription(subscriptionData);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load subscription data',
          variant: 'destructive',
        });
      }
      
      try {
        const plansData = await fetchAvailablePlans();
        setAvailablePlans(plansData);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  return {
    loading,
    subscription,
    availablePlans,
    refreshData: fetchSubscriptionData,
    setSubscription
  };
};
