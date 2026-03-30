import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSessions, getTotals, formatMinutes } from "@/lib/sessions";
import { getOverallInsights } from "@/lib/insights";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { BookOpen, AlertTriangle, Hash, Coffee, CalendarDays, CheckCircle, Info, AlertCircle, Plus } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ReturnType<typeof getSessions>>([]);

  const refresh = useCallback(() => {
    setSessions(getSessions());
  }, []);

  useEffect(refresh, [refresh]);

  const totals = useMemo(() => getTotals(sessions), [sessions]);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return getTotals(sessions.filter(s => s.date === today));
  }, [sessions]);

  const insights = useMemo(() => {
    return sessions.length > 0 ? getOverallInsights(sessions) : [];
  }, [sessions]);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1">Study Tracker</h1>
      <p className="text-sm text-muted-foreground mb-6">Track your focus, own your time.</p>

      {todayStats.totalSessions > 0 && (
        <div className="glass-card p-4 mb-4">
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
        <StatCard label="Studied" value={formatMinutes(totals.totalStudied)} icon={<BookOpen className="w-5 h-5" />} variant="studied" />
        <StatCard label="Wasted" value={formatMinutes(totals.totalWasted)} icon={<AlertTriangle className="w-5 h-5" />} variant="wasted" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Breaks" value={formatMinutes(totals.totalBreaks)} icon={<Coffee className="w-5 h-5" />} variant="neutral" />
        <StatCard label="Sessions" value={String(totals.totalSessions)} icon={<Hash className="w-5 h-5" />} variant="neutral" />
      </div>

      {insights.length > 0 && (
        <div className="glass-card p-5 mb-6">
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
      )}

      <Button onClick={() => navigate("/add-session")} className="w-full gap-2 rounded-xl h-12 text-base font-semibold">
        <Plus className="w-5 h-5" />
        Log Session
      </Button>
    </div>
  );
};

export default Index;
