
import { HistoryItemCard, HistoryItemProps } from './HistoryItem';
import LoadingState from '../subscription/LoadingState';

interface HistoryGridProps {
  historyItems: HistoryItemProps[];
  imageUrls: Record<string, string>;
  isLoading: boolean;
}

export const HistoryGrid = ({ historyItems, imageUrls, isLoading }: HistoryGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingState message="Loading your history..." />
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/50 rounded-lg">
        <h3 className="text-xl font-medium mb-2">No history yet</h3>
        <p className="text-muted-foreground">
          Your enhanced images will appear here once you start transforming properties.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {historyItems.map((item) => (
        <HistoryItemCard 
          key={item.id}
          id={item.id}
          original_image={item.original_image}
          enhanced_image={item.enhanced_image}
          created_at={item.created_at}
          processing_type={item.processing_type}
          imageUrl={imageUrls[item.id]}
        />
      ))}
    </div>
  );
};
