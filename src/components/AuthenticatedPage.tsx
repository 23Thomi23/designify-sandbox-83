
import { Header } from '@/components/Header';
import { ImageTransformer } from '@/components/ImageTransformer';

interface AuthenticatedPageProps {
  userId: string;
}

export const AuthenticatedPage = ({ userId }: AuthenticatedPageProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 space-y-8">
        <Header />
        <ImageTransformer userId={userId} />
      </div>
    </div>
  );
};
