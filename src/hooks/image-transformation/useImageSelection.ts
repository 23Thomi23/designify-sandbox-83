
import { useState } from 'react';
import { Room } from '@/components/RoomSelector';

export const useImageSelection = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('moderno');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const preview = URL.createObjectURL(file);
    setOriginalPreview(preview);
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  return {
    selectedImage,
    selectedStyle,
    selectedRoom,
    originalPreview,
    handleImageSelect,
    handleStyleSelect,
    handleRoomSelect
  };
};
