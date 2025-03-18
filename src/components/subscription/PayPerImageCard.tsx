
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PayPerImageCardProps {
  creating: boolean;
  onSubscribe: () => void;
}

export const PayPerImageCard = ({ creating, onSubscribe }: PayPerImageCardProps) => {
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
          onClick={onSubscribe}
          disabled={creating}
        >
          {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Buy Pack
        </Button>
      </CardFooter>
    </Card>
  );
};
