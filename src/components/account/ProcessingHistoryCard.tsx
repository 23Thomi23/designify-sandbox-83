
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Image, ChevronRight } from 'lucide-react';

interface ProcessingHistoryCardProps {
  processingHistory: any[];
}

export const ProcessingHistoryCard = ({ processingHistory }: ProcessingHistoryCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Processing History</CardTitle>
          <CardDescription>Your recently processed images</CardDescription>
        </div>
        <History className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {processingHistory.length > 0 ? (
          <div className="space-y-4">
            {processingHistory.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded overflow-hidden bg-muted mr-3">
                    {item.enhanced_image && (
                      <img 
                        src={item.enhanced_image} 
                        alt="Processed" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {item.processing_type === 'interior_design' ? 'Interior Design' : 'Image Processing'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="ghost" className="w-full text-sm" asChild>
              <Link to="/history">
                View Full History <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Image className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No processing history yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
