
import { Room } from '@/components/RoomSelector';

export interface Style {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export interface UsageStats {
  usedImages: number;
  availableImages: number;
  remainingImages: number;
}

export interface StylePrompts {
  [key: string]: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  included_images: number;
  description: string;
}
