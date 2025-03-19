
import { useSubscriptionData } from './useSubscriptionData';
import { useSubscriptionActions } from './useSubscriptionActions';
import { formatSubscriptionDate } from './subscription-utils';

export const useSubscriptionManagement = () => {
  const { 
    loading, 
    subscription, 
    setSubscription, 
    availablePlans, 
    error 
  } = useSubscriptionData();

  const { 
    creating, 
    cancelling, 
    handleCancelSubscription, 
    handleSubscribe 
  } = useSubscriptionActions({ setSubscription });

  return {
    loading,
    creating,
    cancelling,
    subscription,
    availablePlans,
    handleCancelSubscription: () => subscription ? handleCancelSubscription(subscription) : undefined,
    handleSubscribe: (planId: string, planName: string) => handleSubscribe(planId, planName, availablePlans),
    formatDate: formatSubscriptionDate,
    error
  };
};
