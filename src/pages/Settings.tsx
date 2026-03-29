import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Monitor, Flame, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "dark" as const, label: "Dark", icon: Moon, desc: "Deep & immersive" },
  { value: "light" as const, label: "Light", icon: Sun, desc: "Clean & bright" },
  { value: "system" as const, label: "System", icon: Monitor, desc: "Match your device" },
];

const schemes = [
  { value: "warm" as const, label: "Warm", icon: Flame, desc: "Gold & amber accents", darkPreview: "bg-amber-500", lightPreview: "bg-amber-600" },
  { value: "cool" as const, label: "Cool", icon: Snowflake, desc: "Teal & cyan accents", darkPreview: "bg-teal-400", lightPreview: "bg-blue-500" },
];

const Settings = () => {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();

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
                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
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

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground">Color Scheme</h2>
        <div className="grid grid-cols-2 gap-3">
          {schemes.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setColorScheme(value)}
              className={cn(
                "flex flex-col items-center gap-3 p-5 rounded-xl border transition-all text-center",
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
    </div>
  );
};

export default Settings;
