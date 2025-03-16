
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

export const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 py-8">
      <div className="lg:w-1/2 space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Transform Your Real Estate Photos with AI
        </h1>
        <p className="text-xl text-muted-foreground">
          We enhance property photos with professional styling in seconds.
          Perfect for realtors, photographers, and property managers.
        </p>
        <div className="flex gap-4 pt-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Wand2 size={18} />
            Get Started
          </Button>
        </div>
      </div>
      <div className="lg:w-1/2">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop" 
            alt="Before transformation" 
            className="rounded-lg w-full max-w-md mx-auto shadow-md opacity-75"
          />
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2553&auto=format&fit=crop" 
            alt="After transformation" 
            className="rounded-lg w-full max-w-md mx-auto absolute -bottom-8 -right-8 shadow-xl border-4 border-background"
          />
        </div>
      </div>
    </div>
  );
};
