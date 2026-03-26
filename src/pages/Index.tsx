import { useState, useEffect } from "react";
import { getSessions, getTotals, formatMinutes } from "@/lib/sessions";
import { StatCard } from "@/components/StatCard";
import { AddSessionForm } from "@/components/AddSessionForm";
import { BookOpen, AlertTriangle, Hash } from "lucide-react";

const Index = () => {
  const [totals, setTotals] = useState({ totalStudied: 0, totalWasted: 0, totalSessions: 0 });

  const refresh = () => setTotals(getTotals(getSessions()));
  useEffect(refresh, []);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1">Study Tracker</h1>
      <p className="text-sm text-muted-foreground mb-6">Track your focus, own your time.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          label="Studied"
          value={formatMinutes(totals.totalStudied)}
          icon={<BookOpen className="w-5 h-5" />}
          variant="studied"
        />
        <StatCard
          label="Wasted"
          value={formatMinutes(totals.totalWasted)}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="wasted"
        />
      </div>

      <StatCard
        label="Total Sessions"
        value={String(totals.totalSessions)}
        icon={<Hash className="w-5 h-5" />}
        variant="neutral"
      />

      <div className="mt-6">
        <AddSessionForm onAdded={refresh} />
      </div>
    </div>
  );
};

export default Index;
