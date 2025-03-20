
import { Button } from '../ui/button';
import { Wand2, RefreshCw, AlertCircle } from 'lucide-react';

interface TransformButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
  remainingImages?: number;
}

export const TransformButton = ({
  isLoading,
  disabled,
  onClick,
  remainingImages
}: TransformButtonProps) => {
  const noImagesLeft = remainingImages === 0;
  
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled || isLoading || noImagesLeft} 
      className={`w-full ${noImagesLeft ? 'bg-gray-500 hover:bg-gray-500' : ''}`}
      variant={noImagesLeft ? "secondary" : "default"}
    >
      {isLoading ? (
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
      ) : noImagesLeft ? (
        <AlertCircle className="mr-2 h-4 w-4" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      {isLoading ? 'Processing...' : noImagesLeft ? 'No Images Left' : 'Transform Room'}
    </Button>
  );
};
