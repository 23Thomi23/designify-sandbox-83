
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      // Redirect if no session ID
      navigate('/');
      return;
    }
    
    const fetchSubscriptionDetails = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        // Wait a moment to allow webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fetch subscription details
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions' as any)
          .select(`
            *,
            subscription_plans:subscription_id (
              name, 
              included_images
            )
          `)
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();
          
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionDetails();
  }, [searchParams, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          {loading ? (
            <div className="py-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading your subscription details...</p>
            </div>
          ) : subscription ? (
            <>
              <p>
                You've successfully subscribed to the {subscription.subscription_plans.name} plan.
              </p>
              <div className="my-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Your subscription includes:</p>
                <p className="text-lg font-bold mt-1">
                  {subscription.subscription_plans.included_images} images per month
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Your subscription will automatically renew each month. You can manage your subscription in your account settings.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              Your subscription is being processed. Please check your account for details.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            onClick={() => navigate('/account')}
          >
            Go to My Account
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
