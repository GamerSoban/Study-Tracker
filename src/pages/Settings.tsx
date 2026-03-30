import { useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Monitor, Flame, Snowflake, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportSessions, importSessions } from "@/lib/dataTransfer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const themes = [
  { value: "dark" as const, label: "Dark", icon: Moon, desc: "Deep & immersive" },
  { value: "light" as const, label: "Light", icon: Sun, desc: "Clean & bright" },
  { value: "system" as const, label: "System", icon: Monitor, desc: "Match your device" },
];

const schemes = [
  { value: "warm" as const, label: "Warm", icon: Flame, desc: "Gold & amber accents" },
  { value: "cool" as const, label: "Cool", icon: Snowflake, desc: "Teal & cyan accents" },
];

const Settings = () => {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportSessions();
    toast.success("Sessions exported!", { duration: 2000 });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importSessions(file);
      toast.success(`Imported ${result.imported} sessions${result.duplicates ? ` (${result.duplicates} duplicates skipped)` : ''}`, { duration: 3000 });
    } catch {
      toast.error("Invalid file. Please select a valid export file.", { duration: 3000 });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">Customize your experience</p>

      <div className="glass-card p-5 space-y-4 mb-4">
        <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h2>
        <div className="space-y-2">
          {themes.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left",
                theme === value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/30 hover:bg-secondary/60"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                theme === value ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              {theme === value && (
                <div className="ml-auto w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 space-y-4 mb-4">
        <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground">Color Scheme</h2>
        <div className="grid grid-cols-2 gap-3">
          {schemes.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setColorScheme(value)}
              className={cn(
                "flex flex-col items-center gap-3 p-5 rounded-xl border transition-colors text-center",
                colorScheme === value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/30 hover:bg-secondary/60"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                colorScheme === value ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              {colorScheme === value && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground">Data</h2>
        <div className="space-y-3">
          <Button onClick={handleExport} variant="outline" className="w-full gap-2 justify-start h-12 rounded-xl border-border">
            <Download className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-medium">Export Sessions</p>
              <p className="text-xs text-muted-foreground">Download as JSON file</p>
            </div>
          </Button>
          <Button onClick={() => fileRef.current?.click()} variant="outline" className="w-full gap-2 justify-start h-12 rounded-xl border-border">
            <Upload className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-medium">Import Sessions</p>
              <p className="text-xs text-muted-foreground">Load from JSON file</p>
            </div>
          </Button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default Settings;
