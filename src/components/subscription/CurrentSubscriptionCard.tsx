
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface CurrentSubscriptionCardProps {
  subscription: any;
  cancelling: boolean;
  onCancelSubscription: () => void;
  formatDate: (dateString: string) => string;
}

export const CurrentSubscriptionCard = ({ 
  subscription, 
  cancelling, 
  onCancelSubscription,
  formatDate
}: CurrentSubscriptionCardProps) => {
  if (!subscription) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
        <CardDescription>
          Your current subscription details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-xl font-bold">{subscription.subscription_plans.name}</h3>
            <p className="text-lg">${subscription.subscription_plans.price}/month</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription.cancel_at_period_end 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {subscription.cancel_at_period_end ? 'Cancelling' : 'Active'}
            </span>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Images per month:</span>
            <span className="font-medium">{subscription.subscription_plans.included_images}</span>
          </div>
          
          {subscription.current_period_end && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {subscription.cancel_at_period_end ? 'Access until:' : 'Next billing date:'}
              </span>
              <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
            </div>
          )}
        </div>
        
        {subscription.cancel_at_period_end && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start mt-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Your subscription is set to cancel</p>
              <p className="text-sm text-amber-700 mt-1">
                You will continue to have access to your current plan until {formatDate(subscription.current_period_end)}.
                After this date, you will be downgraded to the free plan.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!subscription.cancel_at_period_end && (
          <Button 
            variant="outline" 
            onClick={onCancelSubscription} 
            disabled={cancelling}
          >
            {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
