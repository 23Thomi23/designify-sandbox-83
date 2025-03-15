
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, Wand2 } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 px-4">
        <header className="flex justify-between items-center py-4 mb-12">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 size-8 rounded-full"></div>
            <span className="text-lg font-semibold tracking-tight">EstateVision</span>
          </div>
          <Button onClick={() => navigate('/auth')} className="flex items-center gap-2">
            <LogIn size={16} />
            Log In
          </Button>
        </header>

        <div className="flex flex-col lg:flex-row items-center gap-12 py-12">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Transform Your Real Estate Images with AI
            </h1>
            <p className="text-xl text-muted-foreground">
              Enhance property photos with professional styling in seconds.
              Perfect for realtors, photographers, and property managers.
            </p>
            <div className="flex gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="gap-2"
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
      </div>
    </div>
  );
};
