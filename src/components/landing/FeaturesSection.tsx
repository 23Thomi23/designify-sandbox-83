
import { Image, Clock, DollarSign } from 'lucide-react';

export const FeaturesSection = () => {
  return (
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
  );
};
