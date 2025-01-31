import { useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { ApiKeyDialog } from '@/components/ApiKeyDialog';
import { TransformationContainer } from '@/components/TransformationContainer';
import { Style } from '@/components/StyleSelector';

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
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

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

    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });

      // Updated to use proxy URL
      const response = await fetch('/api/replicate/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
          input: {
            image: base64Image,
            prompt: STYLE_PROMPTS[selectedStyle as keyof typeof STYLE_PROMPTS],
            guidance_scale: 15,
            negative_prompt: "lowres, watermark, banner, logo, watermark, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly, upholstered walls, fabric walls, plush walls, mirror, mirrored, functional, realistic",
            prompt_strength: 0.8,
            num_inference_steps: 50
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start transformation');
      }

      const prediction = await response.json();
      
      // Updated to use proxy URL for polling
      const pollInterval = setInterval(async () => {
        const pollResponse = await fetch(`/api/replicate/v1/predictions/${prediction.id}`, {
          headers: {
            'Authorization': `Token ${apiKey}`,
          },
        });
        
        const result = await pollResponse.json();
        
        if (result.status === 'succeeded') {
          clearInterval(pollInterval);
          setTransformedImage(result.output);
          toast.success('Transformation complete!');
          setIsLoading(false);
        } else if (result.status === 'failed') {
          clearInterval(pollInterval);
          throw new Error('Transformation failed');
        }
      }, 1000);

    } catch (error) {
      toast.error('Failed to transform image');
      console.error('Transformation error:', error);
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

      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        apiKey={apiKey}
        setApiKey={setApiKey}
        onSubmit={() => {
          setShowApiKeyDialog(false);
          handleTransformation();
        }}
      />
    </div>
  );
};

export default Index;