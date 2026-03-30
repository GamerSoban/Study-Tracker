import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { StudySession, formatMinutes } from "@/lib/sessions";
import { Clock, BookOpen, AlertTriangle, Trash2, Coffee, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  session: StudySession;
  onDelete: (id: string) => void;
}

export const SessionCard = memo(function SessionCard({ session, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-4 cursor-pointer" onClick={() => navigate(`/session/${session.id}`)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">{session.date}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {session.startTime} → {session.endTime}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-wasted"
            onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-sm font-medium ml-auto">{formatMinutes(session.totalMinutes)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-studied" />
          <span className="text-xs text-muted-foreground">Study</span>
          <span className="text-sm font-medium text-studied ml-auto">{formatMinutes(session.actualStudyMinutes)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Coffee className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Breaks</span>
          <span className="text-sm font-medium text-primary ml-auto">{formatMinutes(session.totalBreakMinutes || 0)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-wasted" />
          <span className="text-xs text-muted-foreground">Wasted</span>
          <span className="text-sm font-medium text-wasted ml-auto">{formatMinutes(session.wastedMinutes)}</span>
        </div>
      </div>
      {session.breaks && session.breaks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Breaks ({session.breaks.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {session.breaks.map((b, i) => (
              <span key={i} className="text-xs bg-secondary rounded-lg px-2 py-0.5 text-muted-foreground">
                {b.startTime ? `${b.startTime} · ` : ""}{b.durationMinutes}m
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
