import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { ApiKeyDialog } from '@/components/ApiKeyDialog';
import { TransformationContainer } from '@/components/TransformationContainer';
import { Style } from '@/components/StyleSelector';
import { Room } from '@/components/RoomSelector';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionLimitDialog } from '@/components/SubscriptionLimitDialog';

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
  minimalista: "A minimalist style with clean lines, functional furniture, and soft neutral tones.",
  moderno: "A modern style with clean lines, functional furniture, and soft neutral tones.",
  contemporaneo: "A contemporary style with clean lines, functional furniture, and soft neutral tones.",
  rustico: "A rustic style with clean lines, functional furniture, and soft neutral tones.",
  industrial: "An industrial style with clean lines, functional furniture, and soft neutral tones."
};

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('moderno');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };

    fetchUser();
  }, []);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const preview = URL.createObjectURL(file);
    setOriginalPreview(preview);
    setTransformedImage(null);
    setError(null);
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    setError(null);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setError(null);
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
    setProcessingPhase('Analyzing your space...');
    setProcessingProgress(10);
    setError(null);
    setTransformedImage(null);
    
    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });

      const roomPrefix = selectedRoom ? `A ${selectedRoom} with ` : '';
      const stylePrompt = STYLE_PROMPTS[selectedStyle as keyof typeof STYLE_PROMPTS];
      const fullPrompt = `${roomPrefix}${stylePrompt} High quality, photorealistic.`;

      setProcessingPhase('Applying design style...');
      setProcessingProgress(25);
      
      console.log('Calling Replicate function with:', { 
        prompt: fullPrompt, 
        imageSize: encodeURI(base64Image).split(',').length 
      });
      
      const response = await supabase.functions.invoke('replicate', {
        body: {
          image: base64Image,
          prompt: fullPrompt,
          userId: userId
        }
      });

      console.log("Replicate function response:", response);

      if (response.data && response.data.limitExceeded) {
        setError('You have reached your subscription limit');
        const { data: plans } = await supabase
          .from('subscription_plans' as any)
          .select('*')
          .order('price', { ascending: true });
          
        if (plans) {
          setSubscriptionData(plans);
          setShowLimitDialog(true);
        }
        return;
      }

      if (response.error) {
        console.error('Supabase function error:', response.error);
        setError(`Service error: ${response.error.message || 'Failed to process image'}. Please try again later.`);
        toast.error('Failed to transform image');
        return;
      }

      if (response.data && response.data.error) {
        console.error('Replicate API error:', response.data.error);
        setError(`API error: ${response.data.error || 'Failed to process image'}. Please try a different image.`);
        toast.error('Failed to transform image');
        return;
      }

      setProcessingPhase('Enhancing with AI upscaler...');
      setProcessingProgress(75);

      if (!response.data || !response.data.output) {
        console.error('No output received from API');
        setError('Error: No image was returned from the service. Please try a different image.');
        toast.error('Failed to transform image');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress(100);
      
      setTransformedImage(response.data.output);
      toast.success('Transformation complete with enhanced clarity!');
    } catch (error: any) {
      console.error('Transformation error:', error);
      setError(`Error: ${error?.message || 'An unexpected error occurred'}. Please try again.`);
      toast.error('Failed to transform image');
    } finally {
      setIsLoading(false);
      setProcessingPhase(null);
      setProcessingProgress(0);
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
          processingPhase={processingPhase}
          processingProgress={processingProgress}
          error={error}
          styles={STYLES}
          onImageSelect={handleImageSelect}
          onStyleSelect={handleStyleSelect}
          onRoomSelect={handleRoomSelect}
          onTransform={handleTransformation}
        />
      </div>
      {showLimitDialog && subscriptionData && (
        <SubscriptionLimitDialog 
          open={showLimitDialog}
          onClose={() => setShowLimitDialog(false)}
          plans={subscriptionData}
        />
      )}
    </div>
  );
};

export default Index;
