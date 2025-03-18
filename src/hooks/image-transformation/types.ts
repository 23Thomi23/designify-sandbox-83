
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

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_id: string;
  status: string;
  cancel_at_period_end: boolean;
  subscription_plans: {
    name: string;
    price: number;
    included_images: number;
  };
}

export interface ImageUsage {
  user_id: string;
  used_images: number;
  available_images: number;
}

export interface ProcessingHistoryItem {
  id: string;
  user_id: string;
  original_image: string;
  enhanced_image: string;
  processing_type: string;
  created_at: string;
}
