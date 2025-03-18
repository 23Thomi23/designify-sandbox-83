
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AccountPage from "./pages/AccountPage";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import SubscriptionPage from "./pages/SubscriptionPage";
import History from "./pages/History";
import { AuthCheck } from "./components/AuthCheck";
import VideoPropiedad from "@/pages/VideoPropiedad";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VideoPropiedad />} />
          <Route 
            path="/dashboard" 
            element={
              <AuthCheck>
                <Index />
              </AuthCheck>
            } 
          />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/account" 
            element={
              <AuthCheck>
                <AccountPage />
              </AuthCheck>
            } 
          />
          <Route 
            path="/history" 
            element={
              <AuthCheck>
                <History />
              </AuthCheck>
            } 
          />
          <Route 
            path="/subscription" 
            element={
              <AuthCheck>
                <SubscriptionPage />
              </AuthCheck>
            } 
          />
          <Route 
            path="/subscription/success" 
            element={
              <AuthCheck>
                <SubscriptionSuccess />
              </AuthCheck>
            } 
          />
          <Route 
            path="/subscription/cancel" 
            element={
              <AuthCheck>
                <SubscriptionCancel />
              </AuthCheck>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
