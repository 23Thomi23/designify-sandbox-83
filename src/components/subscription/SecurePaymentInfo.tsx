
import { CreditCard } from 'lucide-react';

export const SecurePaymentInfo = () => {
  return (
    <div className="bg-muted p-4 rounded-lg mt-6">
      <div className="flex items-start">
        <CreditCard className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
        <div>
          <h3 className="font-medium">Secure Payments</h3>
          <p className="text-sm text-muted-foreground mt-1">
            All payments are processed securely through Stripe. We do not store your payment information.
          </p>
        </div>
      </div>
    </div>
  );
};
