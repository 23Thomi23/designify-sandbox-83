
import { useIsMobile } from '@/hooks/use-mobile';
import { Header } from '@/components/Header';
import { ImageTransformer } from '@/components/ImageTransformer';

interface AuthenticatedPageProps {
  userId: string;
}

export const AuthenticatedPage = ({ userId }: AuthenticatedPageProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={`container mx-auto ${isMobile ? 'px-4 py-4' : 'py-8'} space-y-6 max-w-7xl`}>
        <Header />
        <main>
          <div className={`rounded-xl ${isMobile ? '' : 'p-6 bg-card/30 backdrop-blur-sm border border-border/40 shadow-lg'}`}>
            <ImageTransformer userId={userId} />
          </div>
        </main>
      </div>
    </div>
  );
};
