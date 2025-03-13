
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard, AlertTriangle } from 'lucide-react';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        // Fetch user's active subscription
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
        
        // Fetch available plans
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
    
    fetchSubscriptionData();
  }, [navigate, toast]);
  
  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Call the cancel-subscription edge function
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
        
        // Update subscription in state
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
  
  const handleUpgrade = (planId: string) => {
    navigate(`/subscription/checkout?plan=${planId}`);
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
  
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {subscription ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Your current subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-xl font-bold">{subscription.subscription_plans.name}</h3>
                    <p className="text-lg">${subscription.subscription_plans.price}/month</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.cancel_at_period_end 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {subscription.cancel_at_period_end ? 'Cancelling' : 'Active'}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Images per month:</span>
                    <span className="font-medium">{subscription.subscription_plans.included_images}</span>
                  </div>
                  
                  {subscription.current_period_end && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {subscription.cancel_at_period_end ? 'Access until:' : 'Next billing date:'}
                      </span>
                      <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
                    </div>
                  )}
                </div>
                
                {subscription.cancel_at_period_end && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start mt-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">Your subscription is set to cancel</p>
                      <p className="text-sm text-amber-700 mt-1">
                        You will continue to have access to your current plan until {formatDate(subscription.current_period_end)}.
                        After this date, you will be downgraded to the free plan.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {!subscription.cancel_at_period_end && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancelSubscription} 
                    disabled={cancelling}
                  >
                    {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>
                  You don't have an active subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose from one of our subscription plans below to upgrade your account and 
                  get access to more features.
                </p>
              </CardContent>
            </Card>
          )}
          
          <h2 className="text-2xl font-bold mt-10">Available Plans</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availablePlans.map((plan) => (
              <Card key={plan.id} className={subscription?.subscription_plans?.id === plan.id 
                ? 'border-primary' 
                : ''}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-2xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <ul className="space-y-2 mt-4">
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
                </CardContent>
                <CardFooter>
                  {subscription?.subscription_plans?.id === plan.id ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleUpgrade(plan.id)}
                      variant={subscription ? "default" : "default"}
                    >
                      {subscription ? 'Switch Plan' : 'Choose Plan'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="bg-muted p-4 rounded-lg mt-6">
            <div className="flex items-start">
              <CreditCard className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Secure Payments</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All payments are processed securely through Stripe. We do not store your payment information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
