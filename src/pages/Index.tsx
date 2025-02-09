
import { useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { ApiKeyDialog } from '@/components/ApiKeyDialog';
import { TransformationContainer } from '@/components/TransformationContainer';
import { Style } from '@/components/StyleSelector';
import { Room } from '@/components/RoomSelector';
import { supabase } from '@/integrations/supabase/client';

const STYLES: Style[] = [
  {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Diseño limpio con muebles funcionales',
    preview: 'https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151'
  },
  {
    id: 'moderno',
    name: 'Moderno',
    description: 'Diseño elegante con contrastes audaces',
    preview: 'https://images.unsplash.com/photo-1500673922987-e212871fec22'
  },
  {
    id: 'contemporaneo',
    name: 'Contemporáneo',
    description: 'Acabados elegantes y muebles ergonómicos',
    preview: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Materiales expuestos y acentos metálicos',
    preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
  },
  {
    id: 'rustico',
    name: 'Rústico',
    description: 'Tonos tierra y elementos de madera',
    preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
  }
];

const STYLE_PROMPTS = {
  minimalista: "Minimalist style with clean lines, functional furniture, and soft neutral tones.",
  moderno: "Modern design with sleek furniture, bold contrasts, and integrated lighting.",
  contemporaneo: "Contemporary style with elegant finishes, ergonomic furniture, and soft lighting.",
  industrial: "Industrial look with exposed materials, metal accents, and rustic textures.",
  rustico: "Rustic design with earthy tones, wood elements, and cozy decor."
};

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const preview = URL.createObjectURL(file);
    setOriginalPreview(preview);
    setTransformedImage(null);
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleTransformation = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    if (!selectedRoom) {
      toast.error('Please select a room type');
      return;
    }

    setIsLoading(true);
    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });

      const roomPrefix = selectedRoom ? `A ${selectedRoom} with ` : '';
      const stylePrompt = STYLE_PROMPTS[selectedStyle as keyof typeof STYLE_PROMPTS];
      const fullPrompt = `${roomPrefix}${stylePrompt}`;

      const { data: functionData, error: functionError } = await supabase.functions.invoke('replicate', {
        body: {
          image: base64Image,
          prompt: fullPrompt,
        }
      });

      if (functionError) {
        throw functionError;
      }

      if (functionData.error) {
        throw new Error(functionData.error);
      }

      setTransformedImage(functionData.output);
      toast.success('Transformation complete!');
    } catch (error) {
      toast.error('Failed to transform image');
      console.error('Transformation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 space-y-8">
        <Header />
        <TransformationContainer
          selectedImage={selectedImage}
          selectedStyle={selectedStyle}
          selectedRoom={selectedRoom}
          originalPreview={originalPreview}
          transformedImage={transformedImage}
          isLoading={isLoading}
          styles={STYLES}
          onImageSelect={handleImageSelect}
          onStyleSelect={handleStyleSelect}
          onRoomSelect={handleRoomSelect}
          onTransform={handleTransformation}
        />
      </div>
    </div>
  );
};

export default Index;
