
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, History, Image, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AuthCheck } from '@/components/AuthCheck';
import { BackButton } from '@/components/BackButton';

const AccountPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [processingHistory, setProcessingHistory] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        setUser(session.user);
        
        // Fetch user subscription
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions' as any)
          .select(`
            *,
            subscription_plans:subscription_id (
              name,
              price,
              included_images
            )
          `)
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();
          
        setSubscription(subscriptionData);
        
        // Fetch usage data
        const { data: consumption } = await supabase
          .from('image_consumption' as any)
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        setUsageData(consumption);
        
        // Fetch processing history
        const { data: history } = await supabase
          .from('processing_history' as any)
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        setProcessingHistory(history || []);
        
        // Fetch available plans
        const { data: plansData } = await supabase
          .from('subscription_plans' as any)
          .select('*')
          .order('price', { ascending: true });
          
        setPlans(plansData || []);
      } catch (error) {
        console.error('Error fetching account data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleUpgradeClick = (planId: string) => {
    navigate('/subscription');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <AuthCheck>
      <div className="container py-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Created</span>
                    <span>{new Date(user?.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Subscription Details */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Subscription</CardTitle>
                  <CardDescription>Current plan and usage</CardDescription>
                </div>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">{subscription.subscription_plans.name} Plan</h3>
                        <p className="text-sm text-muted-foreground">${subscription.subscription_plans.price}/month</p>
                      </div>
                      <Badge variant={subscription.cancel_at_period_end ? "destructive" : "default"}>
                        {subscription.cancel_at_period_end ? "Cancelling" : "Active"}
                      </Badge>
                    </div>
                    
                    {usageData && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Usage this month</span>
                          <span>{usageData.used_images} / {usageData.available_images} images</span>
                        </div>
                        <Progress value={(usageData.used_images / usageData.available_images) * 100} className="h-2" />
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <Button variant="outline" className="w-full" onClick={() => navigate('/subscription')}>
                        Manage Subscription
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>You don't have an active subscription.</p>
                    <div className="pt-2">
                      <Button className="w-full" onClick={() => navigate('/subscription')}>
                        Choose a Plan
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Processing History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Processing History</CardTitle>
                  <CardDescription>Your recently processed images</CardDescription>
                </div>
                <History className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {processingHistory.length > 0 ? (
                  <div className="space-y-4">
                    {processingHistory.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded overflow-hidden bg-muted mr-3">
                            {item.enhanced_image && (
                              <img 
                                src={item.enhanced_image} 
                                alt="Processed" 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {item.processing_type === 'interior_design' ? 'Interior Design' : 'Image Processing'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="ghost" className="w-full text-sm" asChild>
                      <Link to="/history">
                        View Full History <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Image className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No processing history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Available Plans */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>Upgrade to process more images</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-sm">{plan.name}</h3>
                      <div className="text-xl font-bold my-1">${plan.price}<span className="text-xs font-normal text-muted-foreground">/month</span></div>
                      <p className="text-xs text-muted-foreground mb-2">{plan.included_images} images per month</p>
                      <Button 
                        variant={subscription?.subscription_plans?.id === plan.id ? "outline" : "default"} 
                        size="sm"
                        className="w-full text-xs"
                        disabled={subscription?.subscription_plans?.id === plan.id}
                        onClick={() => handleUpgradeClick(plan.id)}
                      >
                        {subscription?.subscription_plans?.id === plan.id ? "Current Plan" : "Select"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
};

export default AccountPage;
