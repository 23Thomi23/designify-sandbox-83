
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LandingPage } from '@/components/LandingPage';
import { AuthenticatedPage } from '@/components/AuthenticatedPage';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };

    fetchUser();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <AuthenticatedPage userId={userId || ''} />;
};

export default Index;
