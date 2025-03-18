
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AuthCheck } from '@/components/AuthCheck';
import { BackButton } from '@/components/BackButton';
import { UserProfileCard } from '@/components/account/UserProfileCard';
import { SubscriptionCard } from '@/components/account/SubscriptionCard';
import { ProcessingHistoryCard } from '@/components/account/ProcessingHistoryCard';
import { AvailablePlansCard } from '@/components/account/AvailablePlansCard';
import { 
  UserProfile, 
  UserSubscription, 
  ImageUsage, 
  ProcessingHistoryItem, 
  SubscriptionPlan 
} from '@/hooks/image-transformation/types';

const AccountPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usageData, setUsageData] = useState<ImageUsage | null>(null);
  const [processingHistory, setProcessingHistory] = useState<ProcessingHistoryItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        setUser(session.user as UserProfile);
        
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
            <UserProfileCard user={user} />
            
            {/* Subscription Details */}
            <SubscriptionCard 
              subscription={subscription} 
              usageData={usageData} 
            />
            
            {/* Processing History */}
            <ProcessingHistoryCard 
              processingHistory={processingHistory} 
            />
          </div>
          
          {/* Available Plans */}
          <div>
            <AvailablePlansCard 
              plans={plans} 
              currentPlanId={subscription?.subscription_plans?.id} 
            />
          </div>
        </div>
      </div>
    </AuthCheck>
  );
};

export default AccountPage;
