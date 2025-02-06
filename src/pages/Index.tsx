import { useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { ApiKeyDialog } from '@/components/ApiKeyDialog';
import { TransformationContainer } from '@/components/TransformationContainer';
import { Style } from '@/components/StyleSelector';
import { supabase } from '@/integrations/supabase/client';

const STYLES: Style[] = [
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Clean lines and minimal decoration',
    preview: 'https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151'
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Light woods and natural elements',
    preview: 'https://images.unsplash.com/photo-1500673922987-e212871fec22'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw materials and exposed elements',
    preview: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04'
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    description: 'Current trends and modern comfort',
    preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
  }
];

const STYLE_PROMPTS = {
  modern: "modern minimalist interior design, clean lines, simple decoration",
  scandinavian: "scandinavian interior design, light wood, natural elements",
  industrial: "industrial interior design, raw materials, exposed elements",
  contemporary: "contemporary interior design, current trends, modern comfort"
};

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
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
    if (selectedImage) {
      handleTransformation();
    }
  };

  const handleTransformation = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsLoading(true);
    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });

      const { data: functionData, error: functionError } = await supabase.functions.invoke('replicate', {
        body: {
          image: base64Image,
          prompt: STYLE_PROMPTS[selectedStyle as keyof typeof STYLE_PROMPTS],
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
          originalPreview={originalPreview}
          transformedImage={transformedImage}
          isLoading={isLoading}
          styles={STYLES}
          onImageSelect={handleImageSelect}
          onStyleSelect={handleStyleSelect}
        />
      </div>
    </div>
  );
};

export default Index;