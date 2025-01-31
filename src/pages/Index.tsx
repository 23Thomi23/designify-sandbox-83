import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { StyleSelector, Style } from '@/components/StyleSelector';
import { TransformationView } from '@/components/TransformationView';
import { toast } from 'sonner';

const STYLES: Style[] = [
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Clean lines and minimal decoration',
    preview: '/placeholder.svg'
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Light woods and natural elements',
    preview: '/placeholder.svg'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw materials and exposed elements',
    preview: '/placeholder.svg'
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    description: 'Current trends and modern comfort',
    preview: '/placeholder.svg'
  }
];

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
      // Here we'll integrate with Replicate's API
      // For now, we'll simulate the transformation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransformedImage(originalPreview);
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
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            AI Interior Design
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your space with AI-powered interior design. Upload a photo and let our AI suggest beautiful transformations.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Upload Image</h2>
              <ImageUploader onImageSelect={handleImageSelect} />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Select Style</h2>
              <StyleSelector
                styles={STYLES}
                selectedStyle={selectedStyle}
                onStyleSelect={handleStyleSelect}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <TransformationView
              originalImage={originalPreview}
              transformedImage={transformedImage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;