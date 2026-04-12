import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { syncSessions, SyncError } from "@/lib/firestoreSync";

const Account = () => {
  const { user, isLoggedIn, signIn, signUp, signOut, isNativePlatform } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Account created! Syncing your data...");
      } else {
        await signIn(email, password);
        toast.success("Signed in! Syncing your data...");
      }
      // Auto-sync after login
      try {
        const result = await syncSessions();
        if (result.skipped) {
          toast.info("Already up to date");
        } else {
          toast.success(`Synced ${result.merged} sessions`);
        }
      } catch (err) {
        if (err instanceof SyncError) {
          toast.error(`Sync error [${err.code}]: ${err.message}`);
        } else {
          toast.error("Sync failed after sign-in");
        }
      }
      navigate("/settings");
    } catch (err: any) {
      toast.error(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out. Your data is still saved locally.");
      navigate("/settings");
    } catch {
      toast.error("Sign out failed");
    }
  };

  if (!isNativePlatform) {
    return (
      <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-display font-bold mb-2">Account</h1>
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">
            Account sync is only available in the Android app. Your data is stored locally in the browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-display font-bold mb-1">Account</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {isLoggedIn ? "Manage your account" : "Sign in to sync your data across devices"}
      </p>

      {isLoggedIn ? (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground mb-3">Signed In</h2>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
          <div className="glass-card p-5 space-y-3">
            <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground mb-1">Sync</h2>
            <Button
              onClick={async () => {
                try {
                  const result = await syncSessions();
                  toast.success(`Synced ${result.merged} sessions`);
                } catch (err) {
                  if (err instanceof SyncError) {
                    toast.error(`Sync error [${err.code}]: ${err.message}`);
                  } else {
                    toast.error("Sync failed unexpectedly");
                  }
                }
              }}
              variant="outline"
              className="w-full h-12 rounded-xl"
            >
              Sync Now
            </Button>
            <Button onClick={handleSignOut} variant="destructive" className="w-full h-12 rounded-xl">
              Sign Out
            </Button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-5">
          <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Button type="submit" className="w-full h-12 rounded-xl gap-2" disabled={loading}>
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Account;
