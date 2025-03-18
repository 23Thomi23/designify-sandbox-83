
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AccountMenu } from '@/components/AccountMenu';
import { History, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { RemainingImagesIndicator } from '@/components/account/RemainingImagesIndicator';

export function Header() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user subscription
          const { data: subscriptionData, error } = await supabase
            .from('user_subscriptions')
            .select(`
              *,
              subscription_plans:subscription_id (
                name
              )
            `)
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .single();
            
          if (!error && subscriptionData) {
            setSubscription(subscriptionData);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);

  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 size-8 rounded-full"></div>
          <span className="text-lg font-semibold tracking-tight">EstateVision</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <RemainingImagesIndicator />
        
        <Link to="/history">
          <Button variant="ghost" className="flex items-center gap-2">
            <History size={16} />
            History
          </Button>
        </Link>
        
        <Link to="/subscription">
          <Button variant="ghost" className="flex items-center gap-2">
            <CreditCard size={16} />
            {!loading && subscription ? (
              <span className="flex items-center">
                Plan: <Badge variant="outline" className="ml-1">{subscription.subscription_plans.name}</Badge>
              </span>
            ) : (
              'Subscription'
            )}
          </Button>
        </Link>
        
        <AccountMenu />
      </div>
    </header>
  );
}
