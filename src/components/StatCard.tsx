import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant: "studied" | "wasted" | "neutral";
}

export function StatCard({ label, value, icon, variant }: StatCardProps) {
  return (
    <div
      className={cn(
        "glass-card p-5 animate-fade-in",
        variant === "studied" && "stat-glow-studied",
        variant === "wasted" && "stat-glow-wasted"
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            variant === "studied" && "bg-studied/20 text-studied",
            variant === "wasted" && "bg-wasted/20 text-wasted",
            variant === "neutral" && "bg-primary/20 text-primary"
          )}
        >
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold font-display">{value}</p>
    </div>
  );
}
