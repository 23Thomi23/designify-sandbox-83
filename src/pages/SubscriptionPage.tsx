
import { BackButton } from '@/components/BackButton';
import { Loader2 } from 'lucide-react';
import { useSubscriptionManagement } from '@/hooks/subscription/useSubscriptionManagement';

// Component imports
import { CurrentSubscriptionCard } from '@/components/subscription/CurrentSubscriptionCard';
import { NoSubscriptionCard } from '@/components/subscription/NoSubscriptionCard';
import { PayPerImageCard } from '@/components/subscription/PayPerImageCard';
import { PlanCard } from '@/components/subscription/PlanCard';
import { SecurePaymentInfo } from '@/components/subscription/SecurePaymentInfo';

const SubscriptionPage = () => {
  const {
    loading,
    creating,
    cancelling,
    subscription,
    availablePlans,
    handleCancelSubscription,
    handleSubscribe,
    formatDate
  } = useSubscriptionManagement();
  
  // Filter out the Professional plan
  const filteredPlans = availablePlans.filter(plan => plan.name !== "Professional");
  
  return (
    <div className="container max-w-4xl py-10">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
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
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Pay Per Image Card */}
            <PayPerImageCard 
              creating={creating}
              onSubscribe={() => handleSubscribe("", "Business")}
            />
            
            {filteredPlans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan}
                currentPlanId={subscription?.subscription_plans?.id}
                creating={creating}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
          
          <SecurePaymentInfo />
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
