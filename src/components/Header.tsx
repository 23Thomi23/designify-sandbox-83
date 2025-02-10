
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
      console.error("Error:", error);
    }
  };

  return (
    <header className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent sm:text-5xl">
            AI Interior Design
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Transform your space with AI-powered interior design. Upload a photo and let our AI suggest beautiful transformations.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
};
