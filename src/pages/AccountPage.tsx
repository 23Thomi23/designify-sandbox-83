
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
        const { data: subscriptionData, error: subscriptionError } = await supabase
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
          
        if (!subscriptionError && subscriptionData) {
          setSubscription(subscriptionData as UserSubscription);
        }
        
        // Fetch usage data
        const { data: consumption, error: consumptionError } = await supabase
          .from('image_consumption')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (!consumptionError && consumption) {
          setUsageData(consumption as ImageUsage);
        }
        
        // Fetch processing history
        const { data: history, error: historyError } = await supabase
          .from('processing_history')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (!historyError && history) {
          setProcessingHistory(history as ProcessingHistoryItem[]);
        } else {
          setProcessingHistory([]);
        }
        
        // Fetch available plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });
          
        if (!plansError && plansData) {
          setPlans(plansData as SubscriptionPlan[]);
        }
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
              currentPlanId={subscription?.subscription_id} 
            />
          </div>
        </div>
      </div>
    </AuthCheck>
  );
};

export default AccountPage;
