
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutActionsProps {
  onCheckout: () => Promise<void>;
  loading: boolean;
  disabled: boolean;
}

const CheckoutActions = ({ onCheckout, loading, disabled }: CheckoutActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button 
        className="w-full" 
        onClick={onCheckout}
        disabled={loading || disabled}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Processing...' : 'Proceed to Payment'}
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
