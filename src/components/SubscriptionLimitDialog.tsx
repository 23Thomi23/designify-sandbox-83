
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  remainingImages?: number;
  usedImages?: number;
  totalImages?: number;
}

export function SubscriptionLimitDialog({ 
  open, 
  onClose, 
  plans,
  remainingImages = 0,
  usedImages = 0,
  totalImages = 0
}: SubscriptionLimitDialogProps) {
  const navigate = useNavigate();

  const handleUpgrade = (planId: string) => {
    navigate(`/subscription`);
    onClose();
  };
  
  const handleBuyPerImage = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to purchase image packs');
        return;
      }
      
      toast.info('Preparing checkout...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          userId: session.user.id,
          isPayPerImage: true,
          imagePackSize: 10
        }
      });
      
      if (error || data?.error) {
        console.error('Checkout error:', error || data?.error);
        toast.error('Failed to create checkout session');
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to process request');
    } finally {
      onClose();
    }
  };

  const isLimitReached = remainingImages <= 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isLimitReached ? "Image Limit Reached" : "Subscription Usage"}</DialogTitle>
          <DialogDescription>
            {isLimitReached 
              ? "You've reached the limit of images for your current plan. Upgrade to continue transforming more properties."
              : `You have used ${usedImages} of your ${totalImages} allowed images.`
            }
          </DialogDescription>
        </DialogHeader>
        
        {isLimitReached && (
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md mb-4">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Limited</Badge>
              <span className="text-sm text-amber-800">Upgrade now to continue using the service</span>
            </div>
          </div>
        )}

        <div className="grid gap-4 py-4">
          {/* Pay Per Image Option */}
          <div 
            className="p-4 border rounded-lg hover:border-primary transition-all cursor-pointer"
            onClick={handleBuyPerImage}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg">Pay per Image</h3>
              <span className="font-bold text-xl">$19.99</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Perfect for occasional users who need just a few transformations</p>
            <div className="text-sm font-medium">
              <span className="text-green-600">10</span> images per pack
            </div>
            <Button 
              className="w-full mt-3"
              onClick={(e) => {
                e.stopPropagation();
                handleBuyPerImage();
              }}
            >
              Buy Pack
            </Button>
          </div>
          
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className="p-4 border rounded-lg hover:border-primary transition-all cursor-pointer"
              onClick={() => handleUpgrade(plan.id)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpgrade(plan.id);
                }}
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
