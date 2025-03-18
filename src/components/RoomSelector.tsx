
import { Home, BedDouble, Utensils, Bath } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export type Room = 'living room' | 'bedroom' | 'kitchen' | 'bathroom';

interface RoomSelectorProps {
  selectedRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  className?: string;
}

export const RoomSelector = ({
  selectedRoom,
  onRoomSelect,
  className
}: RoomSelectorProps) => {
  return <div className={cn("flex flex-wrap gap-2", className)}>
      <Button variant={selectedRoom === 'living room' ? 'default' : 'outline'} onClick={() => onRoomSelect('living room')} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600">
        <Home className="w-4 h-4" />
        Living Room
      </Button>
      <Button variant={selectedRoom === 'bedroom' ? 'default' : 'outline'} onClick={() => onRoomSelect('bedroom')} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600">
        <BedDouble className="w-4 h-4" />
        Bedroom
      </Button>
      <Button variant={selectedRoom === 'kitchen' ? 'default' : 'outline'} onClick={() => onRoomSelect('kitchen')} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600">
        <Utensils className="w-4 h-4" />
        Kitchen
      </Button>
      <Button variant={selectedRoom === 'bathroom' ? 'default' : 'outline'} onClick={() => onRoomSelect('bathroom')} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600">
        <Bath className="w-4 h-4" />
        Bathroom
      </Button>
    </div>;
};
