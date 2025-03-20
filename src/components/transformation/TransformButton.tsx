
import { Button } from '../ui/button';
import { Wand2, RefreshCw, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const noImagesLeft = remainingImages === 0;
  
  const handleClick = async () => {
    if (noImagesLeft) {
      toast.error('You have no transformations left. Please upgrade your plan to continue.');
      return;
    }
    
    if (isLoading || disabled || isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await onClick();
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Button 
      onClick={handleClick} 
      disabled={disabled || isLoading || isProcessing || noImagesLeft} 
      className={`w-full ${noImagesLeft ? 'bg-gray-500 hover:bg-gray-500' : ''}`}
      variant={noImagesLeft ? "secondary" : "default"}
    >
      {isLoading || isProcessing ? (
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
      ) : noImagesLeft ? (
        <AlertCircle className="mr-2 h-4 w-4" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      {isLoading || isProcessing ? 'Processing...' : noImagesLeft ? 'No Images Left' : 'Transform Room'}
    </Button>
  );
};
