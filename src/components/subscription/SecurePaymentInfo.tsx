
import { Shield, Lock } from 'lucide-react';

export const SecurePaymentInfo = () => {
  return (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-lg">
      <div className="flex items-center mb-2">
        <Shield className="h-5 w-5 mr-2 text-gray-500" />
        <h3 className="text-sm font-medium">Secure Payment Processing</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        All payments are securely processed through Stripe. Your payment information is never stored on our servers.
      </p>
      <div className="flex items-center mt-3">
        <Lock className="h-4 w-4 mr-1 text-gray-500" />
        <span className="text-xs text-muted-foreground">SSL encrypted payment</span>
      </div>
    </div>
  );
};
