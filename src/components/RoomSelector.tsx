
import { Home, BedDouble, Utensils } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export type Room = 'living room' | 'bedroom' | 'kitchen';

interface RoomSelectorProps {
  selectedRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  className?: string;
}

export const RoomSelector = ({
  selectedRoom,
  onRoomSelect,
  className,
}: RoomSelectorProps) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant={selectedRoom === 'living room' ? 'default' : 'outline'}
        onClick={() => onRoomSelect('living room')}
        className="flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        Living Room
      </Button>
      <Button
        variant={selectedRoom === 'bedroom' ? 'default' : 'outline'}
        onClick={() => onRoomSelect('bedroom')}
        className="flex items-center gap-2"
      >
        <BedDouble className="w-4 h-4" />
        Bedroom
      </Button>
      <Button
        variant={selectedRoom === 'kitchen' ? 'default' : 'outline'}
        onClick={() => onRoomSelect('kitchen')}
        className="flex items-center gap-2"
      >
        <Utensils className="w-4 h-4" />
        Kitchen
      </Button>
    </div>
  );
};
