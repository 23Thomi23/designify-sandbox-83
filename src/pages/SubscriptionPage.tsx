
import { BackButton } from '@/components/BackButton';
import { Loader2 } from 'lucide-react';
import { useSubscriptionManagement } from '@/hooks/subscription/useSubscriptionManagement';

// Component imports
import { CurrentSubscriptionCard } from '@/components/subscription/CurrentSubscriptionCard';
import { NoSubscriptionCard } from '@/components/subscription/NoSubscriptionCard';
import { PayPerImageCard } from '@/components/subscription/PayPerImageCard';
import { PlanCard } from '@/components/subscription/PlanCard';
import { SecurePaymentInfo } from '@/components/subscription/SecurePaymentInfo';
import LoadingState from '@/components/subscription/LoadingState';
import { toast } from 'sonner';
import { useEffect } from 'react';

const SubscriptionPage = () => {
  const {
    loading,
    creating,
    cancelling,
    subscription,
    availablePlans,
    handleCancelSubscription,
    handleSubscribe,
    formatDate,
    error
  } = useSubscriptionManagement();
  
  useEffect(() => {
    if (error) {
      toast.error('Error loading subscription data', {
        description: 'Please try again later or contact support.'
      });
    }
  }, [error]);
  
  return (
    <div className="container max-w-4xl py-10">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      
      {loading ? (
        <LoadingState message="Loading subscription information..." />
      ) : (
        <div className="space-y-8">
          {subscription ? (
            <CurrentSubscriptionCard 
              subscription={subscription}
              cancelling={cancelling}
              onCancelSubscription={handleCancelSubscription}
              formatDate={formatDate}
            />
          ) : (
            <NoSubscriptionCard />
          )}
          
          <h2 className="text-2xl font-bold mt-10">Available Plans</h2>
          
          {availablePlans.length === 0 ? (
            <div className="p-6 text-center border rounded-lg bg-gray-50">
              <p className="text-muted-foreground">No subscription plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Pay Per Image Card */}
              <PayPerImageCard 
                creating={creating}
                onSubscribe={() => handleSubscribe("", "Business")}
              />
              
              {availablePlans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan}
                  currentPlanId={subscription?.subscription_plans?.id}
                  creating={creating}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          )}
          
          <SecurePaymentInfo />
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
