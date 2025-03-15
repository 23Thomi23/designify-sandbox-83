
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AccountMenu } from '@/components/AccountMenu';
import { History } from 'lucide-react';

export function Header() {
  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 size-8 rounded-full"></div>
          <span className="text-lg font-semibold tracking-tight">EstateVision</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/history">
          <Button variant="ghost" className="flex items-center gap-2">
            <History size={16} />
            History
          </Button>
        </Link>
        <AccountMenu />
      </div>
    </header>
  );
}
