import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
export const WhyChooseSection = () => {
  const navigate = useNavigate();
  return <div className="py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12 bg-gray-950">
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
        <Button onClick={() => navigate('/auth')} size="lg" className="gap-2 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Start Transforming Images
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>;
};