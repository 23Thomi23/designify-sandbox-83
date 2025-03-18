
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface ErrorDisplayProps {
  error: string | null | undefined;
  details?: string | null;
}

export const ErrorDisplay = ({ error, details }: ErrorDisplayProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertDescription>
        <div className="space-y-2">
          <p>{error}</p>
          {details && (
            <details className="mt-1 text-xs">
              <summary>Technical Details</summary>
              <pre className="mt-1 whitespace-pre-wrap break-all">{details}</pre>
            </details>
          )}
          <p className="text-xs opacity-80">
            Try again with a different image or style. If the problem persists, the service might be unavailable.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
