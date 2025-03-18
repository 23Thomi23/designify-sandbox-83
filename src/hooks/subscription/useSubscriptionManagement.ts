
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  
  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans:subscription_id (
            id,
            name,
            price,
            included_images,
            description
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();
        
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subscriptionError);
        toast({
          title: 'Error',
          description: 'Failed to load subscription data',
          variant: 'destructive',
        });
      } else if (subscriptionData) {
        setSubscription(subscriptionData);
      }
      
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });
        
      if (plansError) {
        console.error('Error fetching plans:', plansError);
      } else if (plansData) {
        setAvailablePlans(plansData);
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
  
  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId: subscription.stripe_subscription_id
        }
      });
      
      if (error) {
        console.error('Error cancelling subscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to cancel subscription. Please try again later.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription has been cancelled and will end at the current billing period.',
        });
        
        setSubscription({
          ...subscription,
          cancel_at_period_end: true
        });
      }
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
    // Direct links for specific plans
    if (planName === "Business") {
      window.location.href = "https://buy.stripe.com/5kA2bV0mldRHaOseUU";
      return;
    }
    if (planName === "Basic") {
      window.location.href = "https://buy.stripe.com/dR68Aj7ON14V1dSfZ0";
      return;
    }
    if (planName === "Professional") {
      window.location.href = "https://buy.stripe.com/dR6aIrc5328Z09O5kl";
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
        
        const response = await supabase.functions.invoke('create-checkout', {
          body: {
            planId: planId,
            userId: session.user.id
          }
        });
        
        console.log('Free plan response:', response);
        
        if (response.error) {
          throw new Error(response.error);
        } else if (response.data?.error) {
          throw new Error(response.data.error);
        } else if (response.data?.success) {
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
        
        const response = await supabase.functions.invoke('create-checkout', {
          body: {
            planId: planId,
            userId: session.user.id
          }
        });
        
        console.log('Checkout response:', response);
        
        if (response.error) {
          throw new Error(response.error);
        } else if (response.data?.error) {
          throw new Error(response.data.error);
        } else if (response.data?.url) {
          window.location.href = response.data.url;
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
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return {
    loading,
    creating,
    cancelling,
    subscription,
    availablePlans,
    handleCancelSubscription,
    handleSubscribe,
    formatDate
  };
};
