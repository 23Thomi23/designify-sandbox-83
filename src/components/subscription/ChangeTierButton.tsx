import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { ChangeTierDialog } from './ChangeTierDialog';
export function ChangeTierButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return <>
      <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="gap-1 font-normal text-slate-50">
        <CreditCard size={14} />
        <span>Change Tier</span>
      </Button>
      
      <ChangeTierDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>;
}