
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const CallToAction = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-12 text-center">
      <h2 className="text-3xl font-bold mb-8">Ready to Transform Your Property Images?</h2>
      <Button 
        onClick={() => navigate('/auth')} 
        size="lg"
        className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
      >
        <Wand2 size={18} />
        Get Started Now
      </Button>
    </div>
  );
};
