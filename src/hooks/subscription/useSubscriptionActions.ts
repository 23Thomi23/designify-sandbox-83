
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  cancelSubscription, 
  createSubscription,
  type Subscription
} from './subscription-service';
import { getDirectPlanUrl } from './subscription-utils';

interface UseSubscriptionActionsProps {
  setSubscription: React.Dispatch<React.SetStateAction<Subscription | null>>;
}

export const useSubscriptionActions = ({ setSubscription }: UseSubscriptionActionsProps) => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  const handleCancelSubscription = async (subscription: Subscription) => {
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
  
  const handleSubscribe = async (planId: string, planName: string, availablePlans: any[]) => {
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
    creating,
    cancelling,
    handleCancelSubscription,
    handleSubscribe
  };
};
