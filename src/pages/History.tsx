
import { Header } from '@/components/Header';
import { BackButton } from '@/components/BackButton';
import { Clock } from 'lucide-react';
import { useHistoryData } from '@/hooks/useHistoryData';
import { HistoryGrid } from '@/components/history/HistoryGrid';

const History = () => {
  const { historyItems, isLoading, imageUrls } = useHistoryData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 space-y-8">
        <Header />
        <BackButton />
        
        <div>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Your Enhancement History
          </h1>
          
          <HistoryGrid 
            historyItems={historyItems}
            imageUrls={imageUrls}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default History;
