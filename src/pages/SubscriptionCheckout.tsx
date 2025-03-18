
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ErrorDisplay } from '@/components/transformation/ErrorDisplay';
import LoadingState from '@/components/subscription/LoadingState';
import PlanDisplay from '@/components/subscription/PlanDisplay';
import CheckoutActions from '@/components/subscription/CheckoutActions';

const SubscriptionCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  
  useEffect(() => {
    const planId = searchParams.get('plan');
    
    if (!planId) {
      navigate('/');
      return;
    }
    
    const fetchPlanDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();
          
        if (error) {
          console.error('Error fetching plan:', error);
          setError('Failed to load subscription plan. Please try again later.');
        } else {
          setPlan(data);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlanDetails();
  }, [searchParams, navigate]);
  
  const handleCheckout = async () => {
    setCreatingCheckout(true);
    setError(null);
    setDetailedError(null);
    
    try {
      // Get current user
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
      
      console.log('Creating checkout with planId:', plan.id, 'and userId:', session.user.id);
      
      // Create checkout session
      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: plan.id,
          userId: session.user.id
        }
      });
      
      console.log('Checkout response:', response);
      
      if (response.error) {
        console.error('Error creating checkout:', response.error);
        setError('Failed to create checkout session. Please try again later.');
        setDetailedError(JSON.stringify(response.error));
        toast({
          variant: 'destructive',
          title: 'Checkout Failed',
          description: 'Could not create checkout session. Please try again.',
        });
      } else if (response.data?.error) {
        console.error('Server error:', response.data.error);
        setError(`Server error: ${response.data.error}`);
        setDetailedError(response.data.details ? JSON.stringify(response.data.details) : null);
        toast({
          variant: 'destructive',
          title: 'Checkout Failed',
          description: response.data.error,
        });
      } else if (response.data?.url) {
        // Redirect to Stripe checkout
        console.log('Redirecting to Stripe checkout:', response.data.url);
        window.location.href = response.data.url;
      } else if (response.data?.success && response.data?.redirect) {
        // Handle free plan activation (immediate success)
        console.log('Free plan activated, redirecting to:', response.data.redirect);
        window.location.href = response.data.redirect;
      } else {
        console.error('Invalid response:', response.data);
        setError('Invalid response from server. Please try again later.');
        setDetailedError(JSON.stringify(response.data));
        toast({
          variant: 'destructive',
          title: 'Checkout Failed',
          description: 'Received invalid response from server.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred. Please try again later.');
      setDetailedError(error instanceof Error ? error.message : String(error));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setCreatingCheckout(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Subscription Checkout</CardTitle>
          <CardDescription>
            Review and confirm your subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <LoadingState message="Loading plan details..." />
          ) : plan ? (
            <div className="space-y-4">
              <PlanDisplay plan={plan} />
              <ErrorDisplay error={error} details={detailedError} />
            </div>
          ) : (
            <div className="text-center py-4 text-red-600">
              Failed to load plan details. Please go back and try again.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <CheckoutActions 
            onCheckout={handleCheckout}
            loading={creatingCheckout}
            disabled={loading || !plan}
            planPrice={plan?.price || 0}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionCheckout;
