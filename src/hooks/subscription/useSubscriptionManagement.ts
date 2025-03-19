
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchUserSubscription, 
  fetchAvailablePlans, 
  cancelSubscription, 
  createSubscription,
  type Subscription,
  type SubscriptionPlan
} from './subscription-service';
import { formatSubscriptionDate, getDirectPlanUrl } from './subscription-utils';

export const useSubscriptionManagement = () => {
  const navigate = useNavigate();
  const { toast: toastUI } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchSubscriptionData();
  }, []);

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
  
  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      if (!subscription?.stripe_subscription_id) {
        throw new Error('No subscription ID found');
      }
      
      await cancelSubscription(subscription.stripe_subscription_id);
      
      toast.success('Subscription Cancelled', {
        description: 'Your subscription has been cancelled and will end at the current billing period.'
      });
      
      setSubscription({
        ...subscription,
        cancel_at_period_end: true
      });
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to cancel subscription', {
        description: 'Please try again later or contact support.'
      });
    } finally {
      setCancelling(false);
    }
  };
  
  const handleSubscribe = async (planId: string, planName: string) => {
    // Check for direct links for specific plans
    const directUrl = getDirectPlanUrl(planName);
    if (directUrl) {
      window.location.href = directUrl;
      return;
    }
    
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication Required', {
          description: 'Please sign in to continue with checkout.'
        });
        navigate('/auth');
        return;
      }
      
      const plan = availablePlans.find(p => p.id === planId);
      if (!plan && planId) {
        toast.error('Plan Error', {
          description: 'Selected plan not found.'
        });
        return;
      }
      
      if (plan && plan.price === 0) {
        toast.info('Processing', {
          description: 'Activating your free plan...'
        });
        
        const response = await createSubscription(planId, session.user.id);
        
        if (response.success) {
          toast.success('Success!', {
            description: 'Your free plan has been activated.'
          });
          window.location.reload();
        }
      } else {
        toast.info('Redirecting', {
          description: 'Preparing checkout...'
        });
        
        const response = await createSubscription(planId || "", session.user.id);
        
        if (response.url) {
          window.location.href = response.url;
        } else {
          throw new Error('Invalid response from server');
        }
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error:', error);
      toast.error('Checkout Failed', {
        description: error.message || 'An unexpected error occurred'
      });
    } finally {
      setCreating(false);
    }
  };

  return {
    loading,
    creating,
    cancelling,
    subscription,
    availablePlans,
    handleCancelSubscription,
    handleSubscribe,
    formatDate: formatSubscriptionDate,
    error
  };
};
