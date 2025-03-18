
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const NoSubscriptionCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Active Subscription</CardTitle>
        <CardDescription>
          You don't have an active subscription plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Choose from one of our subscription plans below to upgrade your account and 
          get access to more features.
        </p>
      </CardContent>
    </Card>
  );
};
