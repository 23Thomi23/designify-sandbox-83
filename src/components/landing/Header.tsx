
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export const LandingHeader = () => {
  const navigate = useNavigate();
  
  return (
    <header className="flex justify-between items-center py-4 mb-8">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 size-8 rounded-full"></div>
        <span className="text-lg font-semibold tracking-tight">EstateVision</span>
      </div>
      <Button 
        onClick={() => navigate('/auth')} 
        variant="secondary"
        className="flex items-center gap-2"
      >
        <LogIn size={16} />
        Log In
      </Button>
    </header>
  );
};
