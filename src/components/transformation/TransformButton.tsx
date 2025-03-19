
import { Button } from '../ui/button';
import { Wand2, RefreshCw } from 'lucide-react';

interface TransformButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const TransformButton = ({
  isLoading,
  disabled,
  onClick
}: TransformButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled || isLoading} 
      className="w-full"
    >
      {isLoading ? (
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      {isLoading ? 'Processing...' : 'Transform Room'}
    </Button>
  );
};
