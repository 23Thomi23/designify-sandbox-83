
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
        navigate('/auth');
        return;
      }
      
      // Create checkout session
      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: plan.id,
          userId: session.user.id
        }
      });
      
      if (response.error) {
        console.error('Error creating checkout:', response.error);
        setError('Failed to create checkout session. Please try again later.');
        setDetailedError(JSON.stringify(response.error));
        toast({
          variant: 'destructive',
          title: 'Checkout Failed',
          description: 'Could not create checkout session. Please try again.',
        });
      } else if (response.data?.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
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
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading plan details...</p>
            </div>
          ) : plan ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <div className="text-2xl font-bold mb-2">${plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span>
                    <span>{plan.included_images} images per month</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span>
                    <span>High-quality AI transformations</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span>
                    <span>Cancel anytime</span>
                  </li>
                </ul>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error}
                    {detailedError && (
                      <details className="mt-2 text-xs">
                        <summary>Technical Details</summary>
                        <pre className="mt-2 whitespace-pre-wrap">{detailedError}</pre>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-red-600">
              Failed to load plan details. Please go back and try again.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={handleCheckout}
            disabled={loading || creatingCheckout || !plan}
          >
            {creatingCheckout && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {creatingCheckout ? 'Processing...' : 'Proceed to Payment'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/subscription')}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionCheckout;
