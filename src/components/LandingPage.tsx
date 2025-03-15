
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, Wand2, Image, Clock, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-6 px-4">
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

        <div className="py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-secondary/10 p-6 rounded-xl flex flex-col items-center text-center space-y-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Image size={24} />
            </div>
            <h3 className="text-xl font-bold">Professional Quality</h3>
            <p className="text-muted-foreground">Transform ordinary property photos into stunning, professional-grade images</p>
          </div>
          
          <div className="bg-secondary/10 p-6 rounded-xl flex flex-col items-center text-center space-y-4">
            <div className="bg-purple-100 p-3 rounded-full text-purple-600">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-bold">Record Time</h3>
            <p className="text-muted-foreground">Get your enhanced images in seconds, not days</p>
          </div>
          
          <div className="bg-secondary/10 p-6 rounded-xl flex flex-col items-center text-center space-y-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <DollarSign size={24} />
            </div>
            <h3 className="text-xl font-bold">Cost Effective</h3>
            <p className="text-muted-foreground">Save money while improving the perception of your properties</p>
          </div>
        </div>

        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">1</div>
              <h3 className="text-xl font-bold">Upload Your Photo</h3>
              <p className="text-muted-foreground">Select any property photo you want to enhance</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">2</div>
              <h3 className="text-xl font-bold">Choose Your Style</h3>
              <p className="text-muted-foreground">Select from various professional design styles</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">3</div>
              <h3 className="text-xl font-bold">Get Results</h3>
              <p className="text-muted-foreground">Download your professionally enhanced image</p>
            </div>
          </div>
        </div>

        <div className="py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Why Choose EstateVision?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <p>96% improvement in visual appeal</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <p>51+ design styles to choose from</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <p>Save hours of editing time</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <p>Increase property viewing requests</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg"
              className="gap-2 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Start Transforming Images
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>

        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Save Time & Money</h2>
              <p className="text-lg text-muted-foreground mb-8">
                EstateVision helps you create professional-looking property photos in seconds, 
                eliminating the need for expensive photographers or time-consuming editing.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 mt-1" size={20} />
                  <p>No design skills required</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 mt-1" size={20} />
                  <p>Instant results, no waiting</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 mt-1" size={20} />
                  <p>Fraction of the cost of professional photography</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=2670&auto=format&fit=crop" 
                alt="Before" 
                className="rounded-lg shadow-md"
              />
              <img 
                src="https://images.unsplash.com/photo-1600607687644-c7171b62ccd2?q=80&w=2670&auto=format&fit=crop" 
                alt="After" 
                className="rounded-lg shadow-md"
              />
              <img 
                src="https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2670&auto=format&fit=crop" 
                alt="Before" 
                className="rounded-lg shadow-md"
              />
              <img 
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2670&auto=format&fit=crop" 
                alt="After" 
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
};
