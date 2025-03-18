
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutActionsProps {
  onCheckout: () => Promise<void>;
  loading: boolean;
  disabled: boolean;
  planPrice: number;
}

const CheckoutActions = ({ onCheckout, loading, disabled, planPrice }: CheckoutActionsProps) => {
  const navigate = useNavigate();
  
  // Determine the appropriate button text based on whether it's a free plan
  const buttonText = planPrice === 0 
    ? (loading ? 'Activating...' : 'Activate Free Plan') 
    : (loading ? 'Processing...' : 'Proceed to Payment');
  
  return (
    <>
      <Button 
        className="w-full" 
        onClick={onCheckout}
        disabled={loading || disabled}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonText}
      </Button>
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => navigate('/subscription')}
      >
        Cancel
      </Button>
    </>
  );
};

export default CheckoutActions;
