import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { useEffect } from "react";
import { syncWidgetData } from "@/lib/widget";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Sessions from "./pages/Sessions";
import Settings from "./pages/Settings";
import SessionDetail from "./pages/SessionDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Sync widget on app load
    syncWidgetData();

    // Sync widget when app goes to background (user "closes" or switches away)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncWidgetData();
      }
    };

    // Also sync on pause (Capacitor lifecycle)
    const handlePause = () => syncWidgetData();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('pause', handlePause);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/session/:id" element={<SessionDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
