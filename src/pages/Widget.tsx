import { Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Widget = () => {
  const handleInstall = () => {
    const deferredPrompt = (window as any).__pwaInstallPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else {
      alert("To install: open browser menu → 'Add to Home Screen' or 'Install App'");
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1">Home Screen Widget</h1>
      <p className="text-sm text-muted-foreground mb-6">Get your stats on your home screen</p>

      <div className="glass-card p-6 space-y-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
          <Smartphone className="w-7 h-7 text-primary" />
        </div>
        
        <h2 className="text-lg font-display font-semibold text-center">Install the App First</h2>
        
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          Install this app on your Android device to access it like a native app. 
          Android widgets require a native wrapper — here's how to get started:
        </p>

        <Button onClick={handleInstall} className="w-full gap-2 rounded-xl h-12 text-base font-semibold">
          <Download className="w-5 h-5" />
          Install App
        </Button>

        <div className="border-t border-border pt-4 space-y-3">
          <h3 className="font-display font-semibold text-sm">For a Home Screen Widget:</h3>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Install this app to your home screen using the button above</li>
            <li>Use Android's built-in "shortcut" widget to pin the app</li>
            <li>For a data-displaying widget, you can use apps like <strong className="text-foreground">KWGT</strong> or <strong className="text-foreground">Tasker</strong> to read your study data</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Widget;
