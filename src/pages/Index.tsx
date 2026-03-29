import { useState, useEffect, useMemo } from "react";
import { getSessions, getTotals, formatMinutes } from "@/lib/sessions";
import { getOverallInsights, Insight } from "@/lib/insights";
import { StatCard } from "@/components/StatCard";
import { AddSessionForm } from "@/components/AddSessionForm";
import { BookOpen, AlertTriangle, Hash, Coffee, CalendarDays, CheckCircle, Info, AlertCircle } from "lucide-react";

const Index = () => {
  const [totals, setTotals] = useState({ totalStudied: 0, totalWasted: 0, totalBreaks: 0, totalSessions: 0 });
  const [sessions, setSessions] = useState<ReturnType<typeof getSessions>>([]);

  const refresh = () => {
    const s = getSessions();
    setSessions(s);
    setTotals(getTotals(s));
  };
  useEffect(refresh, []);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todaySessions = sessions.filter(s => s.date === today);
    return getTotals(todaySessions);
  }, [sessions]);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1">Study Tracker</h1>
      <p className="text-sm text-muted-foreground mb-6">Track your focus, own your time.</p>

      {/* Today's summary */}
      {todayStats.totalSessions > 0 && (
        <div className="glass-card p-4 mb-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">Today</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-studied font-semibold">{formatMinutes(todayStats.totalStudied)} studied</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-wasted font-semibold">{formatMinutes(todayStats.totalWasted)} wasted</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{todayStats.totalSessions} session{todayStats.totalSessions !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
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

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          label="Breaks"
          value={formatMinutes(totals.totalBreaks)}
          icon={<Coffee className="w-5 h-5" />}
          variant="neutral"
        />
        <StatCard
          label="Sessions"
          value={String(totals.totalSessions)}
          icon={<Hash className="w-5 h-5" />}
          variant="neutral"
        />
      </div>

      <AddSessionForm onAdded={refresh} />

      {/* Smart Overview */}
      {sessions.length > 0 && (() => {
        const insights = getOverallInsights(sessions);
        return insights.length > 0 ? (
          <div className="glass-card p-5 mt-6 animate-fade-in">
            <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-3">Overview</p>
            <div className="space-y-2.5">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {insight.type === "success" ? <CheckCircle className="w-4 h-4 text-studied shrink-0 mt-0.5" /> :
                   insight.type === "warning" ? <AlertCircle className="w-4 h-4 text-wasted shrink-0 mt-0.5" /> :
                   <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                  <p className="text-sm text-foreground/80">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
};

export default Index;
