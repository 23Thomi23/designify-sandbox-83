
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionPlan } from '@/hooks/image-transformation/types';

interface AvailablePlansCardProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string;
}

export const AvailablePlansCard = ({ plans, currentPlanId }: AvailablePlansCardProps) => {
  const navigate = useNavigate();
  
  const handleUpgradeClick = (planId: string) => {
    navigate('/subscription');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Plans</CardTitle>
        <CardDescription>Upgrade to process more images</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm">{plan.name}</h3>
              <div className="text-xl font-bold my-1">${plan.price}<span className="text-xs font-normal text-muted-foreground">/month</span></div>
              <p className="text-xs text-muted-foreground mb-2">{plan.included_images} images per month</p>
              <Button 
                variant={currentPlanId === plan.id ? "outline" : "default"} 
                size="sm"
                className="w-full text-xs"
                disabled={currentPlanId === plan.id}
                onClick={() => handleUpgradeClick(plan.id)}
              >
                {currentPlanId === plan.id ? "Current Plan" : "Select"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
