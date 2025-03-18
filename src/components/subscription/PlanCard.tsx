
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    price: number;
    included_images: number;
    description: string;
  };
  currentPlanId?: string;
  creating: boolean;
  onSubscribe: (planId: string, planName: string) => void;
}

export const PlanCard = ({ plan, currentPlanId, creating, onSubscribe }: PlanCardProps) => {
  const isCurrentPlan = currentPlanId === plan.id;

  return (
    <Card className={isCurrentPlan ? 'border-primary' : ''}>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <div className="text-2xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        <ul className="space-y-2 mt-4">
          <li className="flex items-center text-sm">
            <span className="mr-2">✓</span>
            <span>{plan.included_images} images per month</span>
          </li>
          <li className="flex items-center text-sm">
            <span className="mr-2">✓</span>
            <span>High-quality AI transformations</span>
          </li>
          <li className="flex items-center text-sm">
            <span className="mr-2">✓</span>
            <span>Cancel anytime</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        {isCurrentPlan ? (
          <Button className="w-full" disabled>
            Current Plan
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => onSubscribe(plan.id, plan.name)}
            disabled={creating}
          >
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {currentPlanId ? 'Switch Plan' : plan.price === 0 ? 'Activate Free Plan' : 'Subscribe'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
