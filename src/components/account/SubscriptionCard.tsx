
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard } from 'lucide-react';

interface SubscriptionCardProps {
  subscription: any;
  usageData: any;
}

export const SubscriptionCard = ({ subscription, usageData }: SubscriptionCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Subscription</CardTitle>
          <CardDescription>Current plan and usage</CardDescription>
        </div>
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{subscription.subscription_plans.name} Plan</h3>
                <p className="text-sm text-muted-foreground">${subscription.subscription_plans.price}/month</p>
              </div>
              <Badge variant={subscription.cancel_at_period_end ? "destructive" : "default"}>
                {subscription.cancel_at_period_end ? "Cancelling" : "Active"}
              </Badge>
            </div>
            
            {usageData && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage this month</span>
                  <span>{usageData.used_images} / {usageData.available_images} images</span>
                </div>
                <Progress value={(usageData.used_images / usageData.available_images) * 100} className="h-2" />
              </div>
            )}
            
            <div className="pt-2">
              <Button variant="outline" className="w-full" onClick={() => navigate('/subscription')}>
                Manage Subscription
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p>You don't have an active subscription.</p>
            <div className="pt-2">
              <Button className="w-full" onClick={() => navigate('/subscription')}>
                Choose a Plan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
