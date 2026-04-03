import { useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Download, Upload, User, CloudUpload } from "lucide-react";
import { exportSessions, importSessions } from "@/lib/dataTransfer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { syncSessions } from "@/lib/firestoreSync";

const Settings = () => {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();
  const { user, isLoggedIn, isNativePlatform } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportSessions();
    toast.success("Sessions exported as CSV!", { duration: 2000 });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importSessions(file);
      toast.success(`Imported ${result.imported} sessions${result.duplicates ? ` (${result.duplicates} duplicates skipped)` : ''}`, { duration: 3000 });
    } catch {
      toast.error("Invalid file. Please select a valid CSV export file.", { duration: 3000 });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">Customize your experience</p>

      {/* Account Section */}
      <div className="glass-card p-5 space-y-3 mb-4">
        <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
        {isLoggedIn ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Signed in</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  try {
                    const result = await syncSessions();
                    toast.success(`Synced ${result.merged} sessions`);
                  } catch {
                    toast.error("Sync failed");
                  }
                }}
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg"
              >
                <CloudUpload className="w-4 h-4" /> Sync
              </Button>
              <Button onClick={() => navigate("/account")} variant="outline" size="sm" className="rounded-lg">
                Manage
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => navigate("/account")} variant="outline" className="w-full gap-2 justify-start h-12 rounded-xl border-border">
            <User className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-medium">Sign In / Create Account</p>
              <p className="text-xs text-muted-foreground">{isNativePlatform ? "Sync data across devices" : "Available in Android app"}</p>
            </div>
          </Button>
        )}
      </div>

      <div className="glass-card p-5 space-y-4 mb-4">
        <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Theme</label>
            <Select value={theme} onValueChange={(v) => setTheme(v as "dark" | "light" | "system")}>
              <SelectTrigger className="w-36 h-9 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Color Scheme</label>
            <Select value={colorScheme} onValueChange={(v) => setColorScheme(v as "warm" | "cool")}>
              <SelectTrigger className="w-36 h-9 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cool">Cool</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground">Data</h2>
        <div className="space-y-3">
          <Button onClick={handleExport} variant="outline" className="w-full gap-2 justify-start h-12 rounded-xl border-border">
            <Download className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-medium">Export Sessions</p>
              <p className="text-xs text-muted-foreground">Download as CSV file</p>
            </div>
          </Button>
          <Button onClick={() => fileRef.current?.click()} variant="outline" className="w-full gap-2 justify-start h-12 rounded-xl border-border">
            <Upload className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-medium">Import Sessions</p>
              <p className="text-xs text-muted-foreground">Load from CSV file</p>
            </div>
          </Button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default Settings;
