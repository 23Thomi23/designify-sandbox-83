
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  
  useEffect(() => {
    const session_id = searchParams.get('session_id');
    
    if (session_id) {
      const fetchSubscriptionDetails = async () => {
        try {
          // Get current user
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            navigate('/auth');
            return;
          }
          
          // Get subscription details
          const { data: subscriptionData, error } = await supabase
            .from('user_subscriptions')
            .select(`
              *,
              subscription_plans:subscription_id (
                name,
                price,
                included_images
              )
            `)
            .eq('user_id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching subscription:', error);
          } else {
            setSubscription(subscriptionData);
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchSubscriptionDetails();
    } else {
      navigate('/');
    }
  }, [searchParams, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
          <CardDescription>
            Thank you for subscribing to our service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading subscription details...</div>
          ) : subscription ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">{subscription.subscription_plans.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">${subscription.subscription_plans.price}/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Images per month:</span>
                <span className="font-medium">{subscription.subscription_plans.included_images}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize font-medium">{subscription.status}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">No subscription details found.</div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate('/')}>
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
