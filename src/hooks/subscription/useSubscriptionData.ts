
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchUserSubscription, 
  fetchAvailablePlans,
  type Subscription,
  type SubscriptionPlan
} from './subscription-service';

export const useSubscriptionData = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSubscriptionData = async () => {
    setError(null);
    try {
      console.log('Getting user session');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found, redirecting to auth');
        navigate('/auth');
        return;
      }
      
      console.log('User is authenticated with ID:', session.user.id);
      
      try {
        const subscriptionData = await fetchUserSubscription(session.user.id);
        console.log('Subscription data result:', subscriptionData ? 'Found' : 'Not found');
        if (subscriptionData) {
          setSubscription(subscriptionData);
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error in fetchUserSubscription:', error);
        // Don't set error state for "no subscription" cases
        if (!(error.message && error.message.includes('no rows'))) {
          setError('subscription');
        }
      }
      
      try {
        const plansData = await fetchAvailablePlans();
        console.log('Plans data found:', plansData.length);
        setAvailablePlans(plansData);
      } catch (err) {
        console.error('Error in fetchAvailablePlans:', err);
        setError('plans');
        toast.error('Error loading subscription plans');
      }
      
    } catch (err) {
      console.error('General error in fetchSubscriptionData:', err);
      setError('general');
      toast.error('Error loading subscription data');
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
    setSubscription,
    availablePlans,
    error
  };
};
