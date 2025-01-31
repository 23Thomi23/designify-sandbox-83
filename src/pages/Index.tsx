import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { StyleSelector, Style } from '@/components/StyleSelector';
import { TransformationView } from '@/components/TransformationView';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });

      // Make API call to Replicate
      const response = await fetch('https://api.replicate.com/v1/predictions', {
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
      
      // Poll for results
      const pollInterval = setInterval(async () => {
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
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
              <h-xl font-semibold">Upload Image</h2>
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

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Replicate API Key</DialogTitle>
            <DialogDescription>
              Please enter your Replicate API key to continue. You can find your API key at{' '}
              <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                replicate.com/account/api-tokens
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button 
              onClick={() => {
                if (apiKey) {
                  setShowApiKeyDialog(false);
                  handleTransformation();
                } else {
                  toast.error('Please enter an API key');
                }
              }}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;