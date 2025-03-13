
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  included_images: number;
  description: string;
}

interface SubscriptionLimitDialogProps {
  open: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
}

export function SubscriptionLimitDialog({ open, onClose, plans }: SubscriptionLimitDialogProps) {
  const navigate = useNavigate();

  const handleUpgrade = (planId: string) => {
    navigate(`/subscription/checkout?plan=${planId}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Image Limit Reached</DialogTitle>
          <DialogDescription>
            You've reached the limit of images for your current plan. Upgrade to continue transforming more properties.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className="p-4 border rounded-lg hover:border-primary transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{plan.name}</h3>
                <span className="font-bold text-xl">${plan.price}/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
              <div className="text-sm font-medium">
                <span className="text-green-600">{plan.included_images}</span> images per month
              </div>
              <Button 
                className="w-full mt-3" 
                onClick={() => handleUpgrade(plan.id)}
              >
                Upgrade to {plan.name}
              </Button>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
