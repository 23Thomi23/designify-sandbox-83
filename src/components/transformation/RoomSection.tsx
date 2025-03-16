
import { RoomSelector, Room } from '../RoomSelector';

interface RoomSectionProps {
  selectedRoom: Room | null;
  onRoomSelect: (room: Room) => void;
}

export const RoomSection = ({ selectedRoom, onRoomSelect }: RoomSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Select Room</h2>
      <RoomSelector
        selectedRoom={selectedRoom}
        onRoomSelect={onRoomSelect}
      />
    </div>
  );
};
