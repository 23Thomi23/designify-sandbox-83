import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  onSubmit: () => void;
}

export const ApiKeyDialog = ({
  open,
  onOpenChange,
  apiKey,
  setApiKey,
  onSubmit
}: ApiKeyDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Replicate API Key</DialogTitle>
          <DialogDescription>
            Please enter your Replicate API key to continue. You can find your API key at{' '}
            <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              replicate.com/account/api-tokens
            </a>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Button 
            onClick={() => {
              if (apiKey) {
                onSubmit();
              } else {
                toast.error('Please enter an API key');
              }
            }}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};