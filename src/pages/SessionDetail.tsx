import { useParams, useNavigate } from "react-router-dom";
import { getSessions, formatMinutes, StudySession } from "@/lib/sessions";
import { getSessionInsights, Insight } from "@/lib/insights";
import { ArrowLeft, Clock, BookOpen, AlertTriangle, Coffee, CheckCircle, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const insightIcon = (type: Insight["type"]) => {
  switch (type) {
    case "success": return <CheckCircle className="w-4 h-4 text-studied shrink-0" />;
    case "warning": return <AlertCircle className="w-4 h-4 text-wasted shrink-0" />;
    case "info": return <Info className="w-4 h-4 text-primary shrink-0" />;
  }
};

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSessions().find(s => s.id === id);

  if (!session) {
    return (
      <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate("/sessions")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <p className="text-muted-foreground">Session not found.</p>
      </div>
    );
  }

  const insights = getSessionInsights(session);
  const studyPercent = session.totalMinutes > 0 ? Math.round((session.actualStudyMinutes / session.totalMinutes) * 100) : 0;
  const wastedPercent = session.totalMinutes > 0 ? Math.round((session.wastedMinutes / session.totalMinutes) * 100) : 0;
  const breakPercent = session.totalMinutes > 0 ? Math.round(((session.totalBreakMinutes || 0) / session.totalMinutes) * 100) : 0;

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate("/sessions")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <h1 className="text-2xl font-display font-bold mb-1">Session Details</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {session.date} · {session.startTime} → {session.endTime}
      </p>

      {/* Time breakdown bar */}
      <div className="glass-card p-5 mb-4 animate-fade-in">
        <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-3">Time Breakdown</p>
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-secondary mb-3">
          <div className="h-full bg-studied transition-all" style={{ width: `${studyPercent}%` }} />
          <div className="h-full bg-primary transition-all" style={{ width: `${breakPercent}%` }} />
          <div className="h-full bg-wasted transition-all" style={{ width: `${wastedPercent}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-studied inline-block" /> Study {studyPercent}%</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Breaks {breakPercent}%</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-wasted inline-block" /> Wasted {wastedPercent}%</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Duration</span>
          </div>
          <p className="text-xl font-bold font-display">{formatMinutes(session.totalMinutes)}</p>
        </div>
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-studied" />
            <span className="text-xs text-muted-foreground">Studied</span>
          </div>
          <p className="text-xl font-bold font-display text-studied">{formatMinutes(session.actualStudyMinutes)}</p>
        </div>
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Coffee className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Breaks</span>
          </div>
          <p className="text-xl font-bold font-display text-primary">{formatMinutes(session.totalBreakMinutes || 0)}</p>
        </div>
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-wasted" />
            <span className="text-xs text-muted-foreground">Wasted</span>
          </div>
          <p className="text-xl font-bold font-display text-wasted">{formatMinutes(session.wastedMinutes)}</p>
        </div>
      </div>

      {/* Efficiency */}
      <div className="glass-card p-5 mb-4 animate-fade-in">
        <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-2">Efficiency Score</p>
        <div className="flex items-center gap-3">
          <Progress value={studyPercent} className="flex-1 h-3" />
          <span className={`text-lg font-bold font-display ${studyPercent >= 70 ? 'text-studied' : studyPercent >= 40 ? 'text-primary' : 'text-wasted'}`}>
            {studyPercent}%
          </span>
        </div>
      </div>

      {/* Breaks detail */}
      {session.breaks && session.breaks.length > 0 && (
        <div className="glass-card p-5 mb-4 animate-fade-in">
          <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Breaks ({session.breaks.length})
          </p>
          <div className="space-y-2">
            {session.breaks.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-secondary/50 rounded-xl px-3 py-2">
                <span className="text-muted-foreground">{b.startTime ? `Started ${b.startTime}` : `Break ${i + 1}`}</span>
                <span className="font-medium">{b.durationMinutes}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="glass-card p-5 animate-fade-in">
          <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-3">Overview</p>
          <div className="space-y-2.5">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5">
                {insightIcon(insight.type)}
                <p className="text-sm text-foreground/80">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetail;
