
import { CheckCircle } from 'lucide-react';

export const SaveTimeSection = () => {
  return (
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
  );
};
