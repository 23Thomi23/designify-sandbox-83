
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchAvailablePlans, updateSubscriptionTier, type SubscriptionPlan } from '@/hooks/subscription/subscription-service';

interface ChangeTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeTierDialog({ open, onOpenChange }: ChangeTierDialogProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        setUserId(session.user.id);
        
        // Fetch available plans
        const plansData = await fetchAvailablePlans();
        // Filter out the Professional plan
        const filteredPlans = plansData.filter(plan => plan.name !== "Professional");
        setPlans(filteredPlans);
        
        // Get current user's subscription
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('subscription_id')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();
          
        if (subscription) {
          setCurrentPlanId(subscription.subscription_id);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast.error('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchData();
    }
  }, [open]);

  const handleSelectTier = async (planId: string) => {
    if (!userId) return;
    
    setUpdating(true);
    try {
      await updateSubscriptionTier(userId, planId);
      setCurrentPlanId(planId);
      toast.success('Subscription updated successfully');
      onOpenChange(false);
      
      // Refresh the page to update UI
      window.location.reload();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Change Subscription Tier</DialogTitle>
          <DialogDescription>
            Select a subscription tier to change your image creation limits.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`cursor-pointer transition-all ${currentPlanId === plan.id ? 'border-primary' : 'hover:border-primary/50'}`}
                  onClick={() => !updating && handleSelectTier(plan.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{plan.name}</span>
                      {currentPlanId === plan.id && (
                        <span className="text-primary"><Check size={18} /></span>
                      )}
                    </CardTitle>
                    <p className="text-2xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                    <div className="font-medium text-sm">
                      <span className="text-green-600">{plan.included_images}</span> images per month
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Pay Per Image Option */}
              <Card 
                className={`cursor-pointer transition-all hover:border-primary/50`}
                onClick={() => !updating && handleSelectTier(plans.find(p => p.name === "Pay Per Image")?.id || "")}
              >
                <CardHeader className="pb-2">
                  <CardTitle>Pay Per Image</CardTitle>
                  <p className="text-2xl font-bold">$19.99<span className="text-sm font-normal text-muted-foreground">/pack</span></p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Perfect for occasional use</p>
                  <div className="font-medium text-sm">
                    <span className="text-green-600">25</span> images per pack
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
