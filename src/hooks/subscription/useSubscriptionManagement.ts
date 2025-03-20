
import { useSubscriptionData } from './useSubscriptionData';
import { useSubscriptionActions } from './useSubscriptionActions';
import { formatSubscriptionDate } from './subscription-utils';

export const useSubscriptionManagement = () => {
  const { 
    loading, 
    subscription, 
    availablePlans, 
    setSubscription 
  } = useSubscriptionData();
  
  const { 
    creating, 
    cancelling, 
    handleCancelSubscription, 
    handleSubscribe 
  } = useSubscriptionActions(subscription, setSubscription, availablePlans);

  return {
    loading,
    creating,
    cancelling,
    subscription,
    availablePlans,
    handleCancelSubscription,
    handleSubscribe,
    formatDate: formatSubscriptionDate
  };
};
