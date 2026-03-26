import { StudySession, formatMinutes } from "@/lib/sessions";
import { Clock, BookOpen, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  session: StudySession;
  onDelete: (id: string) => void;
}

export function SessionCard({ session, onDelete }: Props) {
  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">{session.date}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {session.startTime} → {session.endTime}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-wasted"
          onClick={() => onDelete(session.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
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
          <AlertTriangle className="w-3.5 h-3.5 text-wasted" />
          <span className="text-xs text-muted-foreground">Wasted</span>
          <span className="text-sm font-medium text-wasted ml-auto">{formatMinutes(session.wastedMinutes)}</span>
        </div>
      </div>
    </div>
  );
}
