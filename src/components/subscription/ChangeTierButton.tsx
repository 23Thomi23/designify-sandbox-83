
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { ChangeTierDialog } from './ChangeTierDialog';

export function ChangeTierButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-1 font-normal" 
        onClick={() => setDialogOpen(true)}
      >
        <CreditCard size={14} />
        <span>Change Tier</span>
      </Button>
      
      <ChangeTierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
