import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  
  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
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
      } catch (error) {
        console.error('Error in fetchUserSubscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription data',
          variant: 'destructive',
        });
      }
      
      try {
        const plansData = await fetchAvailablePlans();
        console.log('Plans data found:', plansData.length);
        setAvailablePlans(plansData);
      } catch (error) {
        console.error('Error in fetchAvailablePlans:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription plans',
          variant: 'destructive',
        });
      }
      
    } catch (error) {
      console.error('General error in fetchSubscriptionData:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
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
      
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled and will end at the current billing period.',
      });
      
      setSubscription({
        ...subscription,
        cancel_at_period_end: true
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
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
        toast({
          variant: 'destructive',
          title: 'Authentication Required',
          description: 'Please sign in to continue with checkout.',
        });
        navigate('/auth');
        return;
      }
      
      const plan = availablePlans.find(p => p.id === planId);
      if (!plan) {
        toast({
          variant: 'destructive',
          title: 'Plan Error',
          description: 'Selected plan not found.',
        });
        return;
      }
      
      if (plan.price === 0) {
        toast({
          title: 'Processing',
          description: 'Activating your free plan...',
        });
        
        const response = await createSubscription(planId, session.user.id);
        
        if (response.success) {
          toast({
            title: 'Success!',
            description: 'Your free plan has been activated.',
          });
          window.location.reload();
        }
      } else {
        toast({
          title: 'Redirecting',
          description: 'Preparing checkout...',
        });
        
        const response = await createSubscription(planId, session.user.id);
        
        if (response.url) {
          window.location.href = response.url;
        } else {
          throw new Error('Invalid response from server');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
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
    formatDate: formatSubscriptionDate
  };
};
