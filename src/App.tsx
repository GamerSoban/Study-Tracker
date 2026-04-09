import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { lazy, Suspense, useEffect } from "react";
import { syncWidgetData } from "@/lib/widget";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";

const Index = lazy(() => import("./pages/Index"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Settings = lazy(() => import("./pages/Settings"));
const SessionDetail = lazy(() => import("./pages/SessionDetail"));
const AddSession = lazy(() => import("./pages/AddSession"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Account = lazy(() => import("./pages/Account"));

const queryClient = new QueryClient();

function BackButtonHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cleanup: (() => void) | undefined;
    import('@capacitor/app').then(({ App }) => {
      const listener = App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          navigate(-1);
        } else {
          App.exitApp();
        }
      });
      cleanup = () => { listener.then(h => h.remove()); };
    });
    return () => { cleanup?.(); };
  }, [navigate]);
  return null;
}

const App = () => {
  useEffect(() => {
    syncWidgetData();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') syncWidgetData();
    };
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
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <BackButtonHandler />
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/sessions" element={<Sessions />} />
                  <Route path="/session/:id" element={<SessionDetail />} />
                  <Route path="/add-session" element={<AddSession />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <BottomNav />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
