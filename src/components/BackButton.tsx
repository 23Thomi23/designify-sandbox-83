
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show on the landing pages
  if (location.pathname === '/' || location.pathname === '/videopropiedad') {
    return null;
  }
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="flex items-center gap-1 mb-4" 
      onClick={() => navigate('/dashboard')}
    >
      <ChevronLeft className="h-4 w-4" />
      Back to Dashboard
    </Button>
  );
};
