
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="text-center py-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      <p className="mt-2">{message}</p>
    </div>
  );
};

export default LoadingState;
