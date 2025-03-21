
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PayPerImageCardProps {
  creating: boolean;
  onSubscribe: () => void;
}

export const PayPerImageCard = ({ creating, onSubscribe }: PayPerImageCardProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyPack = async () => {
    setIsProcessing(true);
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
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay per Image</CardTitle>
        <div className="text-2xl font-bold">$19.99<span className="text-sm font-normal text-muted-foreground">/pack</span></div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">Perfect for occasional users who need just a few transformations</p>
        <ul className="space-y-2 mt-4">
          <li className="flex items-center text-sm">
            <span className="mr-2">✓</span>
            <span>10 images per pack</span>
          </li>
          <li className="flex items-center text-sm">
            <span className="mr-2">✓</span>
            <span>High-quality AI transformations</span>
          </li>
          <li className="flex items-center text-sm">
            <span className="mr-2">✓</span>
            <span>No subscription required</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleBuyPack}
          disabled={isProcessing || creating}
        >
          {(isProcessing || creating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Buy Pack
        </Button>
      </CardFooter>
    </Card>
  );
};
