
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Image, BarChart, Zap } from 'lucide-react';

const AccountPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [processedImages, setProcessedImages] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setUserData(profile);
        }
        
        // Fetch subscription and usage data
        const { data: subscription, error: subscriptionError } = await supabase
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
          .eq('status', 'active')
          .single();
          
        const { data: usage, error: usageError } = await supabase
          .from('image_consumption')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (!subscriptionError && subscription && !usageError && usage) {
          setUsageData({
            subscription,
            usage
          });
        }
        
        // Fetch recent processed images
        const { data: history, error: historyError } = await supabase
          .from('processing_history')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (!historyError && history) {
          setProcessedImages(history);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const renderUsageData = () => {
    if (!usageData) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>You don't have an active subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/subscription')}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    const { subscription, usage } = usageData;
    const usagePercentage = Math.min(
      Math.round((usage.used_images / subscription.subscription_plans.included_images) * 100),
      100
    );
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Subscription</CardTitle>
          <CardDescription>
            {subscription.subscription_plans.name} Plan (${subscription.subscription_plans.price}/month)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Image Usage ({usage.used_images} of {subscription.subscription_plans.included_images})</span>
              <span>{usagePercentage}%</span>
            </div>
            <Progress value={usagePercentage} />
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Renewal Date</span>
            <span>{new Date(subscription.current_period_end).toLocaleDateString()}</span>
          </div>
          
          <Button variant="outline" onClick={() => navigate('/subscription')}>
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Header />
          <div className="flex items-center justify-center h-64">
            <p>Loading account data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8">
        <Header />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userData?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-medium capitalize">
                    {userData?.is_legacy_user ? 'Legacy User' : 'Standard User'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {renderUsageData()}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Transformations</CardTitle>
            <CardDescription>Your recently processed images</CardDescription>
          </CardHeader>
          <CardContent>
            {processedImages.length > 0 ? (
              <div className="space-y-4">
                {processedImages.map((image) => (
                  <div key={image.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="bg-muted rounded-md h-16 w-16 flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium truncate">
                        {image.processing_type || 'Interior Design'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(image.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart className="mx-auto h-12 w-12 mb-2 opacity-30" />
                <p>No image transformations yet</p>
                <Button variant="link" onClick={() => navigate('/')}>
                  Transform your first image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;
