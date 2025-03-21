
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
  
  const handleUpgradeClick = (planId: string, planName?: string) => {
    if (planName === "Basic") {
      window.location.href = "https://buy.stripe.com/dR68Aj7ON14V1dSfZ0";
      return;
    }
    if (planName === "Business") {
      window.location.href = "https://buy.stripe.com/dR6aIrc5328Z09O5kl";
      return;
    }
    navigate('/subscription');
  };
  
  const handlePayPerImageClick = () => {
    window.location.href = "https://buy.stripe.com/5kA2bV0mldRHaOseUU";
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Plans</CardTitle>
        <CardDescription>Upgrade to process more images</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pay per Image option */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-sm">Pay per Image</h3>
            <div className="text-xl font-bold my-1">$19.99<span className="text-xs font-normal text-muted-foreground">/pack</span></div>
            <p className="text-xs text-muted-foreground mb-2">10 images per pack</p>
            <Button 
              variant="default"
              size="sm"
              className="w-full text-xs"
              onClick={handlePayPerImageClick}
            >
              Buy Pack
            </Button>
          </div>
          
          {plans.filter(plan => plan.name !== "Professional").map((plan) => (
            <div key={plan.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold text-sm">{plan.name}</h3>
              <div className="text-xl font-bold my-1">${plan.price}<span className="text-xs font-normal text-muted-foreground">/month</span></div>
              <p className="text-xs text-muted-foreground mb-2">{plan.included_images} images per month</p>
              <Button 
                variant={currentPlanId === plan.id ? "outline" : "default"} 
                size="sm"
                className="w-full text-xs"
                disabled={currentPlanId === plan.id}
                onClick={() => handleUpgradeClick(plan.id, plan.name)}
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
